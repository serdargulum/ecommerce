---
name: tatlibisey-frontend
description: Next.js 15 App Router mağaza vitrini ve yönetim paneli yapısı, API istemcisi, sepet/oturum saklama, tasarım sistemi ve doğrulama komutları. Frontend'de değişiklik yapmadan önce oku.
---

# Frontend — Next.js + Bootstrap 5

Next.js 15 App Router, React 19, TypeScript, Bootstrap 5 **yalnızca CSS** olarak kullanılır
(`bootstrap/dist/css/bootstrap.min.css` + `bootstrap-icons`); Bootstrap JS ve jQuery yoktur.
Mobil menü, sekmeler ve galeri React state ile yazılmıştır.

## Rotalar

**Vitrin — `app/(store)/`:** `/` (ana sayfa), `/urunler` (arama, kategori, sıralama, sayfalama),
`/urun/[slug]` (galeri + sepete ekle), `/sepet`, `/odeme`, `/siparis-takip`, `/hesap` (giriş/kayıt/geçmiş).
Ortak navbar/footer `app/(store)/layout.tsx` içindedir.

**Panel — `app/admin/`:** `/admin/giris`, `/admin` (dashboard), `/admin/urunler`,
`/admin/urunler/yeni`, `/admin/urunler/[id]`, `/admin/kategoriler`, `/admin/siparisler`,
`/admin/siparisler/[id]`, `/admin/musteriler`, `/admin/odeme-ayarlari`.
`app/admin/layout.tsx` yönetim menüsünü ve oturum korumasını (`useAdminToken`) yönetir.

## API erişimi

- `lib/api.ts` → `apiFetch<T>(path, { method, body, token })`: hata durumunda `ApiError`
  (`status`, `errors`) fırlatır; ağ hatasında `status = 0`.
- `assetUrl(url)`: API'den gelen `/uploads/...` yolunu `NEXT_PUBLIC_API_URL` ile birleştirir.
- Görsellerde `next/image` **kullanılmaz**; düz `<img>` + `assetUrl()` kullanılır (API farklı origin'de).
- `API_URL` sunucu bileşenlerinde, `NEXT_PUBLIC_API_URL` tarayıcıda geçerlidir. Yeni bir istemci
  bileşeni eklerken sunucu tarafında `apiFetch` çağırma; `useEffect` içinde token ile çağır.

## İstemci durumu

| Ne | Nerede | Anahtar |
| --- | --- | --- |
| Sepet | `components/CartProvider.tsx` (`useCart`) | `localStorage` → `tb_cart_v1` |
| Müşteri token'ı | `lib/auth.ts` → `customerAuth` | `tb_customer_token` |
| Yönetici token'ı | `lib/auth.ts` → `adminAuth` | `tb_admin_token` |
| Oturum değişimi | `AUTH_EVENT` (`tb-auth-change`) | navbar rozetini günceller |

Sepet yalnızca ürün id, ad, fiyat, görsel ve adet tutar; ödeme sayfasında fiyatlar sunucudan gelen
katalogla doğrulanır. Sipariş oluşturulunca sepet temizlenir ve `/siparis-takip?no=...` sayfasına gidilir.

## Tasarım sistemi

Tüm stiller `app/globals.css` içinde: krem/berry/kahve paleti, Playfair Display + Inter, `.btn-berry`,
`.product-card`, `.price-old`, `.badge-*`, `.admin-*` gibi sınıflar. Yeni bileşen eklerken mevcut
sınıfları ve CSS değişkenlerini kullan; ayrı bir CSS dosyası veya CSS-in-JS ekleme.
Para/tarih biçimlendirmesi `lib/format.ts`, durum etiketleri `lib/order-status.ts` üzerinden yapılır.

## Kurallar

- Tüm sayfa metinleri Türkçe; para `₺` ve `tr-TR` biçiminde (`formatPrice`).
- Sunucu bileşenlerinde `fetch` önbelleği kapatılır (`cache: "no-store"`); ürün/sipariş verisi canlıdır.
- Yönetim sayfaları istemci bileşenidir: token `useAdminToken()` ile alınır, yoksa `/admin/giris`'e
  yönlendirilir. Yeni panel sayfasında aynı deseni kullan.
- API hataları kullanıcıya `ApiError.message` ile gösterilir; doğrulama hataları `errors` alanından
  ilgili input'un altına yazılır (`AdminProductForm` örneği).
- Form doğrulamasını hem istemcide (UX) hem sunucuda (DTO) bırak; istemci doğrulaması güvenlik sayılmaz.

## Doğrulama

```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build          # next build --turbopack
```

Geliştirme: `API_URL=http://localhost:8080 NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev`
(`http://localhost:3000`). API kapalıyken sayfalar "Sunucuya ulaşılamadı" hatası gösterir; bu beklenen
davranıştır, sahte veri eklemeyin.
