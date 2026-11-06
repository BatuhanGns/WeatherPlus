# Contributing to Weather+

Thanks for helping out! Weather+ is a plain HTML/CSS/JS app: no build step, no framework, no backend.

## Ways to contribute
- 🐞 Report a bug or 💡 suggest a feature (use the issue templates)
- 🌍 Add or improve a translation
- 🛠️ Fix code, styles or docs

## Run it locally
```bash
git clone <repo-url> && cd <repo>
python3 -m http.server 8080   # open http://localhost:8080
```
Open it over `http://`, not `file://`. If you changed cached files, do a hard refresh (the service worker caches aggressively).

## Project layout
See the **Project structure** section in [README.md](README.md). Quick rules:
- Scripts in `js/` are classic `<script>` tags sharing one scope and loaded **in the order listed in `index.html`**. If you add a file, add it there **and** to `SHELL` in `sw.js`.
- Weather API calls live only in `js/api.js`. User-visible text lives only in `languages/*.json` (use `tx('key')`), never hard-coded.
- Bump the cache version (`V`) in `sw.js` when you change cached files.
- Keep code comments in English.

## Adding a language
1. Copy `languages/en.json` to `languages/<code>.json` and translate the values (keep keys and `{placeholders}`).
2. Add it to `languages/index.json`.
3. Check the app and `404.html` in that language.

## Pull requests
- Keep them small and focused; describe what and why.
- Test in a real browser (mobile width too) and with the network off.
- Tell us if AI tools helped write your change.
- By contributing you agree that your work is released under [CC BY-NC-SA 4.0](LICENSE). Don't add audio or images you don't have the rights to, and add credits to [CREDITS.md](CREDITS.md) for anything third-party.

Questions: support.weatherplus@gmail.com
