"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { CustomerListItem, PagedResult } from "@/lib/types";

export default function AdminCustomersPage() {
  const token = useAdminToken();
  const [customers, setCustomers] = useState<PagedResult<CustomerListItem> | null>(null);
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
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search.trim()) {
        params.set("search", search.trim());
      }
      const result = await apiFetch<PagedResult<CustomerListItem>>(
        `/api/admin/customers?${params.toString()}`,
        { token },
      );
      setCustomers(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Müşteriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <input
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Ad veya e-posta ara..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          aria-label="Müşteri ara"
        />
        <span className="small text-muted">{customers ? `${customers.total} müşteri` : ""}</span>
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-card">
        {loading && !customers ? (
          <div className="text-center text-muted py-5">Yükleniyor...</div>
        ) : !customers || customers.items.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-people fs-3 d-block mb-2" aria-hidden="true" />
            Müşteri bulunamadı. Misafir siparişleri bu listede yer almaz.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Müşteri</th>
                    <th>Telefon</th>
                    <th>Kayıt tarihi</th>
                    <th>Sipariş</th>
                    <th>Toplam harcama</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.items.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="fw-medium">{customer.fullName}</div>
                        <div className="text-muted" style={{ fontSize: "0.76rem" }}>
                          {customer.email}
                        </div>
                      </td>
                      <td className="text-muted">{customer.phone || "—"}</td>
                      <td className="text-muted">{formatDate(customer.createdAt)}</td>
                      <td>{customer.orderCount}</td>
                      <td className="fw-medium">{formatPrice(customer.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              <span className="small text-muted">
                Sayfa {customers.page} / {Math.max(1, customers.totalPages)}
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn admin-btn btn-sm"
                  disabled={customers.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Önceki
                </button>
                <button
                  type="button"
                  className="btn admin-btn btn-sm"
                  disabled={customers.page >= customers.totalPages}
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
