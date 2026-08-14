# Dependency Status - V10 Final

Runtime dependencies are pinned, vendored, and referenced locally.

- SheetJS Community Edition 0.20.3
  - file: `/vendor/xlsx.full.min.js`
  - verified size: 951,904 bytes
  - source used by the build finalizer: `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`
- qrcodejs 1.0.0
  - file: `/vendor/qrcode.min.js`
  - verified size: 19,927 bytes
  - source used by the build finalizer: `https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js`

The source URLs are build-time provenance only. No remote runtime script remains after finalization. `vendor/THIRD_PARTY_NOTICES.txt` records license and upstream notice information.
