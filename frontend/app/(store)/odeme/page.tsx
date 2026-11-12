"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { ApiError, apiFetch, assetUrl } from "@/lib/api";
import { customerAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { PAYMENT_METHOD_ICONS } from "@/lib/order-status";
import type { Customer, OrderDetail, PaymentMethodInfo } from "@/lib/types";

interface FormState {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  note: string;
}

const emptyForm: FormState = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  note: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, hydrated, clear } = useCart();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = customerAuth.token();

    const load = async () => {
      try {
        const activeMethods = await apiFetch<PaymentMethodInfo[]>("/api/payment-methods");
        setMethods(activeMethods);
        if (activeMethods.length > 0) {
          setSelectedMethod((current) => current || activeMethods[0].method);
        }
      } catch {
        setError("Ödeme yöntemleri yüklenemedi. Lütfen sayfayı yenileyin.");
      }

      if (token) {
        try {
          const me = await apiFetch<Customer>("/api/auth/me", { token });
          setCustomer(me);
          setForm((current) => ({
            ...current,
            customerName: current.customerName || me.fullName,
            email: current.email || me.email,
            phone: current.phone || me.phone || "",
          }));
        } catch {
          customerAuth.clear();
        }
      }

      setLoading(false);
    };

    void load();
  }, []);

  const update = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Sepetiniz boş. Sipariş vermek için önce ürün ekleyin.");
      return;
    }

    if (!selectedMethod) {
      setError("Lütfen bir ödeme yöntemi seçin.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await apiFetch<OrderDetail>("/api/orders", {
        method: "POST",
        token: customerAuth.token(),
        body: {
          ...form,
          paymentMethod: selectedMethod,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        },
      });

      clear();
      router.push(
        `/siparis-takip?no=${encodeURIComponent(order.orderNumber)}&email=${encodeURIComponent(order.email)}&yeni=1`,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sipariş oluşturulamadı. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  const selectedInfo = methods.find((method) => method.method === selectedMethod);

  if (!hydrated || loading) {
    return (
      <div className="container section">
        <div className="surface p-5 text-center text-muted-tb">Ödeme sayfası hazırlanıyor...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <div className="empty-state">
          <i className="bi bi-bag-x" aria-hidden="true" />
          <h3>Sepetiniz boş</h3>
          <p>Sipariş vermek için önce sepetinize ürün ekleyin.</p>
          <Link href="/urunler" className="btn btn-tb-dark">
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-5" style={{ paddingTop: "2.5rem" }}>
      <nav className="breadcrumb-tb mb-3" aria-label="Breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/sepet">Sepetim</Link>
        <span>/</span>
        <span>Ödeme</span>
      </nav>

      <h1 className="section-title mb-1">Siparişi Tamamla</h1>
      <p className="section-lead mb-4">
        Bilgilerinizi kontrol edin ve ödeme yöntemini seçin. Üye olmadan da devam edebilirsiniz.
      </p>

      {error ? (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          <div className="col-lg-7">
            {customer ? (
              <div className="d-flex align-items-center gap-2 small text-muted-tb mb-3">
                <i className="bi bi-person-check text-success" aria-hidden="true" />
                <span>
                  <strong className="text-body">{customer.fullName}</strong> olarak giriş yaptınız.
                  Sipariş hesabınıza kaydedilecek.
                </span>
              </div>
            ) : (
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 small text-muted-tb mb-3">
                <span>
                  <i className="bi bi-info-circle me-1" aria-hidden="true" />
                  Misafir olarak sipariş veriyorsunuz.
                </span>
                <Link href="/hesap" className="fw-medium">
                  Giriş yapın veya üye olun
                </Link>
              </div>
            )}

            <div className="surface p-4 mb-4">
              <h2 className="h6 mb-3">İletişim Bilgileri</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="customerName" className="form-label">
                    Ad Soyad *
                  </label>
                  <input
                    id="customerName"
                    className="form-control"
                    value={form.customerName}
                    onChange={update("customerName")}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    E-posta *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={update("email")}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label">
                    Telefon *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="form-control"
                    value={form.phone}
                    onChange={update("phone")}
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className="surface p-4 mb-4">
              <h2 className="h6 mb-3">Teslimat Adresi</h2>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="address" className="form-label">
                    Adres *
                  </label>
                  <textarea
                    id="address"
                    className="form-control"
                    rows={2}
                    value={form.address}
                    onChange={update("address")}
                    required
                    autoComplete="street-address"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="city" className="form-label">
                    İl
                  </label>
                  <input
                    id="city"
                    className="form-control"
                    value={form.city}
                    onChange={update("city")}
                    autoComplete="address-level1"
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="district" className="form-label">
                    İlçe
                  </label>
                  <input
                    id="district"
                    className="form-control"
                    value={form.district}
                    onChange={update("district")}
                    autoComplete="address-level2"
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="note" className="form-label">
                    Sipariş notu (isteğe bağlı)
                  </label>
                  <textarea
                    id="note"
                    className="form-control"
                    rows={2}
                    value={form.note}
                    onChange={update("note")}
                    placeholder="Örn. kapı zili çalışmıyor, pasta üzerine yazı eklenebilir mi?"
                  />
                </div>
              </div>
            </div>

            <div className="surface p-4">
              <h2 className="h6 mb-3">Ödeme Yöntemi</h2>
              <div className="d-flex flex-column gap-2">
                {methods.map((method) => (
                  <label
                    key={method.method}
                    className={`payment-option${selectedMethod === method.method ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.method}
                      checked={selectedMethod === method.method}
                      onChange={() => setSelectedMethod(method.method)}
                    />
                    <span className="flex-grow-1">
                      <span className="payment-option__title d-flex align-items-center gap-2">
                        <i className={`bi ${PAYMENT_METHOD_ICONS[method.method]}`} aria-hidden="true" />
                        {method.name}
                      </span>
                      <span className="payment-option__desc d-block">{method.description}</span>
                    </span>
                  </label>
                ))}
              </div>

              {selectedInfo?.method === "BankTransfer" && (selectedInfo.bankName || selectedInfo.iban) ? (
                <div className="bank-box mt-3">
                  <dl>
                    {selectedInfo.bankName ? (
                      <>
                        <dt>Banka</dt>
                        <dd>{selectedInfo.bankName}</dd>
                      </>
                    ) : null}
                    {selectedInfo.accountHolder ? (
                      <>
                        <dt>Hesap sahibi</dt>
                        <dd>{selectedInfo.accountHolder}</dd>
                      </>
                    ) : null}
                    {selectedInfo.iban ? (
                      <>
                        <dt>IBAN</dt>
                        <dd>{selectedInfo.iban}</dd>
                      </>
                    ) : null}
                  </dl>
                  {selectedInfo.instructions ? (
                    <p className="small text-muted-tb mt-2 mb-0">{selectedInfo.instructions}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="surface p-4 position-sticky" style={{ top: 96 }}>
              <h2 className="h6 mb-3">Sipariş Özeti</h2>

              <div className="checkout-items">
                {items.map((item) => (
                  <div className="checkout-item" key={item.productId}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl(item.imageUrl)} alt={item.name} />
                    <div className="flex-grow-1">
                      <div className="fw-medium">{item.name}</div>
                      <div className="text-muted-tb">
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </div>
                    </div>
                    <div className="fw-medium">{formatPrice(item.unitPrice * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <div className="summary-line">
                  <span>Ara toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-line">
                  <span>Kargo</span>
                  <span className="text-success">Ücretsiz</span>
                </div>
                <div className="summary-line total">
                  <span>Toplam</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-tb-dark w-100 mt-3" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                    Sipariş oluşturuluyor...
                  </>
                ) : (
                  <>
                    Siparişi Tamamla
                    <i className="bi bi-lock ms-2" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="small text-muted-tb mt-3 mb-0">
                Siparişi tamamlayarak satış koşullarını kabul etmiş olursunuz. Ödeme bilgileriniz
                güvenli şekilde işlenir.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
