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

## Notlar

- Ajan talimatları Türkçe ürün diliyle uyumlu olacak şekilde Türkçe yazılır; kod, komut ve
  tanımlayıcılar İngilizce kalır.
- Sırlar (JWT anahtarı, veritabanı şifresi, API anahtarları) bu klasöre veya repoya yazılmaz.
  Geliştirme varsayılanları `appsettings.json` içindedir ve yalnızca yerel kullanım içindir.
