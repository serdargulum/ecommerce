using Microsoft.EntityFrameworkCore;
using TatliBisey.Api.Data;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Models;

namespace TatliBisey.Api.Services;

public class DashboardService(AppDbContext db)
{
    public async Task<DashboardDto> GetAsync()
    {
        var activeOrders = db.Orders.AsNoTracking().Where(o => o.Status != OrderStatus.Cancelled);

        var totalRevenue = await activeOrders.SumAsync(o => (decimal?)o.Total) ?? 0;
        var orderCount = await db.Orders.CountAsync();
        var pendingOrderCount = await db.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
        var productCount = await db.Products.CountAsync();
        var customerCount = await db.Customers.CountAsync();
        var lowStockCount = await db.Products.CountAsync(p => p.IsActive && p.Stock <= 5);

        var since = DateTime.UtcNow.Date.AddDays(-6);
        var dailyOrders = await activeOrders
            .Where(o => o.CreatedAt >= since)
            .Select(o => new { o.CreatedAt, o.Total })
            .ToListAsync();

        var last7Days = Enumerable.Range(0, 7)
            .Select(offset => since.AddDays(offset))
            .Select(day => new DailySalesDto(
                day.ToString("dd.MM"),
                dailyOrders.Where(o => o.CreatedAt.Date == day).Sum(o => o.Total),
                dailyOrders.Count(o => o.CreatedAt.Date == day)))
            .ToList();

        var recentOrders = await db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(6)
            .ToListAsync();

        var topProductRows = await db.OrderItems
            .AsNoTracking()
            .Where(i => i.Order.Status != OrderStatus.Cancelled)
            .GroupBy(i => i.ProductName)
            .Select(g => new
            {
                Name = g.Key,
                Quantity = g.Sum(i => i.Quantity),
                Total = g.Sum(i => i.UnitPrice * i.Quantity)
            })
            .OrderByDescending(p => p.Quantity)
            .Take(5)
            .ToListAsync();

        var topProducts = topProductRows
            .Select(p => new TopProductDto(p.Name, p.Quantity, p.Total))
            .ToList();

        return new DashboardDto(
            totalRevenue,
            orderCount,
            pendingOrderCount,
            productCount,
            customerCount,
            lowStockCount,
            last7Days,
            recentOrders.Select(o => o.ToSummaryDto()).ToList(),
            topProducts);
    }
}
