using System.Security.Claims;

namespace Ecommerce.Api.Common;

public static class ClaimsExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return int.TryParse(value, out var id)
            ? id
            : throw new UnauthorizedException("Oturum bilgisi geçersiz.");
    }
}
