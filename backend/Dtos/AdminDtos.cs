namespace TatliBisey.Api.Dtos;

public record DashboardDto(
    decimal TotalRevenue,
    int OrderCount,
    int PendingOrderCount,
    int ProductCount,
    int CustomerCount,
    int LowStockCount,
    IReadOnlyList<DailySalesDto> Last7Days,
    IReadOnlyList<OrderSummaryDto> RecentOrders,
    IReadOnlyList<TopProductDto> TopProducts);

public record DailySalesDto(string Date, decimal Total, int OrderCount);

public record TopProductDto(string Name, int Quantity, decimal Total);

public record CustomerListItemDto(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    DateTime CreatedAt,
    int OrderCount,
    decimal TotalSpent);

public record CustomerDetailDto(
    int Id,
    string FullName,
    string Email,
    string? Phone,
    DateTime CreatedAt,
    IReadOnlyList<OrderSummaryDto> Orders);

public record UploadResultDto(string Url);
