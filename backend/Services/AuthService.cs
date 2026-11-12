using Microsoft.EntityFrameworkCore;
using Ecommerce.Api.Common;
using Ecommerce.Api.Data;
using Ecommerce.Api.Dtos;
using Ecommerce.Api.Models;

namespace Ecommerce.Api.Services;

public class AuthService(AppDbContext db, TokenService tokenService, ILogger<AuthService> logger)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var email = NormalizeEmail(request.Email);

        if (await db.Customers.AnyAsync(c => c.Email == email))
        {
            throw new BusinessException("Bu e-posta adresi ile kayıtlı bir hesap bulunuyor.");
        }

        var customer = new Customer
        {
            FullName = request.FullName.Trim(),
            Email = email,
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        db.Customers.Add(customer);
        await db.SaveChangesAsync();

        logger.LogInformation("Yeni müşteri kaydı: {CustomerId} ({Email})", customer.Id, customer.Email);

        return new AuthResponse(
            tokenService.CreateToken(customer.Id, customer.Email, customer.FullName, UserRole.Customer),
            customer.ToDto());
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Email == email);

        if (customer is null || !BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash))
        {
            logger.LogWarning("Başarısız müşteri girişi: {Email}", email);
            throw new UnauthorizedException("E-posta veya şifre hatalı.");
        }

        return new AuthResponse(
            tokenService.CreateToken(customer.Id, customer.Email, customer.FullName, UserRole.Customer),
            customer.ToDto());
    }

    public async Task<AdminAuthResponse> AdminLoginAsync(LoginRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var admin = await db.AdminUsers.FirstOrDefaultAsync(a => a.Email == email);

        if (admin is null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
        {
            logger.LogWarning("Başarısız yönetici girişi: {Email}", email);
            throw new UnauthorizedException("E-posta veya şifre hatalı.");
        }

        return new AdminAuthResponse(
            tokenService.CreateToken(admin.Id, admin.Email, admin.FullName, UserRole.Admin),
            admin.ToDto());
    }

    public async Task<CustomerDto> GetCustomerAsync(int customerId)
    {
        var customer = await db.Customers.FindAsync(customerId)
            ?? throw new NotFoundException("Müşteri bulunamadı.");

        return customer.ToDto();
    }

    public async Task<AdminDto> GetAdminAsync(int adminId)
    {
        var admin = await db.AdminUsers.FindAsync(adminId)
            ?? throw new NotFoundException("Yönetici bulunamadı.");

        return admin.ToDto();
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
