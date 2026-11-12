import { ORDER_FLOW, ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <div className="order-timeline">
      {ORDER_FLOW.map((step, index) => {
        const done = currentIndex >= index;
        const current = currentIndex === index;
        return (
          <div
            key={step}
            className={`order-step${done ? " is-done" : ""}${current ? " is-current" : ""}`}
          >
            <span className="order-step__dot" aria-hidden="true" />
            <span className="d-block text-center">{ORDER_STATUS_LABELS[step]}</span>
          </div>
        );
      })}
    </div>
  );
}
