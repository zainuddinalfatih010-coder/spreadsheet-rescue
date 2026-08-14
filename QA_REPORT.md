# Spreadsheet Rescue V10 - Final QA Report

Build: `V10 FINAL`

## Verdict

**Final: PASS - 19/19 core checks plus production-hardening regression passed.**

The pinned runtime dependencies are vendored locally and the production preflight gate passes.

## Finalization evidence

- `npm run finalize`: PASS.
- SheetJS CE 0.20.3: `/vendor/xlsx.full.min.js`, 951,904 bytes.
- qrcodejs 1.0.0: `/vendor/qrcode.min.js`, 19,927 bytes.
- `npm run preflight`: **14/14 PASS**.
- `index.html` has only local runtime script references; `_headers` uses `script-src 'self'`.

## Regression evidence

- Empty CSV: rejected with `File kosong.`
- Header-only CSV: rejected with `CSV harus punya header + minimal 1 data row.`
- Semicolon CSV: scanned successfully, health 86/100.
- Quoted-newline CSV: scanned successfully, health 100/100.
- Demo XLSX: scanned successfully, 9 sheets, 1,028 rows, health 96/100.
- Demo clean XLSX: reopened successfully with SheetJS; 10 sheets including `RESCUE_LOG`.
- Formula fixture: formula `B2*C2` survived clean-copy generation unchanged; formula cell was not overwritten.
- CSV and XLSX safe-clean downloads were generated successfully.
- QR: both `<img>` and `<canvas>` rendered.
- Share: a 528-character local-host URL roundtripped into a fresh tab with report, health, and quote state; no plain raw row text appeared in the URL.
- Intake: final recommendation inherited `Data Rescue+` and `Rp300-500k` from the scan quote.
- Client Report dialog and downloadable HTML generated; print action completed without runtime errors.
- History persisted across reload and compared two scans side by side.
- Responsive: no horizontal overflow at desktop, 390px, or 320px viewport checks.

## Privacy and security audit

V10 runtime source contains no app-level `fetch(...)`, `XMLHttpRequest`, `navigator.sendBeacon`, WebSocket, secrets, API keys, or analytics tags. Build-time vendor URLs remain only in `scripts/vendor-deps.mjs` and notices; they are not runtime dependencies.

Local history uses the browser `spreadsheet_rescue_scan_history_v1` key and stores compact scan summaries only, not source spreadsheet bytes. Share links contain report summary, quote, optional intake, and branding; raw spreadsheet rows are not embedded.

## Final gate

**V10 FINAL - READY TO DEPLOY.** Local production gate is complete. Hosted-origin verification remains an external deployment check.

Remaining optional checks: Android/mobile-browser hosted smoke test, Firefox/WebKit smoke test, Lighthouse, and opening the clean XLSX in Excel/Google Sheets.
