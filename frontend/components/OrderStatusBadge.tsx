import { ORDER_STATUS_CLASS, ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge-status ${ORDER_STATUS_CLASS[status]}`}>{ORDER_STATUS_LABELS[status]}</span>;
}
