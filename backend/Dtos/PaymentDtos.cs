using System.ComponentModel.DataAnnotations;
using TatliBisey.Api.Models;

namespace TatliBisey.Api.Dtos;

public record PaymentMethodDto(
    PaymentMethod Method,
    string Name,
    string Description,
    bool IsActive,
    string? BankName,
    string? Iban,
    string? AccountHolder,
    string? Instructions,
    int SortOrder);

public class UpdatePaymentMethodRequest
{
    public bool IsActive { get; set; }

    [MaxLength(120, ErrorMessage = "Banka adı en fazla 120 karakter olabilir.")]
    public string? BankName { get; set; }

    [MaxLength(40, ErrorMessage = "IBAN en fazla 40 karakter olabilir.")]
    public string? Iban { get; set; }

    [MaxLength(160, ErrorMessage = "Hesap sahibi en fazla 160 karakter olabilir.")]
    public string? AccountHolder { get; set; }

    [MaxLength(1000, ErrorMessage = "Açıklama en fazla 1000 karakter olabilir.")]
    public string? Instructions { get; set; }
}
