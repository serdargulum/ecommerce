# .agents

Bu klasör, "Tatlı Bi'şey" projesinde çalışan kod ajanları (Claude Code, Codebuff, Codex, Cursor vb.)
için proje bilgisini ve tekrar eden iş akışlarını saklar. Ajanlar işe başlamadan ilgili `SKILL.md`
dosyasını okur; böylece her seferinde kod tabanını sıfırdan keşfetmek zorunda kalmaz.

## İçerik

| Skill | Ne zaman okunmalı |
| --- | --- |
| [`tatlibisey-project`](skills/tatlibisey-project/SKILL.md) | Projeye ilk kez giren herkes: mimari, çalıştırma, demo hesaplar, genel kurallar |
| [`tatlibisey-backend`](skills/tatlibisey-backend/SKILL.md) | API, EF Core, DTO, migration, yetkilendirme ve sipariş/stok mantığı üzerinde çalışırken |
| [`tatlibisey-frontend`](skills/tatlibisey-frontend/SKILL.md) | Mağaza vitrini, sepet/ödeme akışı veya yönetim paneli arayüzünde çalışırken |

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

Proje kökündeki [`.mcp.json`](../.mcp.json) dosyası, proje kapsamlı MCP sunucularını tanımlar.
Claude Code bu dosyayı otomatik bulur (ilk açılışta güven onayı ister); Cursor kullanıyorsan aynı
`mcpServers` bloğunu `.cursor/mcp.json` içine kopyala.

| Sunucu | Ne sağlar | Gereksinim |
| --- | --- | --- |
| `github` | Issue/PR, kod arama, commit ve repo işlemleri (46 araç) | Docker + `GITHUB_PERSONAL_ACCESS_TOKEN` |
| `postgres` | Şema inceleme, salt-okunur SQL, index/sorgu analizi | Docker + çalışan `tatlibisey-db` |
| `playwright` | Tarayıcıyı açıp vitrin/panel akışlarını gerçek tarayıcıda doğrulama | Node (`npx`) |
| `context7` | Next.js, EF Core gibi kütüphanelerin güncel dokümantasyonu | İnternet (uzak HTTP sunucusu) |

Postgres sunucusu `crystaldba/postgres-mcp` imajını `--access-mode=restricted` ile çalıştırır;
`DATABASE_URI` içindeki `host.docker.internal` macOS/Windows Docker Desktop içindir. Linux'ta
`args` dizisine `--add-host=host.docker.internal:host-gateway` ekle. Veritabanı container'ı kapalıyken
bu sunucu bağlanamaz; `docker start tatlibisey-db` yeterlidir.

GitHub token'ı **repoya yazılmaz**. `repo` (ve organizasyon kullanıyorsan `read:org`) kapsamlı bir
fine-grained PAT oluşturup kabuk profilinde tanımla:

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_...
```

MCP istemcisi `${GITHUB_PERSONAL_ACCESS_TOKEN}` ifadesini bu ortam değişkeninden okur. Token yoksa
sunucu açılır ama GitHub çağrıları yetkisiz döner. Playwright sunucusu ilk kullanımda tarayıcı
gerektirebilir: `npx playwright install chrome`.

Playwright ve Postgres sunucuları gerçekten çalıştırılıp MCP el sıkışması doğrulandı; GitHub sunucusu
geçersiz token ile 46 aracı listeledi (gerçek çağrılar için geçerli PAT gerekir).

## Notlar

- Ajan talimatları Türkçe ürün diliyle uyumlu olacak şekilde Türkçe yazılır; kod, komut ve
  tanımlayıcılar İngilizce kalır.
- Sırlar (JWT anahtarı, veritabanı şifresi, API anahtarları) bu klasöre veya repoya yazılmaz.
  Geliştirme varsayılanları `appsettings.json` içindedir ve yalnızca yerel kullanım içindir.
