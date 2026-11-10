using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Common;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public class AdminProductsController(ProductService productService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductListItemDto>>> GetAll([FromQuery] AdminProductQuery query) =>
        Ok(await productService.GetAdminAsync(query.Search, query.CategoryId, query.IsActive, query));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(int id) =>
        Ok(await productService.GetAdminByIdAsync(id));

    [HttpPost]
    public async Task<ActionResult<ProductDetailDto>> Create([FromBody] ProductSaveRequest request)
    {
        var product = await productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDetailDto>> Update(int id, [FromBody] ProductSaveRequest request) =>
        Ok(await productService.UpdateAsync(id, request));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await productService.DeleteAsync(id);
        return NoContent();
    }
}
