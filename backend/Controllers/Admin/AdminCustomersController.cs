using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Common;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/customers")]
[Authorize(Roles = "Admin")]
public class AdminCustomersController(CustomerService customerService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<CustomerListItemDto>>> GetAll([FromQuery] CustomerListQuery query) =>
        Ok(await customerService.GetPagedAsync(query.Search, query));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDetailDto>> GetById(int id) =>
        Ok(await customerService.GetByIdAsync(id));
}
