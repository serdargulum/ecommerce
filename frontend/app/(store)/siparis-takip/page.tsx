"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderTimeline from "@/components/OrderTimeline";
import { ApiError, apiFetch, assetUrl } from "@/lib/api";
import { customerAuth } from "@/lib/auth";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/order-status";
import type { OrderDetail } from "@/lib/types";

function PaymentDetails({ order }: { order: OrderDetail }) {
  const info = order.paymentInstructions;

  return (
    <div className="surface p-4">
      <h2 className="h6 mb-2">Ödeme Bilgisi</h2>
      <div className="d-flex justify-content-between gap-2 small mb-2">
        <span className="text-muted-tb">Yöntem</span>
        <span className="fw-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
      </div>
      <div className="d-flex justify-content-between gap-2 small">
        <span className="text-muted-tb">Durum</span>
        <span className="fw-medium">{PAYMENT_STATUS_LABELS[order.paymentStatus]}</span>
      </div>

      {order.paymentMethod === "BankTransfer" && info?.iban ? (
        <div className="bank-box mt-3">
          <dl>
            {info.bankName ? (
              <>
                <dt>Banka</dt>
                <dd>{info.bankName}</dd>
              </>
            ) : null}
            {info.accountHolder ? (
              <>
                <dt>Hesap sahibi</dt>
                <dd>{info.accountHolder}</dd>
              </>
            ) : null}
            <dt>IBAN</dt>
            <dd>{info.iban}</dd>
            <dt>Açıklama</dt>
            <dd>{order.orderNumber}</dd>
          </dl>
        </div>
      ) : null}

      {info?.instructions ? <p className="small text-muted-tb mt-3 mb-0">{info.instructions}</p> : null}
    </div>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const noParam = searchParams.get("no") ?? "";
  const emailParam = searchParams.get("email") ?? "";
  const isNew = searchParams.get("yeni") === "1";

  const [orderNumber, setOrderNumber] = useState(noParam);
  const [email, setEmail] = useState(emailParam);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (no: string, mail: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = mail
        ? await apiFetch<OrderDetail>("/api/orders/track", {
            method: "POST",
            body: { orderNumber: no, email: mail },
          })
        : await apiFetch<OrderDetail>(`/api/orders/${encodeURIComponent(no)}`, {
            token: customerAuth.token(),
          });
      setOrder(result);
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Sipariş sorgulanamadı. Lütfen bilgilerinizi kontrol edin.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOrderNumber(noParam);
    setEmail(emailParam);
    if (noParam && (emailParam || customerAuth.token())) {
      void lookup(noParam, emailParam);
    }
  }, [noParam, emailParam, lookup]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderNumber.trim()) {
      setError("Lütfen sipariş numaranızı girin.");
      return;
    }
    void lookup(orderNumber.trim(), email.trim());
  };

  return (
    <div className="container pb-5" style={{ paddingTop: "2.5rem" }}>
      <nav className="breadcrumb-tb mb-3" aria-label="Breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <span>Sipariş Takip</span>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <h1 className="section-title mb-1">Sipariş Takibi</h1>
          <p className="section-lead mb-4">
            Sipariş numaranız ve siparişte kullandığınız e-posta adresi ile durumu görüntüleyin.
          </p>

          {isNew && order ? (
            <div className="alert alert-success d-flex align-items-center gap-2" role="status">
              <i className="bi bi-check-circle-fill" aria-hidden="true" />
              <span>
                Siparişiniz alındı! Sipariş numaranız <strong>{order.orderNumber}</strong>. Durumu bu
                sayfadan takip edebilirsiniz.
              </span>
            </div>
          ) : null}

          {!order ? (
            <div className="surface p-4 p-md-5">
              <form onSubmit={handleSubmit} className="row g-3 align-items-end">
                <div className="col-md-5">
                  <label htmlFor="orderNumber" className="form-label">
                    Sipariş Numarası
                  </label>
                  <input
                    id="orderNumber"
                    className="form-control"
                    placeholder="TB000000-XXXX"
                    value={orderNumber}
                    onChange={(event) => setOrderNumber(event.target.value)}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label htmlFor="trackEmail" className="form-label">
                    E-posta Adresi
                  </label>
                  <input
                    id="trackEmail"
                    type="email"
                    className="form-control"
                    placeholder="ornek@eposta.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required={!customerAuth.token()}
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-tb-dark w-100" disabled={loading}>
                    {loading ? "Aranıyor..." : "Sorgula"}
                  </button>
                </div>
              </form>

              {error ? (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {error}
                </div>
              ) : null}

              <p className="small text-muted-tb mt-3 mb-0">
                Sipariş numaranızı e-posta ile gönderdik. Hesabınıza giriş yaptıysanız{" "}
                <Link href="/hesap" className="fw-medium">
                  hesap sayfanızdan
                </Link>{" "}
                da siparişlerinizi görebilirsiniz.
              </p>
            </div>
          ) : (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <button
                  type="button"
                  className="btn btn-tb-ghost btn-sm"
                  onClick={() => {
                    setOrder(null);
                    setError(null);
                  }}
                >
                  <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Yeni sorgu
                </button>
                <Link href="/urunler" className="btn btn-tb-soft btn-sm">
                  Alışverişe devam et
                </Link>
              </div>

              <div className="surface p-4 mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <div className="small text-muted-tb">Sipariş No</div>
                    <div className="h5 mb-1">{order.orderNumber}</div>
                    <div className="small text-muted-tb">{formatDateTime(order.createdAt)}</div>
                  </div>
                  <div className="text-end">
                    <OrderStatusBadge status={order.status} />
                    <div className="h5 mt-2 mb-0">{formatPrice(order.total)}</div>
                  </div>
                </div>

                {order.status === "Cancelled" ? (
                  <div className="alert alert-danger mb-0" role="status">
                    <i className="bi bi-x-circle me-2" aria-hidden="true" />
                    Bu sipariş iptal edildi. Detaylı bilgi için bizimle iletişime geçebilirsiniz.
                  </div>
                ) : (
                  <OrderTimeline status={order.status} />
                )}
              </div>

              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="surface p-4">
                    <h2 className="h6 mb-3">Sipariş Kalemleri</h2>
                    {order.items.map((item) => (
                      <div className="checkout-item" key={item.id}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={assetUrl(item.imageUrl)} alt={item.productName} />
                        <div className="flex-grow-1">
                          <div className="fw-medium">{item.productName}</div>
                          <div className="small text-muted-tb">
                            {item.quantity} × {formatPrice(item.unitPrice)}
                          </div>
                        </div>
                        <div className="fw-medium">{formatPrice(item.lineTotal)}</div>
                      </div>
                    ))}

                    <div className="mt-3">
                      <div className="summary-line">
                        <span>Ara toplam</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="summary-line">
                        <span>Kargo</span>
                        <span className="text-success">
                          {order.shippingTotal > 0 ? formatPrice(order.shippingTotal) : "Ücretsiz"}
                        </span>
                      </div>
                      <div className="summary-line total">
                        <span>Toplam</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {order.note ? (
                    <div className="surface p-4 mt-4">
                      <h2 className="h6 mb-1">Sipariş Notu</h2>
                      <p className="small text-muted-tb mb-0">{order.note}</p>
                    </div>
                  ) : null}
                </div>

                <div className="col-lg-5 d-flex flex-column gap-4">
                  <div className="surface p-4">
                    <h2 className="h6 mb-2">Teslimat Bilgileri</h2>
                    <div className="small">
                      <div className="fw-medium">{order.customerName}</div>
                      <div className="text-muted-tb">{order.phone}</div>
                      <div className="text-muted-tb">{order.email}</div>
                      <div className="text-muted-tb mt-2">
                        {order.address}
                        {order.district ? `, ${order.district}` : ""}
                        {order.city ? ` / ${order.city}` : ""}
                      </div>
                    </div>
                  </div>

                  <PaymentDetails order={order} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <div className="surface p-5 text-center text-muted-tb">Sipariş bilgileri yükleniyor...</div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
