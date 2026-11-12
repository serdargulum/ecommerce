import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { apiFetch, assetUrl } from "@/lib/api";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Category, PagedResult, ProductDetail, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, products, heroProduct] = await Promise.all([
    apiFetch<Category[]>("/api/categories"),
    apiFetch<PagedResult<ProductListItem>>("/api/products?pageSize=8"),
    apiFetch<ProductDetail>("/api/products/frambuazli-cheesecake").catch(() => null),
  ]);

  const heroDiscount = heroProduct
    ? discountPercent(heroProduct.price, heroProduct.finalPrice)
    : null;

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-lg-6">
              <span className="eyebrow">El yapımı · Günlük taze</span>
              <h1 className="hero__title">
                Her dilimde
                <br />
                <em>küçük bir mutluluk.</em>
              </h1>
              <p className="hero__lead">
                Pastalarımızı her sabah kendi mutfağımızda, gerçek tereyağı ve bitter çikolata
                ile hazırlıyoruz. Özenle paketlenir, aynı gün yola çıkar.
              </p>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link href="/urunler" className="btn btn-tb-dark btn-lg">
                  Ürünleri Keşfet
                  <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
                </Link>
                <Link href="/siparis-takip" className="btn btn-tb-ghost btn-lg">
                  Sipariş Takip
                </Link>
              </div>

              <div className="hero__stats">
                <div className="hero__stat">
                  <strong>{products.total}</strong>
                  <span>çeşit ürün</span>
                </div>
                <div className="hero__stat">
                  <strong>{categories.length}</strong>
                  <span>kategori</span>
                </div>
                <div className="hero__stat">
                  <strong>Ücretsiz</strong>
                  <span>kargo</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assetUrl("/uploads/seed/hero.jpg")}
                  alt="Frambuazlı cheesecake"
                  width={900}
                  height={720}
                  fetchPriority="high"
                />
                <span className="hero__tag">Günün tatlısı</span>
                {heroProduct ? (
                  <Link href={`/urun/${heroProduct.slug}`} className="hero__card">
                    <div>
                      <div className="name">{heroProduct.name}</div>
                      <div className="meta">
                        {heroProduct.categoryName} · {formatPrice(heroProduct.finalPrice)}
                        {heroDiscount ? (
                          <span className="ms-2 text-accent">%{heroDiscount} indirim</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="icon-btn" aria-hidden="true">
                      <i className="bi bi-arrow-up-right" />
                    </span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
            <div>
              <h2 className="section-title mb-1">Kategoriler</h2>
              <p className="section-lead mb-0">Canınız ne çekiyorsa, bir tık uzağınızda.</p>
            </div>
            <Link href="/urunler" className="small text-muted-tb">
              Tüm ürünler <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="row g-3">
            {categories.map((category, index) => (
              <div className="col-6 col-md-4 col-lg" key={category.id}>
                <Link href={`/urunler?category=${category.slug}`} className="category-card h-100">
                  <span className="category-card__index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="category-card__name d-block">{category.name}</span>
                    <span className="category-card__count">{category.productCount} ürün</span>
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
            <div>
              <span className="eyebrow">Vitrinden</span>
              <h2 className="section-title mt-2 mb-1">Öne çıkan tatlılar</h2>
              <p className="section-lead mb-0">
                En çok tercih edilen, günlük üretilen favorilerimiz.
              </p>
            </div>
            <Link href="/urunler" className="btn btn-tb-ghost btn-sm">
              Tümünü Gör
            </Link>
          </div>

          <div className="product-gallery-grid">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-2">
        <div
          className="rounded-4 overflow-hidden"
          style={{ background: "#241914", color: "#f5eadd" }}
        >
          <div className="row g-0 align-items-stretch">
            <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center">
              <span className="eyebrow" style={{ color: "#e0b58c" }}>
                Mutfağımızdan
              </span>
              <h2
                className="mt-3 mb-3"
                style={{ color: "#faf3ea", fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}
              >
                Fırından çıktığı gün,
                <br />
                kapınızda.
              </h2>
              <p style={{ color: "#d9c9b7", maxWidth: "44ch" }}>
                Siparişiniz alındıktan sonra hazırlanır; hiçbir ürünümüz bekletilmez. Katkı
                maddesi, palm yağı veya hazır karışım kullanmıyoruz.
              </p>

              <div className="row g-3 mt-3">
                <div className="col-sm-4">
                  <div className="trust-item" style={{ color: "#e9dccd" }}>
                    <i className="bi bi-flower2" aria-hidden="true" style={{ color: "#e0b58c" }} />
                    <span>Taze malzeme</span>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="trust-item" style={{ color: "#e9dccd" }}>
                    <i className="bi bi-truck" aria-hidden="true" style={{ color: "#e0b58c" }} />
                    <span>Aynı gün kargo</span>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="trust-item" style={{ color: "#e9dccd" }}>
                    <i className="bi bi-shield-check" aria-hidden="true" style={{ color: "#e0b58c" }} />
                    <span>Güvenli ödeme</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="row g-2 p-2 p-md-3 h-100">
                <div className="col-7">
                  <div className="h-100 rounded-3 overflow-hidden" style={{ minHeight: 220 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl("/uploads/seed/baklava-2.jpg")}
                      alt="Antep fıstıklı baklava"
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>
                <div className="col-5">
                  <div className="h-100 rounded-3 overflow-hidden" style={{ minHeight: 220 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={assetUrl("/uploads/seed/makaron-2.jpg")}
                      alt="Makaron kutusu"
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="eyebrow">Nasıl çalışır?</span>
              <h2 className="section-title mt-2">Üç adımda taze tatlı</h2>
              <div className="row g-4 mt-1">
                {[
                  { icon: "bi-bag-check", title: "Sepetinizi oluşturun", text: "Üye olmadan da sipariş verebilirsiniz." },
                  { icon: "bi-credit-card", title: "Ödeme yöntemini seçin", text: "Havale, kapıda ödeme veya kredi kartı." },
                  { icon: "bi-box-seam", title: "Tazecik teslim alın", text: "Siparişiniz özenle paketlenip kargoya verilir." },
                ].map((step) => (
                  <div className="col-md-4" key={step.title}>
                    <i className={`bi ${step.icon} fs-4 text-accent`} aria-hidden="true" />
                    <h3 className="h6 mt-2 mb-1">{step.title}</h3>
                    <p className="small text-muted-tb mb-0">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-5">
              <div className="surface p-4 d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-chat-heart text-accent" aria-hidden="true" />
                  <strong className="small">Müşteri yorumu</strong>
                </div>
                <p className="mb-0" style={{ fontSize: "0.95rem" }}>
                  &ldquo;Cheesecake gerçekten ev yapımı gibiydi, kargo da çok özenliydi. Artık
                  özel günlerin adresi burası.&rdquo;
                </p>
                <div className="small text-muted-tb">Elif K. · İstanbul</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
