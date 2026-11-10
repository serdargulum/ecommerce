"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch, assetUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, PagedResult, ProductListItem } from "@/lib/types";

export default function AdminProductsPage() {
  const token = useAdminToken();
  const [products, setProducts] = useState<PagedResult<ProductListItem> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState("");
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
      if (search.trim()) {
        params.set("search", search.trim());
      }
      if (categoryId) {
        params.set("categoryId", categoryId);
      }
      if (isActive) {
        params.set("isActive", isActive);
      }
      const result = await apiFetch<PagedResult<ProductListItem>>(
        `/api/admin/products?${params.toString()}`,
        { token },
      );
      setProducts(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ürünler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, categoryId, isActive]);

  useEffect(() => {
    if (!token) {
      return;
    }
    apiFetch<Category[]>("/api/admin/categories", { token })
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (product: ProductListItem) => {
    if (!token) {
      return;
    }
    if (!window.confirm(`"${product.name}" ürününü silmek istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await apiFetch<void>(`/api/admin/products/${product.id}`, { method: "DELETE", token });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ürün silinemedi.");
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            className="form-control"
            style={{ maxWidth: 260 }}
            placeholder="Ürün adı ara..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            aria-label="Ürün ara"
          />
          <select
            className="form-select"
            style={{ maxWidth: 200 }}
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            aria-label="Kategori filtresi"
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ maxWidth: 150 }}
            value={isActive}
            onChange={(event) => {
              setIsActive(event.target.value);
              setPage(1);
            }}
            aria-label="Durum filtresi"
          >
            <option value="">Tümü</option>
            <option value="true">Satışta</option>
            <option value="false">Pasif</option>
          </select>
        </div>

        <Link href="/admin/urunler/yeni" className="btn admin-btn admin-btn-dark">
          <i className="bi bi-plus-lg me-1" aria-hidden="true" /> Yeni Ürün
        </Link>
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-card">
        {loading && !products ? (
          <div className="text-center text-muted py-5">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            Yükleniyor...
          </div>
        ) : !products || products.items.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-box-seam fs-3 d-block mb-2" aria-hidden="true" />
            Filtrelere uygun ürün bulunamadı.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Görsel</th>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>Stok</th>
                    <th>Durum</th>
                    <th className="text-end">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {products.items.map((product) => (
                    <tr key={product.id}>
                      <td>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={assetUrl(product.imageUrl)}
                          alt=""
                          className="admin-table__thumb"
                        />
                      </td>
                      <td>
                        <Link href={`/admin/urunler/${product.id}`}>{product.name}</Link>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                          /{product.slug}
                        </div>
                      </td>
                      <td className="text-muted">{product.categoryName}</td>
                      <td>
                        <div className="fw-medium">{formatPrice(product.finalPrice)}</div>
                        {product.discountPrice ? (
                          <div
                            className="text-muted text-decoration-line-through"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {formatPrice(product.price)}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <span
                          className={product.stock <= 5 ? "text-danger fw-medium" : ""}
                          title={product.stock <= 5 ? "Kritik stok" : undefined}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge-status ${product.isActive ? "badge-completed" : "badge-neutral"}`}
                        >
                          {product.isActive ? "Satışta" : "Pasif"}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-1">
                          <Link
                            href={`/admin/urunler/${product.id}`}
                            className="btn admin-btn btn-sm"
                            title="Düzenle"
                          >
                            <i className="bi bi-pencil" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            className="btn admin-btn admin-btn-danger btn-sm"
                            title="Sil"
                            onClick={() => void handleDelete(product)}
                          >
                            <i className="bi bi-trash3" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              <span className="small text-muted">
                {products.total} ürün · sayfa {products.page} / {Math.max(1, products.totalPages)}
              </span>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn admin-btn btn-sm"
                  disabled={products.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Önceki
                </button>
                <button
                  type="button"
                  className="btn admin-btn btn-sm"
                  disabled={products.page >= products.totalPages}
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
