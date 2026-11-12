"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiFetch, assetUrl, uploadImage } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, ProductDetail, ProductSaveRequest } from "@/lib/types";

interface FormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  discountPrice: string;
  stock: string;
  categoryId: string;
  isActive: boolean;
  images: string[];
}

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  categoryId: "",
  isActive: true,
  images: [],
};

export default function AdminProductForm({
  token,
  productId,
}: {
  token: string;
  productId?: number;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const categoriesResult = await apiFetch<Category[]>("/api/admin/categories", { token });
        if (cancelled) {
          return;
        }
        setCategories(categoriesResult);

        if (productId) {
          const product = await apiFetch<ProductDetail>(`/api/admin/products/${productId}`, { token });
          if (cancelled) {
            return;
          }
          setForm({
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: String(product.price),
            discountPrice: product.discountPrice === null ? "" : String(product.discountPrice),
            stock: String(product.stock),
            categoryId: String(product.categoryId),
            isActive: product.isActive,
            images: product.images.map((image) => image.url),
          });
        } else {
          setForm((current) => ({
            ...current,
            categoryId: String(categoriesResult.find((category) => category.isActive)?.id ?? categoriesResult[0]?.id ?? ""),
          }));
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Form verileri yüklenemedi.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, productId]);

  const update =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const addImageUrl = () => {
    const value = imageUrl.trim();
    if (!value) {
      return;
    }
    if (!value.startsWith("/") && !value.startsWith("http")) {
      setError("Görsel adresi / ile başlayan bir yol veya http(s) adresi olmalıdır.");
      return;
    }
    setForm((current) =>
      current.images.includes(value) ? current : { ...current, images: [...current.images, value] },
    );
    setImageUrl("");
    setError(null);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        uploaded.push(await uploadImage(file, token));
      }
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded] }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (url: string) =>
    setForm((current) => ({ ...current, images: current.images.filter((item) => item !== url) }));

  const makeCover = (url: string) =>
    setForm((current) => ({
      ...current,
      images: [url, ...current.images.filter((item) => item !== url)],
    }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const price = Number(form.price.replace(",", "."));
    const discountPrice = form.discountPrice.trim() === "" ? null : Number(form.discountPrice.replace(",", "."));
    const stock = Number(form.stock);
    const categoryId = Number(form.categoryId);

    if (!form.name.trim()) {
      setError("Ürün adı zorunludur.");
      return;
    }
    if (!form.description.trim()) {
      setError("Ürün açıklaması zorunludur.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Geçerli bir satış fiyatı girin.");
      return;
    }
    if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice <= 0 || discountPrice >= price)) {
      setError("İndirimli fiyat, satış fiyatından küçük olmalıdır.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stok 0 veya daha büyük bir tam sayı olmalıdır.");
      return;
    }
    if (!categoryId) {
      setError("Kategori seçmelisiniz.");
      return;
    }
    if (form.images.length === 0) {
      setError("En az bir ürün görseli ekleyin.");
      return;
    }

    const payload: ProductSaveRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      discountPrice,
      stock,
      categoryId,
      isActive: form.isActive,
      images: form.images,
      slug: form.slug.trim() || null,
    };

    setSaving(true);
    try {
      if (productId) {
        await apiFetch<ProductDetail>(`/api/admin/products/${productId}`, {
          method: "PUT",
          token,
          body: payload,
        });
      } else {
        await apiFetch<ProductDetail>("/api/admin/products", {
          method: "POST",
          token,
          body: payload,
        });
      }
      router.push("/admin/urunler");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ürün kaydedilemedi.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-card text-center text-muted py-5">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Yükleniyor...
      </div>
    );
  }

  const priceValue = Number(form.price.replace(",", "."));
  const discountValue = Number(form.discountPrice.replace(",", "."));
  const effective =
    Number.isFinite(discountValue) && discountValue > 0 && discountValue < priceValue
      ? discountValue
      : priceValue;

  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <Link href="/admin/urunler" className="admin-btn btn btn-sm">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Ürünlere dön
        </Link>
        <div className="d-flex gap-2">
          <Link href="/admin/urunler" className="btn admin-btn btn-sm">
            Vazgeç
          </Link>
          <button type="submit" className="btn admin-btn admin-btn-dark btn-sm" disabled={saving}>
            {saving ? "Kaydediliyor..." : productId ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {error}
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="admin-card mb-3">
            <div className="admin-card__title">Ürün bilgileri</div>
            <div className="row g-3">
              <div className="col-md-8">
                <label htmlFor="productName" className="form-label">
                  Ürün adı *
                </label>
                <input
                  id="productName"
                  className="form-control"
                  value={form.name}
                  onChange={update("name")}
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="productCategory" className="form-label">
                  Kategori *
                </label>
                <select
                  id="productCategory"
                  className="form-select"
                  value={form.categoryId}
                  onChange={update("categoryId")}
                  required
                >
                  <option value="">Seçin</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label htmlFor="productSlug" className="form-label">
                  URL adresi (isteğe bağlı)
                </label>
                <input
                  id="productSlug"
                  className="form-control"
                  value={form.slug}
                  onChange={update("slug")}
                  placeholder="Boş bırakırsanız ürün adından üretilir"
                />
                <div className="form-text">Ürün adresinde görünen kısa yol, örn. cikolatali-pasta</div>
              </div>
              <div className="col-12">
                <label htmlFor="productDescription" className="form-label">
                  Açıklama *
                </label>
                <textarea
                  id="productDescription"
                  className="form-control"
                  rows={5}
                  value={form.description}
                  onChange={update("description")}
                  required
                />
              </div>
            </div>
          </div>

          <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="admin-card__title mb-0">Görseller</div>
              <span className="small text-muted">{form.images.length} / 8</span>
            </div>
            <p className="small text-muted">
              İlk görsel kapak olarak kullanılır. JPG, PNG veya WEBP, en fazla 5 MB.
            </p>

            <div className="image-manager mb-3">
              {form.images.map((url, index) => (
                <div className="image-manager__item" key={url}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl(url)} alt="" />
                  {index === 0 ? <span className="image-manager__cover">KAPAK</span> : null}
                  <div className="image-manager__actions">
                    {index !== 0 ? (
                      <button type="button" title="Kapak yap" onClick={() => makeCover(url)}>
                        <i className="bi bi-star" aria-hidden="true" />
                      </button>
                    ) : null}
                    <button type="button" title="Kaldır" onClick={() => removeImage(url)}>
                      <i className="bi bi-x" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}

              <label className="image-manager__add mb-0">
                {uploading ? (
                  <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                ) : (
                  <>
                    <i className="bi bi-cloud-arrow-up d-block fs-5 mb-1" aria-hidden="true" />
                    Görsel Yükle
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  disabled={uploading}
                  onChange={handleUpload}
                />
              </label>
            </div>

            <div className="input-group">
              <input
                className="form-control"
                placeholder="veya görsel adresi: /uploads/... veya https://..."
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
              <button type="button" className="btn admin-btn" onClick={addImageUrl}>
                URL Ekle
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="admin-card mb-3">
            <div className="admin-card__title">Fiyatlandırma</div>
            <div className="mb-3">
              <label htmlFor="productPrice" className="form-label">
                Satış fiyatı (TL) *
              </label>
              <input
                id="productPrice"
                className="form-control"
                inputMode="decimal"
                value={form.price}
                onChange={update("price")}
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label htmlFor="productDiscount" className="form-label">
                İndirimli fiyat (TL)
              </label>
              <input
                id="productDiscount"
                className="form-control"
                inputMode="decimal"
                value={form.discountPrice}
                onChange={update("discountPrice")}
                placeholder="İndirim yoksa boş bırakın"
              />
            </div>

            <div className="mt-3 p-3 rounded-3" style={{ background: "#f8f9fb" }}>
              <div className="small text-muted">Vitrinde görünecek fiyat</div>
              <div className="d-flex align-items-baseline gap-2">
                <span className="fw-semibold fs-5">
                  {Number.isFinite(effective) && effective > 0 ? formatPrice(effective) : "—"}
                </span>
                {Number.isFinite(discountValue) && discountValue > 0 && discountValue < priceValue ? (
                  <span className="text-muted text-decoration-line-through small">
                    {formatPrice(priceValue)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="admin-card mb-3">
            <div className="admin-card__title">Stok ve durum</div>
            <div className="mb-3">
              <label htmlFor="productStock" className="form-label">
                Stok adedi *
              </label>
              <input
                id="productStock"
                className="form-control"
                inputMode="numeric"
                value={form.stock}
                onChange={update("stock")}
                placeholder="0"
                required
              />
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="productActive"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
              <label className="form-check-label small" htmlFor="productActive">
                Ürün mağazada satışta
              </label>
            </div>
            <p className="small text-muted mt-2 mb-0">
              Pasif ürünler mağazada listelenmez, mevcut siparişleri etkilemez.
            </p>
          </div>

          <button type="submit" className="btn admin-btn admin-btn-dark w-100" disabled={saving}>
            {saving ? "Kaydediliyor..." : productId ? "Değişiklikleri Kaydet" : "Ürünü Kaydet"}
          </button>
        </div>
      </div>
    </form>
  );
}
