---
name: tatlibisey-project
description: Tatlı Bi'şey e-ticaret projesinin mimarisi, yerel çalıştırma adımları, demo hesapları ve genel kod kuralları. Projede ilk kez değişiklik yapmadan önce oku.
---

# Tatlı Bi'şey — Proje Rehberi

Günlük taze pasta ve tatlı satan bir mağaza: müşteri vitrini + sipariş akışı + ayrı yönetim paneli.

## Teknoloji

- **API:** ASP.NET Core Web API, `net10.0`, EF Core + Npgsql, JWT, BCrypt, Swagger.
- **Web:** Next.js 15 (App Router, Turbopack), React 19, Bootstrap 5 (yalnızca CSS; Bootstrap JS yok).
- **Veritabanı:** PostgreSQL 17 (Docker).
- **Dil:** Arayüz ve API mesajları Türkçe; kod/tanımlayıcılar İngilizce.

## Dizin yapısı

```
backend/
  Controllers/          genel uçlar (products, categories, orders, auth, payment-methods)
  Controllers/Admin/    [Authorize(Roles = "Admin")] yönetim uçları
  Services/             somut servis sınıfları + Mapping.cs (elle DTO dönüşümü)
  Dtos/                 istek/yanıt modelleri, DataAnnotations doğrulamaları
  Data/                 AppDbContext, DbSeeder, DatabaseInitializer (migration + seed)
  Models/               EF varlıkları (tb_* tabloları)
  Migrations/           EF Core migration'ları
  wwwroot/uploads/      çalışma zamanında yüklenen görseller
  wwwroot/uploads/seed/ seed görselleri (lisans bilgileri credits.json)
frontend/
  app/(store)/          vitrin: /, /urunler, /urun/[slug], /sepet, /odeme, /siparis-takip, /hesap
  app/admin/            panel: giris, dashboard, urunler, kategoriler, siparisler, musteriler, odeme-ayarlari
  components/           CartProvider, navbar/footer, ürün kartı/galeri, sipariş durum bileşenleri, AdminProductForm
  lib/                  api.ts (apiFetch/assetUrl), auth.ts (token saklama), types.ts, format.ts, admin.ts
  app/globals.css       tüm tasarım sistemi (renkler, tipografi, bileşen sınıfları)
```

## Yerel çalıştırma

```bash
# 1) Veritabanı
docker run -d --name tatlibisey-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=tatlibisey \
  -p 5432:5432 postgres:17-alpine

# 2) API (migration + seed açılışta otomatik çalışır) — http://localhost:8080, Swagger: /swagger
cd backend && ASPNETCORE_ENVIRONMENT=Development dotnet run --urls http://localhost:8080

# 3) Web — http://localhost:3000
cd frontend && API_URL=http://localhost:8080 NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

`API_URL` sunucu tarafı (SSR) isteklerinde, `NEXT_PUBLIC_API_URL` tarayıcı isteklerinde ve görsel
adreslerinde kullanılır. Docker içinde `API_URL=http://api:8080` olurken tarayıcı adresi
`http://localhost:8080` kalır.

## Demo hesaplar

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Yönetici | `admin@tatlibisey.com` | `Admin123!` |
| Müşteri | `ayse@example.com` | `Demo123!` |

Seed: 5 kategori, 10 ürün (biri stok 0, biri stok 3), 3 örnek sipariş. `DbSeeder` yalnızca boş
veritabanında çalışır; veriyi sıfırlamak için Postgres volume'ünü silmek gerekir.

## Kod kuralları

- MediatR/CQRS, AutoMapper, repository katmanı **yok**. Controller → servis sınıfı → `AppDbContext`.
- DTO dönüşümleri `Services/Mapping.cs` içinde elle yapılır; yeni alan eklerken burayı güncelle.
- Doğrulama `DataAnnotations` ile DTO'da; hata gövdesi `{ "message": "...", "errors": { alan: [mesaj] } }`.
- Tüm hatalar `ExceptionHandlingMiddleware` üzerinden tek biçimde döner; kontrolörde try/catch yazma.
- Mağaza tarafındaki parasal değerler `decimal`, tarihler UTC saklanır, gösterim `lib/format.ts` ile TR biçiminde.
- Yeni sayfa eklerken mevcut `app/(store)` / `app/admin` düzenlerini ve `globals.css` sınıflarını kullan;
  yeni bir UI kütüphanesi ekleme.

## Doğrulama

```bash
cd backend && dotnet build
cd frontend && npx tsc --noEmit && npm run lint && npm run build
```

Projede otomatik test yok; kritik akışlar (sipariş verme, durum güncelleme) elle veya `curl` ile doğrulanır.

## Bilinçli sınırlar (eksik özellik gibi raporlama)

- **Kredi kartı gerçek tahsilat yapmaz.** Sipariş `Unpaid` olarak kaydedilir; sanal POS entegrasyonu yoktur.
  `PaymentMethodService` ve `OrderService` entegrasyon noktası olarak hazırlanmıştır.
- Kargo her zaman ücretsizdir (`ShippingTotal = 0`).
- Kampanya, kupon, puan/sadakat programı kapsam dışıdır.
- Görseller yerel diske yazılır (`wwwroot/uploads`); S3/CDN entegrasyonu yoktur.
- E-posta/SMS bildirimi gönderilmez; sipariş takibi numara ile manuel sorgulanır.
