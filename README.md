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
- Custom `404.html` page (also translated)

## Project structure
No build step, no framework: plain HTML/CSS/JS split into small files. The scripts are classic `<script>` tags that share one scope and are loaded **in the order listed in `index.html`**.
```
index.html              page markup + <script> tags
404.html                self-contained "page not found" screen (GitHub Pages serves it automatically)
sw.js                   service worker (offline cache) — add new files to SHELL
manifest.webmanifest    PWA manifest
css/
  style.css             all styles
js/
  core.js               helpers ($, localStorage wrapper), city list, constants (MAXC=5, SYNC=15 min)
  api.js                Open-Meteo requests (the only file that talks to the weather API)
  icons.js              animated SVG weather icons
  themes.js             sky colors by weather / time of day
  particles.js          canvas effects (rain, snow, stars)
  sound.js              ambient weather sound (Web Audio, loop + cross-fade)
  sync.js               load(), 15-min auto sync, formatters, sun tile
  metric-chart.js       hourly detail chart (double-tap a tile)
  render.js             renders the whole screen (day list, moon/sun, tiles)
  lifecycle.js          timers, visibility/online events, install prompt
  cities.js             city slots, setup sheet, geolocation, city search
  i18n.js               language loading + picker (tx() translator)
  app.js                boot() and service worker registration
sound/                  nature, night, rain, snowstorm, thunder_rain, wind (.mp3)
languages/              index.json + one JSON file per language
images/                 icon.svg, icon-192.png, icon-512.png, icon-maskable-*.png, apple-touch-icon.png
```
**Where do I change…?** weather source → `js/api.js` · sync interval or max cities → `js/core.js` · colors/looks → `css/style.css` · texts → `languages/*.json`.

## Ambient sound
Put your audio files in `sound/` (names must match). The track follows the weather, loops gapless and cross-fades when conditions change:

| File | Played when |
|---|---|
| `thunder_rain.mp3` | thunderstorm |
| `rain.mp3` | rain / drizzle |
| `snowstorm.mp3` | snow |
| `wind.mp3` | windy (wind ≥ 30 km/h or gusts ≥ 50 km/h) |
| `nature.mp3` | calm/cloudy/fog by day |
| `night.mp3` | calm/cloudy/fog at night |

Browsers block audio until the first tap, so sound starts on your first interaction. The speaker button in the top bar mutes/unmutes (remembered). Tweak volume/fade in `js/sound.js` (`SND_VOLUME`, `SND_FADE`). Sounds are from Pixabay (see [CREDITS.md](CREDITS.md)) and are **not** covered by the project license. Only add audio you have the rights to.

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

## Credits
Audio, data sources and contact: [CREDITS.md](CREDITS.md). Want to help? See [CONTRIBUTING.md](CONTRIBUTING.md).

## AI disclosure
This project was **generated with generative AI** (Claude Sonnet 5.5 by Anthropic) under human direction and review.

## License
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — attribution, non-commercial, share-alike. See [LICENSE](LICENSE). Sound effects are excluded (Pixabay Content License).
