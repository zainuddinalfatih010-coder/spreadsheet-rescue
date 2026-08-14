# Spreadsheet Rescue V10 — Release Candidate

## Run locally

Use an HTTP server (recommended; do not rely on `file://` for final QA):

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## Production structure

- `index.html` — semantic page shell
- `assets/styles.css` — locked chunky/punchy UI
- `assets/app.js` — X-Ray, safe cleaner, quote, intake, reports, share, history
- `_headers` — suggested Cloudflare Pages / Netlify security headers
- `_redirects`, `404.html`, `robots.txt`, `site.webmanifest`
- `test-fixtures/` — QA inputs

## Dependency status

V10 RC uses pinned external browser scripts:

- SheetJS CE `0.20.3` from the authoritative SheetJS CDN
- `qrcodejs` `1.0.0` from jsDelivr

Before the **final production launch**, vendor both scripts into `/vendor/` and tighten CSP to `script-src 'self'`. The build environment used for this RC could not download those JavaScript binaries directly, so this is intentionally recorded as a release blocker instead of pretending they were vendored.

## Privacy model

Spreadsheet bytes are processed in the browser. History stores scan summaries only. Share links embed compact report summary metadata in the URL fragment; source rows are not embedded. Anyone holding a share link can read that summary.
