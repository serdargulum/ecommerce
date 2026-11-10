using System.ComponentModel.DataAnnotations;

namespace TatliBisey.Api.Dtos;

public class RegisterRequest
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(120, ErrorMessage = "Ad soyad en fazla 120 karakter olabilir.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    [MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    [MaxLength(64, ErrorMessage = "Şifre en fazla 64 karakter olabilir.")]
    public string Password { get; set; } = string.Empty;

    [MaxLength(30, ErrorMessage = "Telefon en fazla 30 karakter olabilir.")]
    public string? Phone { get; set; }
}

public class LoginRequest
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    public string Password { get; set; } = string.Empty;
}

public record CustomerDto(int Id, string FullName, string Email, string? Phone, DateTime CreatedAt);

public record AdminDto(int Id, string FullName, string Email);

public record AuthResponse(string Token, CustomerDto Customer);

public record AdminAuthResponse(string Token, AdminDto Admin);
