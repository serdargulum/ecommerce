"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { assetUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, count, subtotal, hydrated, setQuantity, removeItem } = useCart();

  return (
    <div className="container pb-5" style={{ paddingTop: "2.5rem" }}>
      <nav className="breadcrumb-tb mb-3" aria-label="Breadcrumb">
        <Link href="/">Ana Sayfa</Link>
        <span>/</span>
        <span>Sepetim</span>
      </nav>

      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
        <div>
          <h1 className="section-title mb-1">Sepetim</h1>
          <p className="section-lead mb-0">
            {hydrated ? `${count} ürün sepette` : "Sepetiniz yükleniyor..."}
          </p>
        </div>
        <Link href="/urunler" className="small text-muted-tb">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" /> Alışverişe devam et
        </Link>
      </div>

      {!hydrated ? (
        <div className="surface p-5 text-center text-muted-tb">Sepet yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-bag" aria-hidden="true" />
          <h3>Sepetiniz henüz boş</h3>
          <p>Vitrinimizdeki taze tatlılara göz atın, favorinizi sepete ekleyin.</p>
          <Link href="/urunler" className="btn btn-tb-dark">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="row g-4 g-lg-5">
          <div className="col-lg-7">
            <div className="surface px-3 px-md-4 py-2">
              {items.map((item) => (
                <div className="cart-row" key={item.productId}>
                  <Link href={`/urun/${item.slug}`} className="cart-row__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={assetUrl(item.imageUrl)} alt={item.name} />
                  </Link>

                  <div>
                    <Link href={`/urun/${item.slug}`} className="d-block fw-medium">
                      {item.name}
                    </Link>
                    <div className="small text-muted-tb mt-1">{formatPrice(item.unitPrice)} / adet</div>
                    {item.stock <= 5 ? (
                      <div className="small text-accent mt-1">Son {item.stock} adet</div>
                    ) : null}

                    <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
                      <div className="qty">
                        <button
                          type="button"
                          aria-label="Adet azalt"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="bi bi-dash" aria-hidden="true" />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Adet artır"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <i className="bi bi-plus" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link btn-sm text-muted-tb p-0"
                        onClick={() => removeItem(item.productId)}
                      >
                        <i className="bi bi-trash3 me-1" aria-hidden="true" /> Kaldır
                      </button>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="fw-semibold">{formatPrice(item.unitPrice * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-2 mt-3 small text-muted-tb">
              <span>
                <i className="bi bi-truck me-1" aria-hidden="true" /> Ücretsiz kargo
              </span>
              <span className="ms-md-3">
                <i className="bi bi-shield-check me-1" aria-hidden="true" /> Güvenli ödeme
              </span>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="surface p-4 position-sticky" style={{ top: 96 }}>
              <h2 className="h5 mb-3">Sipariş Özeti</h2>
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

              <Link href="/odeme" className="btn btn-tb-dark w-100 mt-3">
                Ödemeye Geç
                <i className="bi bi-arrow-right ms-2" aria-hidden="true" />
              </Link>

              <p className="small text-muted-tb mt-3 mb-0">
                Üye olmadan sipariş verebilirsiniz. Siparişinizi e-posta ve sipariş numaranızla
                takip edebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
