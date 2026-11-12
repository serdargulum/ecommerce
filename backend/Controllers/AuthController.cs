using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ecommerce.Api.Common;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Services;

namespace Ecommerce.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request) =>
        Ok(await authService.RegisterAsync(request));

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request) =>
        Ok(await authService.LoginAsync(request));

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<ActionResult<CustomerDto>> Me() =>
        Ok(await authService.GetCustomerAsync(User.GetUserId()));
}
