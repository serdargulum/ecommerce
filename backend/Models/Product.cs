namespace Ecommerce.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>Normal satış fiyatı.</summary>
    public decimal Price { get; set; }

    /// <summary>İndirimli fiyat. Boşsa indirim yoktur.</summary>
    public decimal? DiscountPrice { get; set; }

    public int Stock { get; set; }
    public bool IsActive { get; set; } = true;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public List<ProductImage> Images { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Sipariş ve sepet hesaplarında kullanılan efektif fiyat.</summary>
    public decimal FinalPrice => DiscountPrice.HasValue && DiscountPrice.Value > 0 && DiscountPrice.Value < Price
        ? DiscountPrice.Value
        : Price;

    public bool IsOnSale => FinalPrice < Price;
}

public class ProductImage
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
