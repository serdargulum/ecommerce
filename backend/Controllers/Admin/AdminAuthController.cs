using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TatliBisey.Api.Common;
using TatliBisey.Api.Dtos;
using TatliBisey.Api.Services;

namespace TatliBisey.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/auth")]
[Authorize(Roles = "Admin")]
public class AdminAuthController(AuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AdminAuthResponse>> Login([FromBody] LoginRequest request) =>
        Ok(await authService.AdminLoginAsync(request));

    [HttpGet("me")]
    public async Task<ActionResult<AdminDto>> Me() =>
        Ok(await authService.GetAdminAsync(User.GetUserId()));
}
