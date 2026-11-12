using System.ComponentModel.DataAnnotations;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Dtos;

public class CreateOrderRequest
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(120)]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefon zorunludur.")]
    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Adres zorunludur.")]
    [MaxLength(600, ErrorMessage = "Adres en fazla 600 karakter olabilir.")]
    public string Address { get; set; } = string.Empty;

    [MaxLength(80)]
    public string? City { get; set; }

    [MaxLength(80)]
    public string? District { get; set; }

    [MaxLength(600)]
    public string? Note { get; set; }

    [Required(ErrorMessage = "Ödeme yöntemi seçilmelidir.")]
    public PaymentMethod? PaymentMethod { get; set; }

    [Required(ErrorMessage = "Sepet boş olamaz.")]
    [MinLength(1, ErrorMessage = "Sepet boş olamaz.")]
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Geçersiz ürün.")]
    public int ProductId { get; set; }

    [Range(1, 99, ErrorMessage = "Adet 1 ile 99 arasında olmalıdır.")]
    public int Quantity { get; set; }
}

public class TrackOrderRequest
{
    [Required(ErrorMessage = "Sipariş numarası zorunludur.")]
    public string OrderNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string Email { get; set; } = string.Empty;
}

public record OrderItemDto(int Id, int? ProductId, string ProductName, string? ImageUrl, decimal UnitPrice, int Quantity, decimal LineTotal);

public record OrderSummaryDto(
    int Id,
    string OrderNumber,
    string CustomerName,
    string Email,
    decimal Total,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    int ItemCount,
    DateTime CreatedAt);

public record OrderDetailDto(
    int Id,
    string OrderNumber,
    int? CustomerId,
    string CustomerName,
    string Email,
    string Phone,
    string Address,
    string? City,
    string? District,
    string? Note,
    decimal Subtotal,
    decimal ShippingTotal,
    decimal Total,
    OrderStatus Status,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    IReadOnlyList<OrderItemDto> Items,
    PaymentMethodDto? PaymentInstructions);

public class UpdateOrderStatusRequest
{
    [Required]
    public OrderStatus? Status { get; set; }
}

public class UpdatePaymentStatusRequest
{
    [Required]
    public PaymentStatus? PaymentStatus { get; set; }
}
