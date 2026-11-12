"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { adminAuth } from "@/lib/auth";
import type { AdminAuthResponse } from "@/lib/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch<AdminAuthResponse>("/api/admin/auth/login", {
        method: "POST",
        body: { email, password },
      });
      adminAuth.save(response.token);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Giriş yapılamadı. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-brand__mark" aria-hidden="true">
            t
          </span>
          Ecommerce
        </div>
        <p className="small text-muted mb-4">Yönetim paneline devam etmek için giriş yapın.</p>

        {error ? (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label htmlFor="adminEmail" className="form-label">
              E-posta
            </label>
            <input
              id="adminEmail"
              type="email"
              className="form-control"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="adminPassword" className="form-label">
              Şifre
            </label>
            <input
              id="adminPassword"
              type="password"
              className="form-control"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="admin-btn admin-btn-dark w-100 mt-1" disabled={submitting}>
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-4 p-3 rounded-3" style={{ background: "#f6f7f9", fontSize: "0.8rem" }}>
          <div className="fw-semibold mb-1">Demo yönetici hesabı</div>
          <div className="text-muted">
            admin@ecommerce.com
            <br />
            Admin123!
          </div>
        </div>

        <div className="text-center mt-3">
          <Link href="/" className="small text-muted">
            <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Mağazaya dön
          </Link>
        </div>
      </div>
    </div>
  );
}
