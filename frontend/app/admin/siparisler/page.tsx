"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/order-status";
import type { OrderStatus, OrderSummary, PagedResult } from "@/lib/types";

export default function AdminOrdersPage() {
  const token = useAdminToken();
  const [orders, setOrders] = useState<PagedResult<OrderSummary> | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "15" });
      if (status) {
        params.set("status", status);
      }
      if (search.trim()) {
        params.set("search", search.trim());
      }
      const result = await apiFetch<PagedResult<OrderSummary>>(
        `/api/admin/orders?${params.toString()}`,
        { token },
      );
      setOrders(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Siparişler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [token, page, status, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab${status === "" ? " is-active" : ""}`}
            onClick={() => {
              setStatus("");
              setPage(1);
            }}
          >
            Tümü
          </button>
          {ORDER_STATUSES.map((item) => (
            <button
              key={item}
              type="button"
              className={`admin-tab${status === item ? " is-active" : ""}`}
              onClick={() => {
                setStatus(item);
                setPage(1);
              }}
            >
              {ORDER_STATUS_LABELS[item]}
            </button>
          ))}
        </div>

        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="Sipariş no, ad veya e-posta ara..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Sipariş ara"
        />
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-card">
        {loading && !orders ? (
          <div className="text-center text-muted py-5">Yükleniyor...</div>
        ) : !orders || orders.items.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-receipt fs-3 d-block mb-2" aria-hidden="true" />
            Bu filtreye uygun sipariş yok.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sipariş</th>
                    <th>Müşteri</th>
                    <th>Tarih</th>
                    <th>Ürün</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Ödeme</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {orders.items.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/admin/siparisler/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td>
                        <div>{order.customerName}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {order.email}
                        </div>
                      </td>
                      <td className="text-muted">{formatDateTime(order.createdAt)}</td>
                      <td className="text-muted">{order.itemCount}</td>
                      <td className="fw-medium">{formatPrice(order.total)}</td>
                      <td>
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td>
                        <div style={{ fontSize: "0.8rem" }}>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</div>
                        <div className="text-muted" style={{ fontSize: "0.74rem" }}>
                          {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                        </div>
                      </td>
                      <td className="text-end">
                        <Link href={`/admin/siparisler/${order.id}`} className="btn admin-btn btn-sm">
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              <span className="small text-muted">
                {orders.total} sipariş · sayfa {orders.page} / {Math.max(1, orders.totalPages)}
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn admin-btn btn-sm"
                  disabled={orders.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Önceki
                </button>
                <button
                  type="button"
                  className="btn admin-btn btn-sm"
                  disabled={orders.page >= orders.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Sonraki
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
