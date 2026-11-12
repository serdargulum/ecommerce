using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;
using Ecommerce.Api.Services;

namespace Ecommerce.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/payment-methods")]
[Authorize(Roles = "Admin")]
public class AdminPaymentsController(PaymentMethodService paymentMethodService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PaymentMethodDto>>> GetAll() =>
        Ok(await paymentMethodService.GetAllAsync());

    [HttpPut("{method}")]
    public async Task<ActionResult<PaymentMethodDto>> Update(
        PaymentMethod method, [FromBody] UpdatePaymentMethodRequest request) =>
        Ok(await paymentMethodService.UpdateAsync(method, request));
}
