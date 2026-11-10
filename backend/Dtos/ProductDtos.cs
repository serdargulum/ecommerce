using System.ComponentModel.DataAnnotations;

namespace TatliBisey.Api.Dtos;

public record ProductImageDto(int Id, string Url, int SortOrder);

public record ProductListItemDto(
    int Id,
    string Name,
    string Slug,
    decimal Price,
    decimal? DiscountPrice,
    decimal FinalPrice,
    int Stock,
    string? ImageUrl,
    int CategoryId,
    string CategoryName,
    string CategorySlug,
    bool IsActive,
    DateTime CreatedAt);

public record ProductDetailDto(
    int Id,
    string Name,
    string Slug,
    string Description,
    decimal Price,
    decimal? DiscountPrice,
    decimal FinalPrice,
    int Stock,
    bool IsActive,
    int CategoryId,
    string CategoryName,
    string CategorySlug,
    IReadOnlyList<ProductImageDto> Images,
    DateTime CreatedAt);

public class ProductSaveRequest
{
    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [MaxLength(160, ErrorMessage = "Ürün adı en fazla 160 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ürün açıklaması zorunludur.")]
    [MaxLength(4000, ErrorMessage = "Açıklama en fazla 4000 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 1000000, ErrorMessage = "Fiyat 0'dan büyük olmalıdır.")]
    public decimal Price { get; set; }

    [Range(0.01, 1000000, ErrorMessage = "İndirimli fiyat 0'dan büyük olmalıdır.")]
    public decimal? DiscountPrice { get; set; }

    [Range(0, 100000, ErrorMessage = "Stok 0 ile 100000 arasında olmalıdır.")]
    public int Stock { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Kategori seçilmelidir.")]
    public int CategoryId { get; set; }

    public bool IsActive { get; set; } = true;

    [MaxLength(200, ErrorMessage = "Bir ürün için en fazla 8 görsel eklenebilir.")]
    public List<string> Images { get; set; } = new();

    public string? Slug { get; set; }
}

public record CategoryDto(int Id, string Name, string Slug, bool IsActive, int SortOrder, int ProductCount);

public class CategorySaveRequest
{
    [Required(ErrorMessage = "Kategori adı zorunludur.")]
    [MaxLength(120, ErrorMessage = "Kategori adı en fazla 120 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    [Range(0, 999, ErrorMessage = "Sıra 0 ile 999 arasında olmalıdır.")]
    public int SortOrder { get; set; }

    public string? Slug { get; set; }
}
