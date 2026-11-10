---
name: tatlibisey-backend
description: ASP.NET Core Web API katmanları, DTO/doğrulama kuralları, JWT yetkilendirme, sipariş-stok mantığı, görsel yükleme ve EF Core migration iş akışı. Backend'de değişiklik yapmadan önce oku.
---

# Backend — ASP.NET Core API

`net10.0`, EF Core 10 + Npgsql, JWT, BCrypt, Swashbuckle. Katmanlar: **Controller → Service → AppDbContext**.
Servisler somut sınıftır (arayüz yok), DTO dönüşümü `Services/Mapping.cs` içinde elle yapılır.

## Yapılandırma

`Program.cs` sırasıyla: controllers + camelCase JSON + `JsonStringEnumConverter` → DbContext → CORS
(`Cors:AllowedOrigins`, politika adı `frontend`) → JWT (`Jwt:Key/Issuer/Audience/ExpiryHours`) →
Swagger (`Bearer` şeması) → servisler → `ExceptionHandlingMiddleware` → static files → auth → controllers →
`/health` → migration + seed.

`UseStaticFiles` sayesinde `wwwroot` altındaki dosyalar `/uploads/...` gibi kök yoldan servis edilir.
Veritabanı bağlantısı `ConnectionStrings:Default`, varsayılan olarak `localhost:5432` / `tatlibisey`.

## Uçlar

| Grup | Yol | Not |
| --- | --- | --- |
| Ürünler | `GET /api/products`, `/api/products/{slug}`, `/api/products/{slug}/related` | yalnızca aktif ürünler, sayfalama + arama + kategori filtresi |
| Kategoriler | `GET /api/categories` | ürün sayısıyla birlikte |
| Ödeme yöntemleri | `GET /api/payment-methods` | yalnızca `IsActive` olanlar |
| Üyelik | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` | `[Authorize(Roles="Customer")]` |
| Sipariş | `POST /api/orders`, `POST /api/orders/track`, `GET /api/orders/{orderNumber}` | misafir + müşteri; takip numara + e-posta ile |
| Yönetim girişi | `POST /api/admin/auth/login`, `GET /api/admin/auth/me` | ayrı token tablosu |
| Panel | `api/admin/products`, `categories`, `orders`, `customers`, `dashboard`, `payment-methods`, `uploads` | tümü `Roles = "Admin"` |

Sipariş durumları `Pending, Approved, Preparing, Shipped, Completed, Cancelled`; ödeme durumları
`Unpaid, AwaitingConfirmation, Paid, Failed, Refunded`. Enum'lar JSON'da **string** olarak taşınır.

## Hata biçimi

- `BusinessException` → 400, `NotFoundException` → 404; middleware `{ "message": "..." }` döner.
- Model doğrulama hataları `InvalidModelStateResponseFactory` ile
  `{ "message": "...", "errors": { "alanAdi": ["mesaj"] } }` biçimine çevrilir (400).
- Yeni iş kuralı için controller'da `if` yazmak yerine servis içinde `BusinessException` fırlat.

## Yetkilendirme

JWT claim'leri: `sub` (kullanıcı id), `ClaimTypes.Name`, `ClaimTypes.Role` (`Customer` / `Admin`).
Şifreler BCrypt ile hash'lenir. Müşteri token'ları `tb_customer_token`, yönetici token'ları
`tb_admin_token` tablosunda saklanır; çıkışta ilgili kayıt silinir (`AuthService`).

## Sipariş ve stok mantığı (`Services/OrderService.cs`)

- Aynı ürün satırları `GroupBy(ProductId)` ile birleştirilir; pasif ürün veya yetersiz stok `BusinessException`.
- Sipariş oluşturulurken stok düşülür, fiyat `Product.FinalPrice` üzerinden **sunucuda** hesaplanır
  (istemciden gelen fiyat kullanılmaz). Kargo her zaman 0.
- `PaymentStatus`: havale → `AwaitingConfirmation`, diğerleri → `Unpaid`.
- Durum `Cancelled` yapılınca stok geri eklenir; iptal edilmiş sipariş yeniden açılırsa stok tekrar
  düşülür (yetersizse hata). Durum geçişleri arasında katı bir sıra kuralı yoktur.
- Sipariş numarası `OrderNumber.Create()` (örn. `TB261110-FMP6`) üretilir, çakışmada 5 kez denenir.

## Görsel yükleme (`Services/ImageStorage.cs`)

`POST /api/admin/uploads` (multipart, alan adı `file`): JPG/JPEG/PNG/WEBP, en fazla 5 MB.
Dosya `wwwroot/uploads/{guid}.{ext}` olarak yazılır, yanıt `{ "url": "/uploads/..." }`.
Seed görselleri `wwwroot/uploads/seed/` altındadır; yeni yüklemelerle karışmaması için oraya yazma.

## Migration / seed

```bash
cd backend
dotnet build                                        # --no-build ile çalıştırırken önce derle
dotnet dotnet-ef migrations add <MigrationAdi>      # yerel tool manifest: backend/dotnet-tools.json
dotnet dotnet-ef database update
```

Uygulama açılışında `DatabaseInitializer` bekleyen migration'ları uygular (DB hazır değilse birkaç kez
dener) ve `DbSeeder` yalnızca boş veritabanında örnek veriyi ekler. Şema değişince migration üretmeyi
unutma; seed'i değiştirmek mevcut veritabanını güncellemez.

## Kurallar

- Para alanları `decimal`, tarihler UTC (`DateTime.UtcNow`), dışa aktarımda ISO.
- Yeni DTO'lar `Dtos/` altında `record` olarak; doğrulama `DataAnnotations` ile.
- Yeni servis → `builder.Services.AddScoped<T>()` kaydı ve gerekiyorsa `Mapping.cs` güncellemesi.
- Gizli bilgileri `appsettings.json` yerine ortam değişkeni (`Jwt__Key`, `ConnectionStrings__Default`) ile ver.
- Değişiklikten sonra `cd backend && dotnet build` çalıştır.
