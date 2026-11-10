using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers;

[ApiController]
[Route("api/categories")]
[AllowAnonymous]
public class CategoriesController(CategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll() =>
        Ok(await categoryService.GetStoreCategoriesAsync());
}
