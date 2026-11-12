using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Services;

public static class Mapping
{
    public static CustomerDto ToDto(this Customer customer) =>
        new(customer.Id, customer.FullName, customer.Email, customer.Phone, customer.CreatedAt);

    public static AdminDto ToDto(this AdminUser admin) =>
        new(admin.Id, admin.FullName, admin.Email);

    public static CategoryDto ToDto(this Category category, int productCount) =>
        new(category.Id, category.Name, category.Slug, category.IsActive, category.SortOrder, productCount);

    public static ProductListItemDto ToListItemDto(this Product product) => new(
        product.Id,
        product.Name,
        product.Slug,
        product.Price,
        product.DiscountPrice,
        product.FinalPrice,
        product.Stock,
        product.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).FirstOrDefault(),
        product.CategoryId,
        product.Category.Name,
        product.Category.Slug,
        product.IsActive,
        product.CreatedAt);

    public static ProductDetailDto ToDetailDto(this Product product) => new(
        product.Id,
        product.Name,
        product.Slug,
        product.Description,
        product.Price,
        product.DiscountPrice,
        product.FinalPrice,
        product.Stock,
        product.IsActive,
        product.CategoryId,
        product.Category.Name,
        product.Category.Slug,
        product.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(i.Id, i.Url, i.SortOrder)).ToList(),
        product.CreatedAt);

    public static OrderItemDto ToDto(this OrderItem item) =>
        new(item.Id, item.ProductId, item.ProductName, item.ImageUrl, item.UnitPrice, item.Quantity, item.LineTotal);

    public static OrderSummaryDto ToSummaryDto(this Order order) => new(
        order.Id,
        order.OrderNumber,
        order.CustomerName,
        order.Email,
        order.Total,
        order.Status,
        order.PaymentMethod,
        order.PaymentStatus,
        order.Items.Sum(i => i.Quantity),
        order.CreatedAt);

    public static OrderDetailDto ToDetailDto(this Order order, PaymentMethodDto? paymentInstructions) => new(
        order.Id,
        order.OrderNumber,
        order.CustomerId,
        order.CustomerName,
        order.Email,
        order.Phone,
        order.Address,
        order.City,
        order.District,
        order.Note,
        order.Subtotal,
        order.ShippingTotal,
        order.Total,
        order.Status,
        order.PaymentMethod,
        order.PaymentStatus,
        order.CreatedAt,
        order.UpdatedAt,
        order.Items.Select(i => i.ToDto()).ToList(),
        paymentInstructions);

    public static CustomerListItemDto ToListItemDto(this Customer customer, int orderCount, decimal totalSpent) =>
        new(customer.Id, customer.FullName, customer.Email, customer.Phone, customer.CreatedAt, orderCount, totalSpent);
}
