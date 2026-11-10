using TatliBisey.Api.Common;

namespace TatliBisey.Api.Services;

public class ImageStorage(IWebHostEnvironment environment, ILogger<ImageStorage> logger)
{
    private const long MaxBytes = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };

    public async Task<string> SaveAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length == 0)
        {
            throw new BusinessException("Boş dosya yüklenemez.");
        }

        if (file.Length > MaxBytes)
        {
            throw new BusinessException("Görsel boyutu en fazla 5 MB olabilir.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension) || !AllowedContentTypes.Contains(file.ContentType))
        {
            throw new BusinessException("Sadece JPG, PNG veya WEBP formatında görsel yükleyebilirsiniz.");
        }

        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var uploadDirectory = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadDirectory, fileName);

        await using (var stream = File.Create(fullPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        logger.LogInformation("Görsel yüklendi: {FileName} ({Bytes} bayt)", fileName, file.Length);

        return $"/uploads/{fileName}";
    }
}
