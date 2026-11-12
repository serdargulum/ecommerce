"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PAYMENT_STATUS_LABELS } from "@/lib/order-status";
import type { Dashboard } from "@/lib/types";

export default function AdminDashboardPage() {
  const token = useAdminToken();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    apiFetch<Dashboard>("/api/admin/dashboard", { token })
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Panel verileri yüklenemedi."),
      );
  }, [token]);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-card text-center text-muted py-5">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Panel verileri yükleniyor...
      </div>
    );
  }

  const weekTotal = data.last7Days.reduce((sum, day) => sum + day.total, 0);
  const maxDay = Math.max(...data.last7Days.map((day) => day.total), 1);

  return (
    <>
      <div className="row g-3 mb-3">
        <div className="col-6 col-xl-3">
          <div className="admin-stat">
            <div className="admin-stat__label">Toplam ciro</div>
            <div className="admin-stat__value">{formatPrice(data.totalRevenue)}</div>
            <div className="admin-stat__hint">İptal edilen siparişler hariç</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="admin-stat">
            <div className="admin-stat__label">Siparişler</div>
            <div className="admin-stat__value">{data.orderCount}</div>
            <div className="admin-stat__hint">
              {data.pendingOrderCount > 0 ? (
                <span className="text-danger">{data.pendingOrderCount} sipariş beklemede</span>
              ) : (
                "Bekleyen sipariş yok"
              )}
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="admin-stat">
            <div className="admin-stat__label">Ürünler</div>
            <div className="admin-stat__value">{data.productCount}</div>
            <div className="admin-stat__hint">
              {data.lowStockCount > 0
                ? `${data.lowStockCount} ürün kritik stokta (≤5)`
                : "Stok seviyeleri iyi"}
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="admin-stat">
            <div className="admin-stat__label">Müşteriler</div>
            <div className="admin-stat__value">{data.customerCount}</div>
            <div className="admin-stat__hint">Kayıtlı müşteri sayısı</div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-xl-7">
          <div className="admin-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div className="admin-card__title mb-0">Son 7 gün satış</div>
                <div className="small text-muted">Günlük sipariş tutarları</div>
              </div>
              <div className="text-end">
                <div className="fw-semibold">{formatPrice(weekTotal)}</div>
                <div className="small text-muted">haftalık toplam</div>
              </div>
            </div>

            <div className="chart-bars" role="img" aria-label="Son 7 günün satış grafiği">
              {data.last7Days.map((day) => (
                <div
                  className="chart-bar"
                  key={day.date}
                  title={`${day.date}: ${formatPrice(day.total)} · ${day.orderCount} sipariş`}
                >
                  <div
                    className="chart-bar__fill"
                    style={{ height: `${Math.max(3, (day.total / maxDay) * 100)}%` }}
                  />
                  <span>{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          <div className="admin-card h-100">
            <div className="admin-card__title">En çok satanlar</div>
            {data.topProducts.length === 0 ? (
              <p className="small text-muted mb-0">Henüz satış verisi yok.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {data.topProducts.map((product, index) => (
                  <div className="d-flex align-items-center gap-2" key={product.name}>
                    <span
                      className="badge rounded-pill"
                      style={{ background: "#f3f4f6", color: "#4b5563" }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-grow-1 small">{product.name}</div>
                    <div className="text-end small">
                      <div className="fw-medium">{formatPrice(product.total)}</div>
                      <div className="text-muted">{product.quantity} adet</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="admin-card__title mb-0">Son siparişler</div>
          <Link href="/admin/siparisler" className="admin-btn btn btn-sm">
            Tümünü gör
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="small text-muted mb-0">Henüz sipariş yok.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sipariş</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Ödeme</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/siparisler/${order.id}`}>{order.orderNumber}</Link>
                    </td>
                    <td>
                      <div>{order.customerName}</div>
                      <div className="text-muted" style={{ fontSize: "0.76rem" }}>
                        {order.email}
                      </div>
                    </td>
                    <td className="text-muted">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="fw-medium">{formatPrice(order.total)}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </td>
                    <td className="text-end">
                      <Link href={`/admin/siparisler/${order.id}`} className="admin-btn btn btn-sm">
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
