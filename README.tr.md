# Weather+ — sunucusuz hava durumu PWA

Tamamen **tarayıcıda** çalışan, yüklenebilir hızlı bir hava durumu uygulaması. Backend, API anahtarı ve hesap gerekmez.

## Özellikler
- Anlık durum, saatlik ve 14 günlük tahmin
- Güneş/ay bilgileri, UV, hava kalitesi, rüzgar, basınç, görüş
- **5 şehre kadar**; her şehir **15 dakikada bir** ve uygulama her açıldığında otomatik güncellenir
- Çevrimdışı destekli, yüklenebilir PWA
- `languages/*.json` dosyalarından **çoklu dil** (English, Türkçe, Deutsch, Français, Español). İlk açılışta İngilizce başlar ve dil sorar; sonradan dünya simgesinden aranıp değiştirilebilir
- Bildirim ve sunucu yok

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

## Yapay zekâ bildirimi
Bu proje **üretken yapay zekâyla** (Anthropic'in Claude Sonnet 5.5 modeli) insan yönlendirmesi ve kontrolüyle üretilmiştir.

## Lisans
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — atıf, ticari olmayan kullanım, aynı lisansla paylaşım. Bkz. [LICENSE](LICENSE).
