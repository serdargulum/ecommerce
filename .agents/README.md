# .agents

Bu klasör, "Ecommerce" projesinde çalışan kod ajanları (Claude Code, Codebuff, Codex, Cursor vb.)
için proje bilgisini ve tekrar eden iş akışlarını saklar. Ajanlar işe başlamadan ilgili `SKILL.md`
dosyasını okur; böylece her seferinde kod tabanını sıfırdan keşfetmek zorunda kalmaz.

## İçerik

| Skill | Ne zaman okunmalı |
| --- | --- |
| [`ecommerce-project`](skills/ecommerce-project/SKILL.md) | Projeye ilk kez giren herkes: mimari, çalıştırma, demo hesaplar, genel kurallar |
| [`ecommerce-backend`](skills/ecommerce-backend/SKILL.md) | API, EF Core, DTO, migration, yetkilendirme ve sipariş/stok mantığı üzerinde çalışırken |
| [`ecommerce-frontend`](skills/ecommerce-frontend/SKILL.md) | Mağaza vitrini, sepet/ödeme akışı veya yönetim paneli arayüzünde çalışırken |

## Yeni skill eklemek

1. `skills/<kebab-case-ad>/SKILL.md` dosyasını oluştur.
2. Dosya YAML başlığıyla başlasın:

   ```markdown
   ---
   name: skill-adi
   description: Ne zaman kullanılacağını anlatan tek cümle.
   ---
   ```

3. Komutları ve dosya yollarını kopyalanabilir biçimde yaz; tahminî bilgi yerine doğrulanmış
   davranışı belgele.
4. Yukarıdaki tabloya yeni satırı ekle.

## MCP sunucuları

MCP sunucuları [`.agents/.mcp.json`](.mcp.json) dosyasında tanımlıdır. Dosya proje kökünde
olmadığı için istemciler onu **otomatik bulmaz**; açıkça göstermen gerekir:

```bash
# Claude Code
claude --mcp-config .agents/.mcp.json

# Cursor: aynı mcpServers bloğunu .cursor/mcp.json içine kopyala
mkdir -p .cursor && cp .agents/.mcp.json .cursor/mcp.json

# VS Code: aynı içeriği .vscode/mcp.json içine "servers" anahtarıyla taşı
```

Kök dizinde otomatik keşif istiyorsan `.agents/.mcp.json` dosyasını köke kopyalamak yerine sembolik
bağlantı kullan: `ln -s .agents/.mcp.json .mcp.json`.

| Sunucu | Ne sağlar | Gereksinim |
| --- | --- | --- |
| `github` | Issue/PR, kod arama, commit ve repo işlemleri (46 araç) | Docker + `GITHUB_PERSONAL_ACCESS_TOKEN` |
| `postgres` | Şema inceleme, salt-okunur SQL, index/sorgu analizi | Docker + çalışan `ecommerce-db` |
| `playwright` | Tarayıcıyı açıp vitrin/panel akışlarını gerçek tarayıcıda doğrulama | Node (`npx`) |
| `context7` | Next.js, EF Core gibi kütüphanelerin güncel dokümantasyonu | İnternet (uzak HTTP sunucusu) |

Postgres sunucusu `crystaldba/postgres-mcp` imajını `--access-mode=restricted` ile çalıştırır ve
bağlantıyı `POSTGRES_CONNECTION_STRING` ortam değişkeninden okur:

```bash
export POSTGRES_CONNECTION_STRING=postgresql://postgres:postgres@host.docker.internal:5432/ecommerce
```

`host.docker.internal` macOS/Windows Docker Desktop içindir. Linux'ta `args` dizisine
`--add-host=host.docker.internal:host-gateway` ekle. Veritabanı container'ı kapalıyken bu sunucu
bağlanamaz; `docker start ecommerce-db` yeterlidir.

GitHub token'ı **repoya yazılmaz**. `repo` (ve organizasyon kullanıyorsan `read:org`) kapsamlı bir
fine-grained PAT oluşturup kabuk profilinde tanımla:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_...
```

MCP istemcisi `${GITHUB_PERSONAL_ACCESS_TOKEN}` ifadesini bu ortam değişkeninden okur. Token yoksa
sunucu açılır ama GitHub çağrıları yetkisiz döner. Playwright sunucusu ilk kullanımda tarayıcı
gerektirebilir: `npx playwright install chrome`.

Playwright ve Postgres sunucuları gerçekten çalıştırılıp MCP el sıkışması doğrulandı; GitHub sunucusu
geçersiz token ile 46 aracı listeledi (gerçek çağrılar için geçerli PAT gerekir). Context7 uzak
endpoint'i de `initialize` isteğine yanıt verdi.

## Docker ile çalıştırma

İki ortam ayrı Compose dosyalarındadır; ikisi de aynı üç servisi (`db`, `api`, `web`) ayağa
kaldırır. Ayrıntılı runbook kök [`README.md`](../README.md) dosyasındadır.

| Ortam | Dosya | API | Web |
| --- | --- | --- | --- |
| Geliştirme (hot reload) | [`docker/docker-compose.dev.yml`](../docker/docker-compose.dev.yml) | `:8081` | `:3001` |
| Üretim | [`docker/docker-compose.yml`](../docker/docker-compose.yml) | `:8080` | `:3000` |

```bash
cd docker
cp .env.example .env                              # JWT_KEY ve POSTGRES_PASSWORD değerlerini doldur

docker compose -f docker-compose.dev.yml up       # development: dotnet watch + next dev
docker compose up -d --build                      # production: derlenmiş imajlar
```

Geliştirmede `backend/` ve `frontend/` bind mount edilir; `dotnet watch` polling ile C#
değişikliklerini anında uygular, frontend Turbopack HMR kullanır. Geliştirme yığını
`ecommerce-dev` projesi ve `pgdata-dev` / `uploads-dev` volume'lerini kullanır, bu yüzden
üretim verisine dokunmaz ve iki yığın aynı anda çalışabilir. Üretim imajları çok aşamalıdır:
SDK yalnızca build aşamasında kalır, çalışma imajında ASP.NET Runtime ve Next.js standalone
çıktısı bulunur.

API açılışta migration ve seed çalıştırır; yüklenen görseller `uploads` adlı Docker
volume'ünde, veritabanı `pgdata` volume'ünde kalır. Yerel `dotnet run` / `npm run dev` süreçleri
3000 ve 8080 portlarını kullandığı için üretim Compose'undan önce onları durdur ya da
`API_PORT` / `WEB_PORT` değişkenleriyle başka port seç.

## Notlar

- Ajan talimatları Türkçe ürün diliyle uyumlu olacak şekilde Türkçe yazılır; kod, komut ve
  tanımlayıcılar İngilizce kalır.
- Sırlar (JWT anahtarı, veritabanı şifresi, API anahtarları) bu klasöre veya repoya yazılmaz.
  Geliştirme varsayılanları `appsettings.json` içindedir ve yalnızca yerel kullanım içindir.
