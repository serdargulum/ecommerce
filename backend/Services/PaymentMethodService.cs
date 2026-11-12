using Microsoft.EntityFrameworkCore;
using Ecommerce.Api.Common;
using Ecommerce.Api.Data;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Services;

public class PaymentMethodService(AppDbContext db, ILogger<PaymentMethodService> logger)
{
    private static readonly Dictionary<PaymentMethod, (string Name, string Description)> Metadata = new()
    {
        [PaymentMethod.BankTransfer] = ("Havale / EFT",
            "Siparişiniz onaylandıktan sonra banka hesabımıza havale yapabilirsiniz."),
        [PaymentMethod.CashOnDelivery] = ("Kapıda Ödeme",
            "Sipariş tutarını teslimatta nakit veya kredi kartı ile ödeyin."),
        [PaymentMethod.CreditCard] = ("Kredi Kartı",
            "Sanal POS altyapısı bağlandığında bu yöntemle anında ödeme alınacaktır.")
    };

    public async Task<IReadOnlyList<PaymentMethodDto>> GetActiveAsync()
    {
        var settings = await db.PaymentMethodSettings
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        return settings.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<PaymentMethodDto>> GetAllAsync()
    {
        var settings = await db.PaymentMethodSettings
            .AsNoTracking()
            .OrderBy(s => s.SortOrder)
            .ToListAsync();

        return settings.Select(ToDto).ToList();
    }

    public async Task<PaymentMethodDto> UpdateAsync(PaymentMethod method, UpdatePaymentMethodRequest request)
    {
        var setting = await db.PaymentMethodSettings.FirstOrDefaultAsync(s => s.Method == method)
            ?? throw new NotFoundException("Ödeme yöntemi bulunamadı.");

        setting.IsActive = request.IsActive;
        setting.BankName = Clean(request.BankName);
        setting.Iban = Clean(request.Iban);
        setting.AccountHolder = Clean(request.AccountHolder);
        setting.Instructions = Clean(request.Instructions);
        setting.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        logger.LogInformation("Ödeme yöntemi güncellendi: {Method}, aktif: {IsActive}", method, setting.IsActive);

        return ToDto(setting);
    }

    public async Task EnsureActiveAsync(PaymentMethod method)
    {
        var setting = await db.PaymentMethodSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Method == method);

        if (setting is null || !setting.IsActive)
        {
            var name = Metadata.TryGetValue(method, out var meta) ? meta.Name : method.ToString();
            throw new BusinessException($"{name} şu anda kullanılamıyor. Lütfen başka bir ödeme yöntemi seçin.");
        }
    }

    /// <summary>Ödeme yöntemine göre siparişin başlangıç ödeme durumu.</summary>
    public static PaymentStatus InitialPaymentStatus(PaymentMethod method) => method switch
    {
        PaymentMethod.BankTransfer => PaymentStatus.AwaitingConfirmation,
        _ => PaymentStatus.Unpaid
    };

    public async Task<PaymentMethodDto?> GetDtoAsync(PaymentMethod method)
    {
        var setting = await db.PaymentMethodSettings.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Method == method);

        return setting is null ? null : ToDto(setting);
    }

    private static PaymentMethodDto ToDto(PaymentMethodSetting setting)
    {
        var meta = Metadata[setting.Method];
        return new PaymentMethodDto(
            setting.Method,
            meta.Name,
            meta.Description,
            setting.IsActive,
            setting.BankName,
            setting.Iban,
            setting.AccountHolder,
            setting.Instructions,
            setting.SortOrder);
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
