# Ecommerce

Pastane ürünleri için e-ticaret vitrini ve yönetim paneli.

| Katman | Teknoloji | Klasör |
| --- | --- | --- |
| API | ASP.NET Core 10, EF Core, PostgreSQL | `backend/` |
| Web | Next.js 15 (App Router), React 19 | `frontend/` |
| Altyapı | Docker Compose (db + api + web) | `docker/` |

## Gereksinimler

- Yerel geliştirme: .NET SDK 10, Node.js 20, çalışan bir PostgreSQL 17
- Konteyner: Docker Engine + Compose v2

## Yerel geliştirme (Docker'sız)

```bash
# API — http://localhost:8080 (Swagger: /swagger)
cd backend
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls http://localhost:8080

# Web — http://localhost:3000
cd frontend
API_URL=http://localhost:8080 NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

Bağlantı dizesi ve JWT anahtarı `backend/appsettings.json` içindeki geliştirme
varsayılanlarından okunur; `ConnectionStrings__Default` / `Jwt__Key` ortam değişkenleriyle
ezilebilir. API açılışta migration ve örnek veriyi kendisi uygular.

## Docker — Geliştirme ortamı (hot reload)

Kaynak kod container'a **volume ile bağlanır**; API `.NET SDK` imajında `dotnet watch`,
web `node:20-alpine` imajında `next dev` ile çalışır.

```bash
cd docker
cp .env.example .env                    # ilk seferde; JWT_KEY ve POSTGRES_PASSWORD doldur
docker compose -f docker-compose.dev.yml up
```

| Servis | Adres |
| --- | --- |
| Web | http://localhost:3001 |
| API | http://localhost:8081 |
| Swagger | http://localhost:8081/swagger |

- `backend/` altındaki C# değişiklikleri `dotnet watch` ile **anında** uygulanır (hot reload);
  hot reload'a uygun olmayan değişikliklerde süreç otomatik yeniden başlar.
- `frontend/` altındaki değişiklikler `next dev` (Turbopack) ile anında yenilenir.
- Bind mount'larda dosya olayları güvenilir olmadığı için `DOTNET_USE_POLLING_FILE_WATCHER=1`
  ve `WATCHPACK_POLLING=true` ayarlıdır.
- Portlar doluysa: `DEV_API_PORT=9091 DEV_WEB_PORT=3091 docker compose -f docker-compose.dev.yml up`
- Loglar: `docker compose -f docker-compose.dev.yml logs -f api`
- Durdurma: `docker compose -f docker-compose.dev.yml down`
  (`-v` eklerseniz geliştirme veritabanı ve yüklemeleri de silinir.)

Geliştirme yığını `ecommerce-dev` adlı ayrı bir Compose projesi ve `pgdata-dev` /
`uploads-dev` volume'lerini kullanır; üretim verisine dokunmaz, iki yığın aynı anda çalışabilir.

## Docker — Üretim ortamı

Çok aşamalı imajlar: `docker/Dockerfile.api` SDK imajında `dotnet publish -c Release` yapıp
çıktıyı ASP.NET Runtime imajına taşır, `docker/Dockerfile.web` build sonrası Next.js
`standalone` çıktısını ayrı bir Node runner imajında çalıştırır. Çalışma imajlarında SDK,
derleme araçları ve geliştirme bağımlılıkları bulunmaz.

```bash
cd docker
cp .env.example .env                    # JWT_KEY (en az 32 karakter) ve POSTGRES_PASSWORD üret
docker compose up -d --build
```

| Servis | Adres |
| --- | --- |
| Web | http://localhost:3000 |
| API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger |

- Üretimde `JWT_KEY` ve `POSTGRES_PASSWORD` mutlaka değiştirilmelidir:
  `openssl rand -hex 32`
- Loglar: `docker compose logs -f api`
- Durdurma: `docker compose down` — `pgdata` ve `uploads` volume'leri korunur.
  `docker compose down -v` veritabanını ve yüklenen görselleri de siler.

### Örnek hesaplar (seed)

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Yönetici | admin@ecommerce.com | Admin123! |
| Müşteri | ayse@example.com | Demo123! |

## Ortam değişkenleri

`docker/.env.example` dosyasını `docker/.env` olarak kopyalayın (`.env` sürüm kontrolüne girmez).
Sık kullanılanlar: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_KEY`, `JWT_ISSUER`,
`JWT_AUDIENCE`, `WEB_ORIGIN`, `NEXT_PUBLIC_API_URL`, `WEB_PORT`, `API_PORT`.
Geliştirme dosyası ayrıca `DEV_API_PORT`, `DEV_WEB_PORT`, `DEV_WEB_ORIGIN`,
`DEV_NEXT_PUBLIC_API_URL` değişkenlerini kabul eder.
