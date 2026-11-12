"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { ApiError, apiFetch } from "@/lib/api";
import { customerAuth } from "@/lib/auth";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import type { AuthResponse, Customer, OrderSummary } from "@/lib/types";

type Mode = "login" | "register";

export default function AccountPage() {
  const { count } = useCart();
  const [checking, setChecking] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const loadOrders = useCallback(async (token: string) => {
    setOrdersLoading(true);
    try {
      const result = await apiFetch<OrderSummary[]>("/api/orders", { token });
      setOrders(result);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = customerAuth.token();
    if (!token) {
      setChecking(false);
      return;
    }

    const load = async () => {
      try {
        const me = await apiFetch<Customer>("/api/auth/me", { token });
        setCustomer(me);
        await loadOrders(token);
      } catch {
        customerAuth.clear();
      } finally {
        setChecking(false);
      }
    };

    void load();
  }, [loadOrders]);

  const onAuthenticated = async (response: AuthResponse) => {
    customerAuth.save(response.token);
    setCustomer(response.customer);
    setError(null);
    await loadOrders(response.token);
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: loginForm,
      });
      await onAuthenticated(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: registerForm,
      });
      await onAuthenticated(response);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    customerAuth.clear();
    setCustomer(null);
    setOrders([]);
    setLoginForm({ email: "", password: "" });
  };

  if (checking) {
    return (
      <div className="container section">
        <div className="surface p-5 text-center text-muted-tb">Hesap bilgileri yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="container pb-5" style={{ paddingTop: "2.5rem" }}>
      <nav className="breadcrumb-tb mb-3" aria-label="Breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <span>{customer ? "Hesabım" : "Giriş / Üye Ol"}</span>
      </nav>

      {!customer ? (
        <div className="auth-wrap">
          <h1 className="section-title text-center mb-1">Hoş geldiniz</h1>
          <p className="section-lead text-center mx-auto mb-4">
            Siparişlerinizi takip etmek için giriş yapın veya saniyeler içinde üye olun.
            Üye olmadan da sipariş verebilirsiniz.
          </p>

          <div className="surface p-4 p-md-5">
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={mode === "login" ? "is-active" : ""}
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                className={mode === "register" ? "is-active" : ""}
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
              >
                Üye Ol
              </button>
            </div>

            {error ? (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
              </div>
            ) : null}

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
                <div>
                  <label htmlFor="loginEmail" className="form-label">
                    E-posta
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    className="form-control"
                    autoComplete="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, email: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="loginPassword" className="form-label">
                    Şifre
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({ ...current, password: event.target.value }))
                    }
                    required
                  />
                </div>
                <button type="submit" className="btn btn-tb-dark mt-1" disabled={submitting}>
                  {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>
                <p className="small text-muted-tb text-center mb-0">
                  Demo hesap: <code>ayse@example.com</code> / <code>Demo123!</code>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="d-flex flex-column gap-3">
                <div>
                  <label htmlFor="registerName" className="form-label">
                    Ad Soyad
                  </label>
                  <input
                    id="registerName"
                    className="form-control"
                    autoComplete="name"
                    value={registerForm.fullName}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="registerEmail" className="form-label">
                    E-posta
                  </label>
                  <input
                    id="registerEmail"
                    type="email"
                    className="form-control"
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, email: event.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label htmlFor="registerPhone" className="form-label">
                    Telefon (isteğe bağlı)
                  </label>
                  <input
                    id="registerPhone"
                    type="tel"
                    className="form-control"
                    autoComplete="tel"
                    value={registerForm.phone}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="registerPassword" className="form-label">
                    Şifre
                  </label>
                  <input
                    id="registerPassword"
                    type="password"
                    className="form-control"
                    autoComplete="new-password"
                    minLength={6}
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, password: event.target.value }))
                    }
                    required
                  />
                  <div className="form-text">En az 6 karakter.</div>
                </div>
                <button type="submit" className="btn btn-tb-dark mt-1" disabled={submitting}>
                  {submitting ? "Hesap oluşturuluyor..." : "Üye Ol"}
                </button>
              </form>
            )}
          </div>

          {count > 0 ? (
            <p className="text-center small text-muted-tb mt-3 mb-0">
              Sepetinizde {count} ürün bekliyor.{" "}
              <Link href="/odeme" className="fw-medium">
                Misafir olarak devam edin
              </Link>
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
            <div>
              <h1 className="section-title mb-1">Merhaba, {customer.fullName.split(" ")[0]}</h1>
              <p className="section-lead mb-0">Hesap bilgileriniz ve sipariş geçmişiniz.</p>
            </div>
            <button type="button" className="btn btn-tb-ghost btn-sm" onClick={logout}>
              <i className="bi bi-box-arrow-right me-1" aria-hidden="true" /> Çıkış Yap
            </button>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className="surface p-4">
                <h2 className="h6 mb-3">Hesap Bilgileri</h2>
                <div className="small">
                  <div className="text-muted-tb">Ad Soyad</div>
                  <div className="fw-medium mb-2">{customer.fullName}</div>
                  <div className="text-muted-tb">E-posta</div>
                  <div className="fw-medium mb-2">{customer.email}</div>
                  <div className="text-muted-tb">Telefon</div>
                  <div className="fw-medium mb-2">{customer.phone || "—"}</div>
                  <div className="text-muted-tb">Üyelik tarihi</div>
                  <div className="fw-medium">{formatDate(customer.createdAt)}</div>
                </div>

                <hr className="divider my-3" />

                <Link href="/urunler" className="btn btn-tb-outline btn-sm w-100">
                  Alışverişe Devam Et
                </Link>
                {count > 0 ? (
                  <Link href="/odeme" className="btn btn-tb-soft btn-sm w-100 mt-2">
                    Sepete Dön ({count})
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="col-lg-8">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h2 className="h5 mb-0">Siparişlerim</h2>
                <span className="small text-muted-tb">{orders.length} sipariş</span>
              </div>

              {ordersLoading ? (
                <div className="surface p-4 text-center text-muted-tb">Siparişler yükleniyor...</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-receipt" aria-hidden="true" />
                  <h3>Henüz siparişiniz yok</h3>
                  <p>İlk siparişinizi verin, tatlılar kapınıza gelsin.</p>
                  <Link href="/urunler" className="btn btn-tb-dark">
                    Ürünleri Keşfet
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {orders.map((order) => (
                    <div className="order-card" key={order.id}>
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                        <div>
                          <div className="fw-medium">{order.orderNumber}</div>
                          <div className="small text-muted-tb">
                            {formatDateTime(order.createdAt)} · {order.itemCount} ürün
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          <span className="fw-semibold">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end mt-2">
                        <Link
                          href={`/siparis-takip?no=${encodeURIComponent(order.orderNumber)}`}
                          className="small fw-medium"
                        >
                          Sipariş detayı <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
