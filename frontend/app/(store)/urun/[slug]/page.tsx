import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCart from "@/components/AddToCart";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import { ApiError, apiFetch } from "@/lib/api";
import { discountPercent, formatPrice } from "@/lib/format";
import type { ProductDetail, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiFetch<ProductDetail>(`/api/products/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug).catch(() => null);

  if (!product) {
    return { title: "Ürün bulunamadı" };
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const related = await apiFetch<ProductListItem[]>(`/api/products/${slug}/related`).catch(() => []);
  const discount = discountPercent(product.price, product.finalPrice);

  return (
    <div className="container pb-5">
      <nav className="breadcrumb-tb" aria-label="Breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/urunler">Ürünler</Link>
        <span>/</span>
        <Link href={`/urunler?category=${product.categorySlug}`}>{product.categoryName}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="row g-4 g-lg-5 pt-3">
        <div className="col-lg-6">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        <div className="col-lg-6">
          <div className="ps-lg-3">
            <Link
              href={`/urunler?category=${product.categorySlug}`}
              className="eyebrow"
              style={{ letterSpacing: "0.16em" }}
            >
              {product.categoryName}
            </Link>
            <h1 className="product-title">{product.name}</h1>

            <div className="price-block">
              <span className="current">{formatPrice(product.finalPrice)}</span>
              {discount ? (
                <>
                  <span className="old">{formatPrice(product.price)}</span>
                  <span className="discount-chip">%{discount} indirim</span>
                </>
              ) : null}
            </div>
            <p className="small text-muted-tb mb-4">KDV dahil · Kargo ücretsiz</p>

            <p className="mb-4" style={{ color: "var(--tb-ink-soft)" }}>
              {product.description}
            </p>

            <AddToCart product={product} />

            <div className="row g-3 mt-4 pt-4 border-top">
              <div className="col-sm-4">
                <div className="trust-item">
                  <i className="bi bi-flower2" aria-hidden="true" />
                  <span>Günlük taze üretim</span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="trust-item">
                  <i className="bi bi-truck" aria-hidden="true" />
                  <span>Aynı gün kargo</span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="trust-item">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  <span>Güvenli ödeme</span>
                </div>
              </div>
            </div>

            <div className="surface p-3 p-md-4 mt-4">
              <h2 className="h6 mb-2">Teslimat ve saklama</h2>
              <ul className="small text-muted-tb mb-0 ps-3">
                <li>14:00&apos;a kadar verilen siparişler aynı gün kargoya verilir.</li>
                <li>Ürünler soğuk zincir kutusunda, hasar görmeyecek şekilde paketlenir.</li>
                <li>Buzdolabında saklayın; 2-3 gün içinde tüketmenizi öneririz.</li>
                <li>Havale, kapıda ödeme veya kredi kartı ile ödeyebilirsiniz.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="section">
          <div className="d-flex justify-content-between align-items-end gap-2 mb-4">
            <div>
              <span className="eyebrow">Benzer lezzetler</span>
              <h2 className="section-title mt-2 mb-0">Bunlar da ilginizi çekebilir</h2>
            </div>
            <Link href={`/urunler?category=${product.categorySlug}`} className="btn btn-tb-ghost btn-sm">
              Kategoriyi Gör
            </Link>
          </div>
          <div className="product-gallery-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
