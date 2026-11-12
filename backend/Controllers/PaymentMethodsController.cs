using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Services;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/payment-methods")]
[AllowAnonymous]
public class PaymentMethodsController(PaymentMethodService paymentMethodService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PaymentMethodDto>>> GetActive() =>
        Ok(await paymentMethodService.GetActiveAsync());
}
