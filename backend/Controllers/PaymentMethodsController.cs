using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers;

[ApiController]
[Route("api/payment-methods")]
[AllowAnonymous]
public class PaymentMethodsController(PaymentMethodService paymentMethodService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PaymentMethodDto>>> GetActive() =>
        Ok(await paymentMethodService.GetActiveAsync());
}
