using Microsoft.EntityFrameworkCore;
using Ecommerce.Api.Common;
using Ecommerce.Api.Data;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Services;

public class CustomerService(AppDbContext db)
{
    public async Task<PagedResult<CustomerListItemDto>> GetPagedAsync(string? search, PageQuery page)
    {
        var query = db.Customers.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(c => EF.Functions.ILike(c.FullName, term) || EF.Functions.ILike(c.Email, term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page.Page - 1) * page.PageSize)
            .Take(page.PageSize)
            .Select(c => new CustomerListItemDto(
                c.Id,
                c.FullName,
                c.Email,
                c.Phone,
                c.CreatedAt,
                c.Orders.Count(),
                c.Orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => (decimal?)o.Total) ?? 0))
            .ToListAsync();

        return new PagedResult<CustomerListItemDto>(items, total, page.Page, page.PageSize);
    }

    public async Task<CustomerDetailDto> GetByIdAsync(int id)
    {
        var customer = await db.Customers
            .AsNoTracking()
            .Include(c => c.Orders).ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NotFoundException("Müşteri bulunamadı.");

        return new CustomerDetailDto(
            customer.Id,
            customer.FullName,
            customer.Email,
            customer.Phone,
            customer.CreatedAt,
            customer.Orders.OrderByDescending(o => o.CreatedAt).Select(o => o.ToSummaryDto()).ToList());
    }
}
