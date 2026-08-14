# Spreadsheet Rescue V10 - Deployment

The site is a static client-side app and is prepared for GitHub Pages.

## Local production gate

```bash
npm run finalize
npm run preflight
```

`finalize` vendors the pinned SheetJS CE 0.20.3 and qrcodejs 1.0.0 files under `/vendor/`, rewrites runtime script tags to local files, tightens CSP to `script-src 'self'`, and runs preflight. The final preflight result is 14/14 PASS.

## GitHub Pages

The repository includes `.github/workflows/pages.yml`. Pushes to `main` publish the repository root through the official Pages artifact/deploy actions. The relative asset paths work from:

`https://zainuddinalfatih010-coder.github.io/spreadsheet-rescue/`

The first deployment may require the repository owner's GitHub Pages permission/settings. Do not claim the URL is live until the Actions run and hosted smoke test succeed.

## Hosted smoke test

- boot with no JavaScript errors;
- CSV scan and safe-clean download;
- real XLSX scan and valid clean XLSX download;
- QR generation and share-link roundtrip;
- Intake, Client Report, HTML export, and print/save-PDF action;
- local history/compare;
- desktop/mobile layout and deployed response headers.
