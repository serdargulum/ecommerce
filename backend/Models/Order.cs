namespace Ecommerce.Api.Models;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;

    /// <summary>Misafir siparişlerinde boştur.</summary>
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Note { get; set; }

    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public OrderStatus Status { get; set; }

    public decimal Subtotal { get; set; }
    public decimal ShippingTotal { get; set; }
    public decimal Total { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    /// <summary>Ürün silinse bile sipariş geçmişi korunur.</summary>
    public int? ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>Sipariş anındaki ürün bilgilerinin kopyası.</summary>
    public string ProductName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }

    public decimal LineTotal => UnitPrice * Quantity;
}
