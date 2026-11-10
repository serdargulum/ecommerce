namespace TatliBisey.Api.Models;

/// <summary>Ödeme yöntemlerinin aktiflik ve havale bilgileri.</summary>
public class PaymentMethodSetting
{
    public int Id { get; set; }
    public PaymentMethod Method { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }

    public string? BankName { get; set; }
    public string? Iban { get; set; }
    public string? AccountHolder { get; set; }
    public string? Instructions { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
