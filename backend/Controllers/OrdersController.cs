using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommerce.Api.Common;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Services;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(OrderService orderService) : ControllerBase
{
    /// <summary>Misafir veya giriş yapmış müşteri siparişi oluşturur.</summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<OrderDetailDto>> Create([FromBody] CreateOrderRequest request)
    {
        int? customerId = User.Identity?.IsAuthenticated == true && User.IsInRole("Customer")
            ? User.GetUserId()
            : null;

        return Ok(await orderService.CreateAsync(request, customerId));
    }

    [HttpGet]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<IReadOnlyList<OrderSummaryDto>>> MyOrders() =>
        Ok(await orderService.GetMyOrdersAsync(User.GetUserId()));

    [HttpGet("{orderNumber}")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<OrderDetailDto>> MyOrder(string orderNumber) =>
        Ok(await orderService.GetMyOrderAsync(User.GetUserId(), orderNumber));

    /// <summary>Sipariş numarası ve e-posta ile misafir sipariş takibi.</summary>
    [HttpPost("track")]
    [AllowAnonymous]
    public async Task<ActionResult<OrderDetailDto>> Track([FromBody] TrackOrderRequest request) =>
        Ok(await orderService.TrackAsync(request));
}
