using Ecommerce.Api.Common;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Dtos;

public class StoreProductQuery : PageQuery
{
    public string? CategorySlug { get; set; }
    public string? Search { get; set; }
    public string? Sort { get; set; }
}

public class AdminProductQuery : PageQuery
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsActive { get; set; }
}

public class OrderListQuery : PageQuery
{
    public OrderStatus? Status { get; set; }
    public string? Search { get; set; }
}

public class CustomerListQuery : PageQuery
{
    public string? Search { get; set; }
}
