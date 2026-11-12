using Microsoft.EntityFrameworkCore;
using Ecommerce.Api.Common;
using Ecommerce.Api.Data;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Services;

public class CategoryService(AppDbContext db)
{
    public async Task<IReadOnlyList<CategoryDto>> GetStoreCategoriesAsync()
    {
        return await db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Slug, c.IsActive, c.SortOrder,
                c.Products.Count(p => p.IsActive)))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
    {
        return await db.Categories
            .AsNoTracking()
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id, c.Name, c.Slug, c.IsActive, c.SortOrder,
                c.Products.Count()))
            .ToListAsync();
    }

    public async Task<CategoryDto> CreateAsync(CategorySaveRequest request)
    {
        var slug = await BuildUniqueSlugAsync(request.Name, request.Slug);
        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = slug,
            IsActive = request.IsActive,
            SortOrder = request.SortOrder
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();

        return category.ToDto(0);
    }

    public async Task<CategoryDto> UpdateAsync(int id, CategorySaveRequest request)
    {
        var category = await db.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException("Kategori bulunamadı.");

        category.Name = request.Name.Trim();
        category.Slug = await BuildUniqueSlugAsync(request.Name, request.Slug, id);
        category.IsActive = request.IsActive;
        category.SortOrder = request.SortOrder;

        await db.SaveChangesAsync();

        return category.ToDto(category.Products.Count);
    }

    public async Task DeleteAsync(int id)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException("Kategori bulunamadı.");

        if (await db.Products.AnyAsync(p => p.CategoryId == id))
        {
            throw new BusinessException("Bu kategoride ürünler var. Önce ürünleri başka bir kategoriye taşıyın.");
        }

        db.Categories.Remove(category);
        await db.SaveChangesAsync();
    }

    private async Task<string> BuildUniqueSlugAsync(string name, string? requestedSlug, int? excludeId = null)
    {
        var baseSlug = SlugHelper.Create(string.IsNullOrWhiteSpace(requestedSlug) ? name : requestedSlug);
        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "kategori";
        }

        var slug = baseSlug;
        var suffix = 2;
        while (await db.Categories.AnyAsync(c => c.Slug == slug && c.Id != excludeId))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }
}
