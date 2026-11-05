<img width="653" height="236" alt="IMG_20261105_235921_47" src="https://github.com/user-attachments/assets/89c6b34a-cca8-4dbb-9476-68a35d953a03" />

<img width="1408" height="768" alt="IMG_20261106_001647_265" src="https://github.com/user-attachments/assets/3d269be9-d400-4144-b04c-b6cf174b9745" />

# Weather+ — a serverless weather PWA

A fast, installable weather app that runs **entirely in the browser**. No backend, no API keys, no accounts.

> 🇹🇷 Türkçe için: [README.tr.md](README.tr.md)

## Features
- Current conditions, hourly forecast and 14-day forecast
- Sun/moon details, UV, air quality, wind, pressure, visibility
- **Up to 5 cities**, each synced automatically **every 15 minutes** (and whenever you open the app)
- Installable PWA with offline support (last data is shown when offline)
- **Multi-language UI** loaded from `languages/*.json` (English, Türkçe, Deutsch, Français, Español). The app starts in English on first launch and asks for your language; you can search and change it any time via the globe button
- No push notifications, no server

## Project structure
```
index.html              the whole app (HTML + CSS + JS)
sw.js                   service worker (offline cache)
manifest.webmanifest    PWA manifest
languages/
  index.json            list of supported languages (shown in the picker)
  en.json, tr.json …    translations
icon*.png, icon.svg, apple-touch-icon.png
```

## Run locally
Service workers and `fetch` need http(s), so don't open `index.html` via `file://`:
```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy (GitHub Pages)
Push everything to a repo → **Settings → Pages → Deploy from branch → `main` / root**. Paths are relative, so project sites (`user.github.io/repo/`) work.

## Add a language
1. Copy `languages/en.json` to `languages/<code>.json` (e.g. `it.json`) and translate the values (keep keys and `{placeholders}` unchanged).
   - `meta.locale` is used for date formatting (e.g. `it-IT`).
   - `dirs` = 16 compass points starting at North, clockwise.
   - `wmo` = weather condition names keyed by WMO code.
2. Add an entry to `languages/index.json`: `{ "code": "it", "name": "Italiano", "english": "Italian" }`.
3. (Optional) add the file to `SHELL` in `sw.js` to pre-cache it for offline use.

Missing keys automatically fall back to English.

## Data sources
- Weather, air quality and city search: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0, free for non-commercial use)
- Reverse geocoding of your position: [BigDataCloud](https://www.bigdatacloud.com/) client-side API

## AI disclosure
This project was **generated with generative AI** (Claude Sonnet 5.5 by Anthropic) under human direction and review.

## License
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — attribution, non-commercial, share-alike. See [LICENSE](LICENSE).
