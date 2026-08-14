# Spreadsheet Rescue V10 - Release Checklist

## Final status

- [x] Feature freeze and visual identity preserved
- [x] Production metadata, manifest, robots, and 404
- [x] Runtime error handling and accessibility hardening
- [x] Empty/header-only CSV rejection
- [x] CSV delimiter and quoted-newline edge cases
- [x] 20k-row CSV stress check
- [x] Quote -> Intake shared state
- [x] Client Report and compact share payload
- [x] Local history and compare
- [x] Desktop, 390px, and 320px responsive checks
- [x] Local-processing privacy audit
- [x] Pinned SheetJS CE 0.20.3 vendored under `/vendor/`
- [x] Pinned qrcodejs 1.0.0 vendored under `/vendor/`
- [x] `npm run finalize` completed successfully
- [x] `npm run preflight` - 14/14 PASS
- [x] Real demo XLSX read / scan / safe-clean / reopened validation
- [x] Formula-cell protection regression
- [x] Real QR render and share-link fresh-tab roundtrip
- [x] Intake quote handoff
- [x] Client report, HTML export, and print action smoke test
- [x] Final security scan: no secrets, analytics, or app-level network sender

## Deployment verification after push

- [ ] GitHub Pages Actions deployment completes
- [ ] Verify `https://zainuddinalfatih010-coder.github.io/spreadsheet-rescue/`
- [ ] Verify deployed CSP/security headers
- [ ] Verify deployed share link on a second browser/device
- [ ] Optional: Android/mobile-browser hosted smoke test
- [ ] Optional: Firefox/WebKit, Lighthouse, and Excel/Google Sheets checks

**V10 FINAL - READY TO DEPLOY.**
