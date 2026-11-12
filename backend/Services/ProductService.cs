using Microsoft.EntityFrameworkCore;
using Ecommerce.Api.Common;
using Ecommerce.Api.Data;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Services;

public class ProductService(AppDbContext db, ILogger<ProductService> logger)
{
    private const int MaxImages = 8;

    public async Task<PagedResult<ProductListItemDto>> GetStoreAsync(
        string? categorySlug, string? search, string? sort, PageQuery page)
    {
        var query = db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive && p.Category.IsActive);

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(p => p.Category.Slug == categorySlug);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Name, term) || EF.Functions.ILike(p.Description, term));
        }

        query = sort switch
        {
            "price-asc" => query.OrderBy(p => p.DiscountPrice ?? p.Price).ThenBy(p => p.Name),
            "price-desc" => query.OrderByDescending(p => p.DiscountPrice ?? p.Price).ThenBy(p => p.Name),
            "name" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.CreatedAt).ThenBy(p => p.Id)
        };

        var total = await query.CountAsync();
        var items = await query
            .Skip((page.Page - 1) * page.PageSize)
            .Take(page.PageSize)
            .ToListAsync();

        return new PagedResult<ProductListItemDto>(
            items.Select(p => p.ToListItemDto()).ToList(), total, page.Page, page.PageSize);
    }

    public async Task<ProductDetailDto> GetBySlugAsync(string slug)
    {
        var product = await BaseQuery()
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive && p.Category.IsActive)
            ?? throw new NotFoundException("Ürün bulunamadı.");

        return product.ToDetailDto();
    }

    public async Task<IReadOnlyList<ProductListItemDto>> GetRelatedAsync(string slug, int take = 4)
    {
        var product = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Slug == slug);
        if (product is null)
        {
            return [];
        }

        var related = await BaseQuery()
            .Where(p => p.CategoryId == product.CategoryId && p.Id != product.Id && p.IsActive)
            .OrderByDescending(p => p.Stock > 0)
            .ThenByDescending(p => p.CreatedAt)
            .Take(take)
            .ToListAsync();

        return related.Select(p => p.ToListItemDto()).ToList();
    }

    public async Task<PagedResult<ProductListItemDto>> GetAdminAsync(
        string? search, int? categoryId, bool? isActive, PageQuery page)
    {
        var query = BaseQuery();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Name, term));
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId);
        }

        if (isActive.HasValue)
        {
            query = query.Where(p => p.IsActive == isActive);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page.Page - 1) * page.PageSize)
            .Take(page.PageSize)
            .ToListAsync();

        return new PagedResult<ProductListItemDto>(
            items.Select(p => p.ToListItemDto()).ToList(), total, page.Page, page.PageSize);
    }

    public async Task<ProductDetailDto> GetAdminByIdAsync(int id)
    {
        var product = await BaseQuery().FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("Ürün bulunamadı.");

        return product.ToDetailDto();
    }

    public async Task<ProductDetailDto> CreateAsync(ProductSaveRequest request)
    {
        await ValidateAsync(request);

        var product = new Product
        {
            Name = request.Name.Trim(),
            Slug = await BuildUniqueSlugAsync(request.Name, request.Slug),
            Description = request.Description.Trim(),
            Price = request.Price,
            DiscountPrice = request.DiscountPrice,
            Stock = request.Stock,
            IsActive = request.IsActive,
            CategoryId = request.CategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Images = BuildImages(request.Images)
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        logger.LogInformation("Ürün oluşturuldu: {ProductId} ({Name})", product.Id, product.Name);

        return await GetAdminByIdAsync(product.Id);
    }

    public async Task<ProductDetailDto> UpdateAsync(int id, ProductSaveRequest request)
    {
        await ValidateAsync(request);

        var product = await db.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("Ürün bulunamadı.");

        product.Name = request.Name.Trim();
        product.Slug = await BuildUniqueSlugAsync(request.Name, request.Slug, id);
        product.Description = request.Description.Trim();
        product.Price = request.Price;
        product.DiscountPrice = request.DiscountPrice;
        product.Stock = request.Stock;
        product.IsActive = request.IsActive;
        product.CategoryId = request.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        db.ProductImages.RemoveRange(product.Images);
        product.Images = BuildImages(request.Images);

        await db.SaveChangesAsync();

        logger.LogInformation("Ürün güncellendi: {ProductId} ({Name})", product.Id, product.Name);

        return await GetAdminByIdAsync(product.Id);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new NotFoundException("Ürün bulunamadı.");

        db.Products.Remove(product);
        await db.SaveChangesAsync();

        logger.LogInformation("Ürün silindi: {ProductId} ({Name})", id, product.Name);
    }

    private IQueryable<Product> BaseQuery() => db.Products
        .AsNoTracking()
        .Include(p => p.Category)
        .Include(p => p.Images);

    private async Task ValidateAsync(ProductSaveRequest request)
    {
        if (request.DiscountPrice.HasValue && request.DiscountPrice.Value >= request.Price)
        {
            throw new BusinessException("İndirimli fiyat, normal satış fiyatından küçük olmalıdır.");
        }

        if (!await db.Categories.AnyAsync(c => c.Id == request.CategoryId))
        {
            throw new BusinessException("Seçilen kategori bulunamadı.");
        }

        var images = NormalizeImages(request.Images);
        if (images.Count == 0)
        {
            throw new BusinessException("Ürün için en az bir görsel eklemelisiniz.");
        }

        if (images.Count > MaxImages)
        {
            throw new BusinessException($"Bir ürün için en fazla {MaxImages} görsel eklenebilir.");
        }
    }

    private static List<ProductImage> BuildImages(IEnumerable<string> urls) =>
        NormalizeImages(urls)
            .Select((url, index) => new ProductImage { Url = url, SortOrder = index })
            .ToList();

    private static List<string> NormalizeImages(IEnumerable<string> urls) => urls
        .Where(url => !string.IsNullOrWhiteSpace(url))
        .Select(url => url.Trim())
        .Distinct()
        .Where(url => url.Length <= 500)
        .ToList();

    private async Task<string> BuildUniqueSlugAsync(string name, string? requestedSlug, int? excludeId = null)
    {
        var baseSlug = SlugHelper.Create(string.IsNullOrWhiteSpace(requestedSlug) ? name : requestedSlug);
        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "urun";
        }

        var slug = baseSlug;
        var suffix = 2;
        while (await db.Products.AnyAsync(p => p.Slug == slug && p.Id != excludeId))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }
}
