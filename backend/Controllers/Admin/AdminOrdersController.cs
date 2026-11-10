using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Common;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public class AdminOrdersController(OrderService orderService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrderSummaryDto>>> GetAll([FromQuery] OrderListQuery query) =>
        Ok(await orderService.GetAdminPagedAsync(query.Status, query.Search, query));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDetailDto>> GetById(int id) =>
        Ok(await orderService.GetDetailAsync(id));

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request) =>
        Ok(await orderService.UpdateStatusAsync(id, request.Status!.Value));

    [HttpPatch("{id:int}/payment-status")]
    public async Task<ActionResult<OrderDetailDto>> UpdatePaymentStatus(
        int id, [FromBody] UpdatePaymentStatusRequest request) =>
        Ok(await orderService.UpdatePaymentStatusAsync(id, request.PaymentStatus!.Value));
}
