import type { OrderStatus, PaymentMethod, PaymentStatus } from "./types";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Approved",
  "Preparing",
  "Shipped",
  "Completed",
  "Cancelled",
];

export const ORDER_FLOW: OrderStatus[] = ["Pending", "Approved", "Preparing", "Shipped", "Completed"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: "Beklemede",
  Approved: "Onaylandı",
  Preparing: "Hazırlanıyor",
  Shipped: "Kargoya Verildi",
  Completed: "Tamamlandı",
  Cancelled: "İptal Edildi",
};

export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  Pending: "badge-pending",
  Approved: "badge-approved",
  Preparing: "badge-preparing",
  Shipped: "badge-shipped",
  Completed: "badge-completed",
  Cancelled: "badge-cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  Unpaid: "Ödeme Bekliyor",
  AwaitingConfirmation: "Havale Onayı Bekliyor",
  Paid: "Ödendi",
  Failed: "Başarısız",
  Refunded: "İade Edildi",
};

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "Unpaid",
  "AwaitingConfirmation",
  "Paid",
  "Failed",
  "Refunded",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BankTransfer: "Havale / EFT",
  CashOnDelivery: "Kapıda Ödeme",
  CreditCard: "Kredi Kartı",
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  BankTransfer: "bi-bank",
  CashOnDelivery: "bi-cash-coin",
  CreditCard: "bi-credit-card",
};
