using System.Text.Json;
using TatliBisey.Api.Common;

namespace TatliBisey.Api.Middleware;

/// <summary>Tüm hataları tutarlı bir JSON gövdesine dönüştürür ve sunucu hatalarını loglar.</summary>
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (BusinessException ex)
        {
            logger.LogWarning("İş kuralı hatası: {Message} ({Path})", ex.Message, context.Request.Path);
            await WriteAsync(context, StatusCodes.Status400BadRequest, ex.Message);
        }
        catch (NotFoundException ex)
        {
            logger.LogInformation("Kayıt bulunamadı: {Message} ({Path})", ex.Message, context.Request.Path);
            await WriteAsync(context, StatusCodes.Status404NotFound, ex.Message);
        }
        catch (UnauthorizedException ex)
        {
            await WriteAsync(context, StatusCodes.Status401Unauthorized, ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Beklenmeyen hata: {Path}", context.Request.Path);
            await WriteAsync(context, StatusCodes.Status500InternalServerError, "Beklenmeyen bir hata oluştu.");
        }
    }

    private static async Task WriteAsync(HttpContext context, int statusCode, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        var payload = JsonSerializer.Serialize(new { message }, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(payload);
    }
}
