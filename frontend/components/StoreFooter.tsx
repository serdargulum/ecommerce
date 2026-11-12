import Link from "next/link";

export default function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="footer-brand mb-2">
              Ecommerce<span className="brand__dot">.</span>
            </div>
            <p className="mb-3" style={{ maxWidth: "38ch", fontSize: "0.9rem" }}>
              Her sabah kendi mutfağımızda hazırladığımız pastalar, kurabiyeler ve şerbetli
              tatlılar. Katkısız malzeme, ölçülü şeker, gerçek lezzet.
            </p>
            <div className="d-flex gap-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="icon-btn" aria-label="Instagram">
                <i className="bi bi-instagram" aria-hidden="true" />
              </a>
              <a href="mailto:merhaba@ecommerce.com" className="icon-btn" aria-label="E-posta">
                <i className="bi bi-envelope" aria-hidden="true" />
              </a>
              <a href="tel:+902120000000" className="icon-btn" aria-label="Telefon">
                <i className="bi bi-telephone" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h5>Mağaza</h5>
            <div className="d-flex flex-column gap-2">
              <Link href="/urunler">Tüm Ürünler</Link>
              <Link href="/urunler?category=pastalar">Pastalar</Link>
              <Link href="/urunler?category=serbetli-tatlilar">Şerbetli Tatlılar</Link>
              <Link href="/urunler?category=kurabiye-makaron">Kurabiye &amp; Makaron</Link>
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h5>Yardım</h5>
            <div className="d-flex flex-column gap-2">
              <Link href="/siparis-takip">Sipariş Takip</Link>
              <Link href="/hesap">Hesabım</Link>
              <Link href="/sepet">Sepetim</Link>
              <Link href="/admin/giris">Yönetim Paneli</Link>
            </div>
          </div>

          <div className="col-lg-3">
            <h5>İletişim</h5>
            <div className="d-flex flex-column gap-2" style={{ fontSize: "0.9rem" }}>
              <span>Caferağa Mah. Moda Cad. No: 12</span>
              <span>Kadıköy / İstanbul</span>
              <a href="tel:+902120000000">0212 000 00 00</a>
              <a href="mailto:merhaba@ecommerce.com">merhaba@ecommerce.com</a>
              <span className="mt-1" style={{ color: "#a5947f", fontSize: "0.82rem" }}>
                Hafta içi 09:00 – 19:00
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ecommerce. Tüm hakları saklıdır.</span>
          <span>Görseller demo amaçlıdır · Wikimedia Commons</span>
        </div>
      </div>
    </footer>
  );
}
