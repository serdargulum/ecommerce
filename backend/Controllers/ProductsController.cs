using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommerce.Api.Common;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Services;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/products")]
[AllowAnonymous]
public class ProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> GetAll([FromQuery] StoreProductQuery query) =>
        Ok(await productService.GetStoreAsync(query.CategorySlug, query.Search, query.Sort, query));

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetBySlug(string slug) =>
        Ok(await productService.GetBySlugAsync(slug));

    [HttpGet("{slug}/related")]
    public async Task<ActionResult<IReadOnlyList<ProductListItemDto>>> GetRelated(string slug) =>
        Ok(await productService.GetRelatedAsync(slug));
}
