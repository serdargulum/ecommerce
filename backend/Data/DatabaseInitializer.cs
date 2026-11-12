using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Api.Data;

public static class DatabaseInitializer
{
    /// <summary>Docker ortamında PostgreSQL hazır olana kadar birkaç kez dener, sonra migration ve seed çalıştırır.</summary>
    public static async Task InitializeAsync(AppDbContext db, ILogger logger, CancellationToken cancellationToken = default)
    {
        const int maxAttempts = 12;

        for (var attempt = 1; ; attempt++)
        {
            try
            {
                await db.Database.MigrateAsync(cancellationToken);
                break;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                logger.LogWarning(
                    "Veritabanına bağlanılamadı ({Attempt}/{Max}), 3 saniye sonra tekrar denenecek: {Message}",
                    attempt, maxAttempts, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(3), cancellationToken);
            }
        }

        await DbSeeder.SeedAsync(db, logger);
    }
}
