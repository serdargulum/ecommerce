const priceFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Istanbul",
});

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function discountPercent(price: number, finalPrice: number): number | null {
  if (finalPrice >= price || price <= 0) {
    return null;
  }
  return Math.round(((price - finalPrice) / price) * 100);
}

export function stockLabel(stock: number): string {
  if (stock <= 0) {
    return "Tükendi";
  }
  if (stock <= 5) {
    return `Son ${stock} adet`;
  }
  return "Stokta var";
}
