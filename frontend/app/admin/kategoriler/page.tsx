"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminToken } from "@/lib/admin";
import { ApiError, apiFetch } from "@/lib/api";
import type { Category, CategorySaveRequest } from "@/lib/types";

const emptyForm = { name: "", sortOrder: "0", isActive: true };

export default function AdminCategoriesPage() {
  const token = useAdminToken();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      setCategories(await apiFetch<Category[]>("/api/admin/categories", { token }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setError(null);
    setSuccess(null);

    const payload: CategorySaveRequest = {
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    };

    if (!payload.name) {
      setError("Kategori adı zorunludur.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiFetch<Category>(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          token,
          body: payload,
        });
        setSuccess("Kategori güncellendi.");
      } else {
        await apiFetch<Category>("/api/admin/categories", {
          method: "POST",
          token,
          body: payload,
        });
        setSuccess("Kategori eklendi.");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategori kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (category: Category) => {
    if (!token || !window.confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await apiFetch<void>(`/api/admin/categories/${category.id}`, { method: "DELETE", token });
      if (editingId === category.id) {
        resetForm();
      }
      setSuccess("Kategori silindi.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategori silinemedi.");
    }
  };

  return (
    <>
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
        <div className="col-lg-8">
          <div className="admin-card">
            {loading ? (
              <div className="text-center text-muted py-5">Yükleniyor...</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Ürün</th>
                      <th>Sıra</th>
                      <th>Durum</th>
                      <th className="text-end">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <div className="fw-medium">{category.name}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            /{category.slug}
                          </div>
                        </td>
                        <td className="text-muted">{category.productCount}</td>
                        <td className="text-muted">{category.sortOrder}</td>
                        <td>
                          <span
                            className={`badge-status ${category.isActive ? "badge-completed" : "badge-neutral"}`}
                          >
                            {category.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="btn admin-btn btn-sm"
                              onClick={() => startEdit(category)}
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              className="btn admin-btn admin-btn-danger btn-sm"
                              onClick={() => void handleDelete(category)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          Henüz kategori yok.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="admin-card">
            <div className="admin-card__title">
              {editingId ? "Kategoriyi düzenle" : "Yeni kategori"}
            </div>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label htmlFor="categoryName" className="form-label">
                  Kategori adı *
                </label>
                <input
                  id="categoryName"
                  className="form-control"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="categorySort" className="form-label">
                  Sıralama
                </label>
                <input
                  id="categorySort"
                  className="form-control"
                  inputMode="numeric"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                />
                <div className="form-text">Küçük sayı mağazada önce görünür.</div>
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="categoryActive"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                <label className="form-check-label small" htmlFor="categoryActive">
                  Mağazada görünür
                </label>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn admin-btn admin-btn-dark flex-grow-1" disabled={saving}>
                  {saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Ekle"}
                </button>
                {editingId ? (
                  <button type="button" className="btn admin-btn" onClick={resetForm}>
                    Vazgeç
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
