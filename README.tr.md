# Weather+ — sunucusuz hava durumu PWA

Tamamen **tarayıcıda** çalışan, yüklenebilir hızlı bir hava durumu uygulaması. Backend, API anahtarı ve hesap gerekmez.

## Özellikler
- Anlık durum, saatlik ve 14 günlük tahmin
- Güneş/ay bilgileri, UV, hava kalitesi, rüzgar, basınç, görüş
- **5 şehre kadar**; her şehir **15 dakikada bir** ve uygulama her açıldığında otomatik güncellenir
- Çevrimdışı destekli, yüklenebilir PWA
- `languages/*.json` dosyalarından **çoklu dil** (English, Türkçe, Deutsch, Français, Español). İlk açılışta İngilizce başlar ve dil sorar; sonradan dünya simgesinden aranıp değiştirilebilir
- Bildirim ve sunucu yok

## Proje yapısı
Derleme adımı ve framework yok: düz HTML/CSS/JS, küçük dosyalara bölünmüş. Scriptler tek bir kapsamı paylaşan klasik `<script>` etiketleridir ve `index.html` içindeki **sırayla** yüklenir.
```
index.html              sayfa iskeleti + <script> etiketleri
404.html                bağımsız "sayfa bulunamadı" ekranı (GitHub Pages otomatik sunar)
sw.js                   service worker (çevrimdışı önbellek) — yeni dosyaları SHELL'e ekle
manifest.webmanifest    PWA manifesti
css/style.css           tüm stiller
js/                     core, api, icons, themes, particles, sound, sync, metric-chart,
                        render, lifecycle, cities, i18n, app (her dosyanın başında ne yaptığı yazar)
sound/                  nature, night, rain, snowstorm, thunder_rain, wind (.mp3)
languages/              index.json + her dil için bir JSON
images/                 icon.svg, icon-192.png, icon-512.png, icon-maskable-*.png, apple-touch-icon.png
```
**Neyi nerede değiştiririm?** hava kaynağı → `js/api.js` · sync süresi / şehir sayısı → `js/core.js` · görünüm → `css/style.css` · metinler → `languages/*.json`.

## Ortam sesi
Ses dosyalarını `sound/` klasörüne koy (isimler aynı olmalı). Parça havaya göre seçilir, kesintisiz döner ve hava değişince yumuşakça geçiş yapar:
`thunder_rain.mp3` fırtına · `rain.mp3` yağmur · `snowstorm.mp3` kar · `wind.mp3` rüzgarlı (≥30 km/s veya hamle ≥50) · `nature.mp3` gündüz sakin/bulutlu/sisli · `night.mp3` gece.

Tarayıcılar ilk dokunuşa kadar sesi engeller; ses ilk etkileşimde başlar. Üst çubuktaki hoparlör düğmesi sesi kapatır/açar (hatırlanır). Ses seviyesi ve geçiş süresi `js/sound.js` içinde (`SND_VOLUME`, `SND_FADE`). Sesler Pixabay'dendir ([CREDITS.md](CREDITS.md)) ve proje lisansı kapsamında **değildir**. Sadece kullanım hakkına sahip olduğun sesleri ekle.

## Çalıştırma
`file://` ile açılmaz; yerel sunucu kullan:
```bash
python3 -m http.server 8080
```

## Yayınlama (GitHub Pages)
Tüm dosyaları repoya at → **Settings → Pages → `main` / root**.

## Dil ekleme
1. `languages/en.json` dosyasını `languages/<kod>.json` olarak kopyala, değerleri çevir (anahtarlar ve `{yer tutucular}` aynı kalsın).
2. `languages/index.json` dosyasına `{ "code": "it", "name": "Italiano", "english": "Italian" }` ekle.
3. (İsteğe bağlı) `sw.js` içindeki `SHELL` listesine ekle.

## Veri kaynakları
Open-Meteo (hava, hava kalitesi, şehir arama; CC BY 4.0, ticari olmayan kullanım ücretsiz) ve BigDataCloud (konumdan şehir adı).

## Katkı ve krediler
Sesler, veri kaynakları ve iletişim: [CREDITS.md](CREDITS.md). Katkı vermek için: [CONTRIBUTING.md](CONTRIBUTING.md).

## Yapay zekâ bildirimi
Bu proje **üretken yapay zekâyla** (Anthropic'in Claude Sonnet 5.5 modeli) insan yönlendirmesi ve kontrolüyle üretilmiştir.

## Lisans
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — atıf, ticari olmayan kullanım, aynı lisansla paylaşım. Bkz. [LICENSE](LICENSE). Ses efektleri hariçtir (Pixabay Content License).
