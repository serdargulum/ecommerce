namespace TatliBisey.Api.Models;

public enum OrderStatus
{
    Pending = 1,
    Approved = 2,
    Preparing = 3,
    Shipped = 4,
    Completed = 5,
    Cancelled = 6
}

public enum PaymentMethod
{
    BankTransfer = 1,
    CashOnDelivery = 2,
    CreditCard = 3
}

public enum PaymentStatus
{
    Unpaid = 1,
    AwaitingConfirmation = 2,
    Paid = 3,
    Failed = 4,
    Refunded = 5
}

public enum UserRole
{
    Customer = 1,
    Admin = 2
}
