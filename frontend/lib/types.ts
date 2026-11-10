export type OrderStatus =
  | "Pending"
  | "Approved"
  | "Preparing"
  | "Shipped"
  | "Completed"
  | "Cancelled";

export type PaymentMethod = "BankTransfer" | "CashOnDelivery" | "CreditCard";

export type PaymentStatus = "Unpaid" | "AwaitingConfirmation" | "Paid" | "Failed" | "Refunded";

export interface ProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  finalPrice: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  finalPrice: number;
  stock: number;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  images: ProductImage[];
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface Admin {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

export interface AdminAuthResponse {
  token: string;
  admin: Admin;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummary {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string | null;
  district: string | null;
  note: string | null;
  subtotal: number;
  shippingTotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string | null;
  items: OrderItem[];
  paymentInstructions: PaymentMethodInfo | null;
}

export interface PaymentMethodInfo {
  method: PaymentMethod;
  name: string;
  description: string;
  isActive: boolean;
  bankName: string | null;
  iban: string | null;
  accountHolder: string | null;
  instructions: string | null;
  sortOrder: number;
}

export interface CustomerListItem {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface DailySales {
  date: string;
  total: number;
  orderCount: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

export interface Dashboard {
  totalRevenue: number;
  orderCount: number;
  pendingOrderCount: number;
  productCount: number;
  customerCount: number;
  lowStockCount: number;
  last7Days: DailySales[];
  recentOrders: OrderSummary[];
  topProducts: TopProduct[];
}

export interface ProductSaveRequest {
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  categoryId: number;
  isActive: boolean;
  images: string[];
  slug?: string | null;
}

export interface CategorySaveRequest {
  name: string;
  isActive: boolean;
  sortOrder: number;
  slug?: string | null;
}
