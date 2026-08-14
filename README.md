# Spreadsheet Rescue V10

Static client-side spreadsheet audit and safe-cleanup tool.

## Run locally

```bash
npm run finalize
npm run preflight
python -m http.server 8080
```

Open `http://localhost:8080/`.

## Production structure

- `index.html` - semantic page shell
- `assets/styles.css` - locked chunky/punchy UI
- `assets/app.js` - X-Ray, safe cleaner, quote, intake, reports, share, history
- `vendor/` - pinned local SheetJS and QR runtime dependencies
- `.github/workflows/pages.yml` - GitHub Pages deployment
- `test-fixtures/` - QA inputs

## Privacy model

Spreadsheet bytes are processed in the browser. History stores scan summaries only. Share links embed compact report summary metadata in the URL fragment; source rows are not embedded. Anyone holding a share link can read that summary.

See `V10_STATUS.md`, `QA_REPORT.md`, `DEPLOYMENT.md`, and `RELEASE_CHECKLIST.md` for release evidence.
