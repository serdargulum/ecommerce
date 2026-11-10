import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import { apiFetch } from "@/lib/api";
import type { Category, PagedResult, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünler",
  description: "Pastalar, kurabiyeler, makaronlar ve şerbetli tatlılar. Kategoriye göre filtreleyin.",
};

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categorySlug = params.category ?? "";
  const search = params.search ?? "";
  const sort = params.sort ?? "newest";
  const page = Math.max(1, Number(params.page ?? 1) || 1);

  const query = buildQuery({
    categorySlug: categorySlug || undefined,
    search: search || undefined,
    sort: sort === "newest" ? undefined : sort,
    page: String(page),
    pageSize: "12",
  });

  const [categories, products] = await Promise.all([
    apiFetch<Category[]>("/api/categories"),
    apiFetch<PagedResult<ProductListItem>>(`/api/products${query}`),
  ]);

  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const categoryLink = (slug?: string) =>
    `/urunler${buildQuery({ category: slug, search: search || undefined, sort: sort === "newest" ? undefined : sort })}`;

  return (
    <div className="container pb-5">
      <nav className="breadcrumb-tb" aria-label="Breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <span>{activeCategory ? activeCategory.name : "Tüm Ürünler"}</span>
      </nav>

      <div className="row g-4 g-lg-5 pt-3">
        <div className="col-lg-3">
          <div className="d-none d-lg-block surface p-3 p-xl-4 position-sticky" style={{ top: 96 }}>
            <h2 className="h6 mb-2">Kategoriler</h2>
            <div className="filter-list">
              <Link href={categoryLink()} className={!categorySlug ? "is-active" : ""}>
                <span>Tüm Ürünler</span>
                <span className="count">{categories.reduce((sum, c) => sum + c.productCount, 0)}</span>
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={categoryLink(category.slug)}
                  className={categorySlug === category.slug ? "is-active" : ""}
                >
                  <span>{category.name}</span>
                  <span className="count">{category.productCount}</span>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-top">
              <p className="small text-muted-tb mb-2">
                <i className="bi bi-truck me-1" aria-hidden="true" /> Tüm siparişlerde ücretsiz kargo
              </p>
              <p className="small text-muted-tb mb-0">
                <i className="bi bi-box-seam me-1" aria-hidden="true" /> Özenli soğuk zincir paketleme
              </p>
            </div>
          </div>

          <div className="d-lg-none d-flex gap-2 overflow-auto pb-2">
            <Link href={categoryLink()} className={`filter-pill${!categorySlug ? " is-active" : ""}`}>
              Tümü
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryLink(category.slug)}
                className={`filter-pill${categorySlug === category.slug ? " is-active" : ""}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="col-lg-9">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <h1 className="section-title mb-1">{activeCategory ? activeCategory.name : "Tüm Ürünler"}</h1>
              <p className="section-lead mb-0">
                {products.total} ürün listeleniyor
                {search ? ` · "${search}" araması` : ""}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <SortSelect value={sort} />
            </div>
          </div>

          <form action="/urunler" method="get" className="mb-4" role="search">
            {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
            <div className="d-flex gap-2">
              <input
                type="search"
                name="search"
                defaultValue={search}
                className="form-control"
                placeholder="Ürün adı veya içerik ara (örn. çikolata)"
                aria-label="Ürün ara"
              />
              <button type="submit" className="btn btn-tb-dark px-3" aria-label="Ara">
                <i className="bi bi-search" aria-hidden="true" />
              </button>
            </div>
          </form>

          {products.items.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-search" aria-hidden="true" />
              <h3>Ürün bulunamadı</h3>
              <p>Arama veya kategori filtresini değiştirerek tekrar deneyin.</p>
              <Link href="/urunler" className="btn btn-tb-outline">
                Filtreleri Temizle
              </Link>
            </div>
          ) : (
            <div className="product-gallery-grid">
              {products.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {products.totalPages > 1 ? (
            <nav className="d-flex justify-content-center align-items-center gap-2 mt-5" aria-label="Sayfalama">
              <Link
                href={`/urunler${buildQuery({
                  category: categorySlug || undefined,
                  search: search || undefined,
                  sort: sort === "newest" ? undefined : sort,
                  page: String(page - 1),
                })}`}
                className={`btn btn-tb-ghost btn-sm ${page <= 1 ? "disabled" : ""}`}
                aria-disabled={page <= 1}
              >
                <i className="bi bi-arrow-left" aria-hidden="true" />
              </Link>
              {Array.from({ length: products.totalPages }, (_, index) => index + 1).map((item) => (
                <Link
                  key={item}
                  href={`/urunler${buildQuery({
                    category: categorySlug || undefined,
                    search: search || undefined,
                    sort: sort === "newest" ? undefined : sort,
                    page: String(item),
                  })}`}
                  className={`btn btn-sm ${item === products.page ? "btn-tb-dark" : "btn-tb-ghost"}`}
                  aria-current={item === products.page ? "page" : undefined}
                >
                  {item}
                </Link>
              ))}
              <Link
                href={`/urunler${buildQuery({
                  category: categorySlug || undefined,
                  search: search || undefined,
                  sort: sort === "newest" ? undefined : sort,
                  page: String(page + 1),
                })}`}
                className={`btn btn-tb-ghost btn-sm ${page >= products.totalPages ? "disabled" : ""}`}
                aria-disabled={page >= products.totalPages}
              >
                <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
