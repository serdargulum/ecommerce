using Microsoft.EntityFrameworkCore;
using TatliBisey.Api.Common;
using TatliBisey.Api.Data;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Models;

namespace TatliBisey.Api.Services;

public class OrderService(
    AppDbContext db,
    PaymentMethodService paymentMethods,
    ILogger<OrderService> logger)
{
    public async Task<OrderDetailDto> CreateAsync(CreateOrderRequest request, int? customerId)
    {
        var method = request.PaymentMethod
            ?? throw new BusinessException("Ödeme yöntemi seçilmelidir.");

        await paymentMethods.EnsureActiveAsync(method);

        var lines = request.Items
            .GroupBy(i => i.ProductId)
            .Select(g => new { ProductId = g.Key, Quantity = g.Sum(i => i.Quantity) })
            .ToList();

        if (lines.Count == 0)
        {
            throw new BusinessException("Sepetinizde ürün bulunmuyor.");
        }

        var productIds = lines.Select(l => l.ProductId).ToList();
        var products = await db.Products
            .Include(p => p.Images)
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();

        if (products.Count != lines.Count)
        {
            throw new BusinessException("Sepetinizdeki bazı ürünler artık mevcut değil. Lütfen sepeti güncelleyin.");
        }

        var items = new List<OrderItem>();

        foreach (var line in lines)
        {
            var product = products.First(p => p.Id == line.ProductId);

            if (!product.IsActive)
            {
                throw new BusinessException($"{product.Name} şu anda satışta değil.");
            }

            if (product.Stock < line.Quantity)
            {
                throw new BusinessException(
                    product.Stock == 0
                        ? $"{product.Name} tükendi."
                        : $"{product.Name} için yeterli stok yok. Kalan: {product.Stock} adet.");
            }

            items.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                ImageUrl = product.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
                UnitPrice = product.FinalPrice,
                Quantity = line.Quantity
            });

            product.Stock -= line.Quantity;
        }

        var subtotal = items.Sum(i => i.UnitPrice * i.Quantity);

        var order = new Order
        {
            OrderNumber = await CreateOrderNumberAsync(),
            CustomerId = customerId,
            CustomerName = request.CustomerName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            Address = request.Address.Trim(),
            City = Clean(request.City),
            District = Clean(request.District),
            Note = Clean(request.Note),
            PaymentMethod = method,
            // Kapıda ödeme ve kredi kartı siparişleri ödeme alınmadan kaydedilir.
            // Sanal POS entegrasyonu eklendiğinde kart ödemesi burada başlatılacak.
            PaymentStatus = PaymentMethodService.InitialPaymentStatus(method),
            Status = OrderStatus.Pending,
            Subtotal = subtotal,
            ShippingTotal = 0,
            Total = subtotal,
            Items = items
        };

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Sipariş oluşturuldu: {OrderNumber}, tutar: {Total}, ödeme: {PaymentMethod}, misafir: {IsGuest}",
            order.OrderNumber, order.Total, order.PaymentMethod, customerId is null);

        return await GetDetailAsync(order.Id);
    }

    public async Task<IReadOnlyList<OrderSummaryDto>> GetMyOrdersAsync(int customerId)
    {
        var orders = await db.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => o.ToSummaryDto()).ToList();
    }

    public async Task<OrderDetailDto> GetMyOrderAsync(int customerId, string orderNumber)
    {
        var order = await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.CustomerId == customerId)
            ?? throw new NotFoundException("Sipariş bulunamadı.");

        return order.ToDetailDto(await paymentMethods.GetDtoAsync(order.PaymentMethod));
    }

    public async Task<OrderDetailDto> TrackAsync(TrackOrderRequest request)
    {
        var orderNumber = request.OrderNumber.Trim().ToUpperInvariant();
        var email = request.Email.Trim().ToLowerInvariant();

        var order = await db.Orders.AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.Email == email)
            ?? throw new NotFoundException("Sipariş bulunamadı. Sipariş numarası ve e-posta adresini kontrol edin.");

        return order.ToDetailDto(await paymentMethods.GetDtoAsync(order.PaymentMethod));
    }

    public async Task<PagedResult<OrderSummaryDto>> GetAdminPagedAsync(
        OrderStatus? status, string? search, PageQuery page)
    {
        var query = db.Orders.AsNoTracking().Include(o => o.Items).AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(o =>
                EF.Functions.ILike(o.OrderNumber, term) ||
                EF.Functions.ILike(o.CustomerName, term) ||
                EF.Functions.ILike(o.Email, term));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page.Page - 1) * page.PageSize)
            .Take(page.PageSize)
            .ToListAsync();

        return new PagedResult<OrderSummaryDto>(
            items.Select(o => o.ToSummaryDto()).ToList(), total, page.Page, page.PageSize);
    }

    public async Task<OrderDetailDto> GetDetailAsync(int id)
    {
        var order = await db.Orders.AsNoTracking().Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NotFoundException("Sipariş bulunamadı.");

        return order.ToDetailDto(await paymentMethods.GetDtoAsync(order.PaymentMethod));
    }

    public async Task<OrderDetailDto> UpdateStatusAsync(int id, OrderStatus status)
    {
        if (!Enum.IsDefined(status))
        {
            throw new BusinessException("Geçersiz sipariş durumu.");
        }

        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NotFoundException("Sipariş bulunamadı.");

        if (order.Status == status)
        {
            return order.ToDetailDto(await paymentMethods.GetDtoAsync(order.PaymentMethod));
        }

        if (status == OrderStatus.Cancelled)
        {
            await RestockAsync(order);
        }
        else if (order.Status == OrderStatus.Cancelled)
        {
            // İptal edilen sipariş yeniden açılırken stok tekrar düşülür.
            await DeductStockAsync(order);
        }

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("Sipariş durumu güncellendi: {OrderNumber} -> {Status}", order.OrderNumber, status);

        return order.ToDetailDto(await paymentMethods.GetDtoAsync(order.PaymentMethod));
    }

    public async Task<OrderDetailDto> UpdatePaymentStatusAsync(int id, PaymentStatus paymentStatus)
    {
        if (!Enum.IsDefined(paymentStatus))
        {
            throw new BusinessException("Geçersiz ödeme durumu.");
        }

        var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NotFoundException("Sipariş bulunamadı.");

        order.PaymentStatus = paymentStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("Sipariş ödeme durumu güncellendi: {OrderNumber} -> {PaymentStatus}",
            order.OrderNumber, paymentStatus);

        return order.ToDetailDto(await paymentMethods.GetDtoAsync(order.PaymentMethod));
    }

    private async Task RestockAsync(Order order)
    {
        var productIds = order.Items.Where(i => i.ProductId.HasValue).Select(i => i.ProductId!.Value).ToList();
        var products = await db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

        foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product is not null)
            {
                product.Stock += item.Quantity;
            }
        }
    }

    private async Task DeductStockAsync(Order order)
    {
        var productIds = order.Items.Where(i => i.ProductId.HasValue).Select(i => i.ProductId!.Value).ToList();
        var products = await db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();

        foreach (var item in order.Items.Where(i => i.ProductId.HasValue))
        {
            var product = products.FirstOrDefault(p => p.Id == item.ProductId);
            if (product is null)
            {
                continue;
            }

            if (product.Stock < item.Quantity)
            {
                throw new BusinessException($"{product.Name} için stok yetersiz. Sipariş yeniden açılamıyor.");
            }

            product.Stock -= item.Quantity;
        }
    }

    private async Task<string> CreateOrderNumberAsync()
    {
        for (var attempt = 0; attempt < 5; attempt++)
        {
            var number = OrderNumber.Create();
            if (!await db.Orders.AnyAsync(o => o.OrderNumber == number))
            {
                return number;
            }
        }

        throw new BusinessException("Sipariş numarası oluşturulamadı, lütfen tekrar deneyin.");
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
