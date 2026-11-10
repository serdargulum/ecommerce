"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderTimeline from "@/components/OrderTimeline";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch, assetUrl } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/order-status";
import type { OrderDetail, OrderStatus, PaymentStatus } from "@/lib/types";

export default function AdminOrderDetailPage() {
  const token = useAdminToken();
  const params = useParams<{ id: string }>();
  const orderId = Number(params?.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Unpaid");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const apply = (result: OrderDetail) => {
    setOrder(result);
    setStatus(result.status);
    setPaymentStatus(result.paymentStatus);
  };

  const load = useCallback(async () => {
    if (!token || !Number.isInteger(orderId)) {
      return;
    }
    try {
      const result = await apiFetch<OrderDetail>(`/api/admin/orders/${orderId}`, { token });
      apply(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sipariş yüklenemedi.");
    }
  }, [token, orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async () => {
    if (!token || !order) {
      return;
    }
    setSavingStatus(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiFetch<OrderDetail>(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });
      apply(result);
      setSuccess("Sipariş durumu güncellendi.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Durum güncellenemedi.");
    } finally {
      setSavingStatus(false);
    }
  };

  const updatePayment = async () => {
    if (!token || !order) {
      return;
    }
    setSavingPayment(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await apiFetch<OrderDetail>(`/api/admin/orders/${order.id}/payment-status`, {
        method: "PATCH",
        token,
        body: { paymentStatus },
      });
      apply(result);
      setSuccess("Ödeme durumu güncellendi.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ödeme durumu güncellenemedi.");
    } finally {
      setSavingPayment(false);
    }
  };

  if (!order) {
    return (
      <div className="admin-card text-center text-muted py-5">
        {error ? error : "Sipariş yükleniyor..."}
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Link href="/admin/siparisler" className="btn admin-btn btn-sm">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Siparişlere dön
        </Link>
        <div className="d-flex align-items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span className="text-muted small">{formatDateTime(order.createdAt)}</span>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert alert-success py-2 small" role="status">
          {success}
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-xl-8">
          <div className="admin-card mb-3">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-4">
              <div>
                <div className="small text-muted">Sipariş numarası</div>
                <div className="fs-5 fw-semibold">{order.orderNumber}</div>
              </div>
              <div className="text-end">
                <div className="small text-muted">Toplam</div>
                <div className="fs-5 fw-semibold">{formatPrice(order.total)}</div>
              </div>
            </div>

            {order.status !== "Cancelled" ? <OrderTimeline status={order.status} /> : null}

            <div className="table-responsive mt-4">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Birim fiyat</th>
                    <th>Adet</th>
                    <th className="text-end">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={assetUrl(item.imageUrl)} alt="" className="admin-table__thumb" />
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td className="text-muted">{formatPrice(item.unitPrice)}</td>
                      <td className="text-muted">{item.quantity}</td>
                      <td className="text-end fw-medium">{formatPrice(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row justify-content-end mt-3">
              <div className="col-md-5">
                <div className="summary-line">
                  <span>Ara toplam</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="summary-line">
                  <span>Kargo</span>
                  <span>
                    {order.shippingTotal > 0 ? formatPrice(order.shippingTotal) : "Ücretsiz"}
                  </span>
                </div>
                <div className="summary-line total">
                  <span>Toplam</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card__title">Sipariş notu</div>
            <p className="small mb-0">
              {order.note ? order.note : <span className="text-muted">Not eklenmemiş.</span>}
            </p>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="admin-card mb-3">
            <div className="admin-card__title">Durum güncelle</div>
            <label htmlFor="orderStatus" className="form-label">
              Sipariş durumu
            </label>
            <select
              id="orderStatus"
              className="form-select mb-2"
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {ORDER_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn admin-btn admin-btn-dark w-100"
              disabled={savingStatus || status === order.status}
              onClick={() => void updateStatus()}
            >
              {savingStatus ? "Güncelleniyor..." : "Durumu Kaydet"}
            </button>
            <p className="small text-muted mt-2 mb-0">
              Sipariş iptal edilirse ürün stokları otomatik olarak geri eklenir.
            </p>

            <hr className="my-3" />

            <label htmlFor="paymentStatus" className="form-label">
              Ödeme durumu
            </label>
            <select
              id="paymentStatus"
              className="form-select mb-2"
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
            >
              {PAYMENT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {PAYMENT_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn admin-btn w-100"
              disabled={savingPayment || paymentStatus === order.paymentStatus}
              onClick={() => void updatePayment()}
            >
              {savingPayment ? "Güncelleniyor..." : "Ödemeyi Kaydet"}
            </button>
          </div>

          <div className="admin-card mb-3">
            <div className="admin-card__title">Müşteri</div>
            <div className="small">
              <div className="fw-medium">{order.customerName}</div>
              <div className="text-muted">{order.email}</div>
              <div className="text-muted">{order.phone}</div>
              {order.customerId ? (
                <div className="mt-1">
                  <span className="badge-status badge-completed">Kayıtlı müşteri</span>
                </div>
              ) : (
                <div className="mt-1">
                  <span className="badge-status badge-neutral">Misafir sipariş</span>
                </div>
              )}
            </div>

            <hr className="my-3" />
            <div className="admin-card__title">Teslimat</div>
            <p className="small mb-0">
              {order.address}
              {order.district ? `, ${order.district}` : ""}
              {order.city ? ` / ${order.city}` : ""}
            </p>
          </div>

          <div className="admin-card">
            <div className="admin-card__title">Ödeme</div>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Yöntem</span>
              <span className="fw-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
            </div>
            <div className="d-flex justify-content-between small">
              <span className="text-muted">Durum</span>
              <span className="fw-medium">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
            </div>

            {order.paymentInstructions?.iban ? (
              <div className="bank-box mt-3">
                <dl>
                  <dt>Banka</dt>
                  <dd>{order.paymentInstructions.bankName}</dd>
                  <dt>IBAN</dt>
                  <dd>{order.paymentInstructions.iban}</dd>
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
