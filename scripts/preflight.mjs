import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const checks = [];
const add = (name, ok, detail="") => checks.push({name, ok, detail});

async function exists(rel) {
  try { await fs.access(path.join(root, rel)); return true; } catch { return false; }
}

async function main() {
  const index = await fs.readFile(path.join(root, "index.html"), "utf8");
  const headers = await fs.readFile(path.join(root, "_headers"), "utf8");
  const app = await fs.readFile(path.join(root, "assets/app.js"), "utf8");

  const xlsxExists = await exists("vendor/xlsx.full.min.js");
  const qrExists = await exists("vendor/qrcode.min.js");

  add("Vendored SheetJS exists", xlsxExists);
  add("Vendored QR exists", qrExists);

  if (xlsxExists) {
    const st = await fs.stat(path.join(root, "vendor/xlsx.full.min.js"));
    add("SheetJS file size plausible", st.size > 500_000, `${st.size} bytes`);
  }
  if (qrExists) {
    const st = await fs.stat(path.join(root, "vendor/qrcode.min.js"));
    add("QR file size plausible", st.size > 10_000, `${st.size} bytes`);
  }

  add("index uses local SheetJS", index.includes('src="vendor/xlsx.full.min.js"'));
  add("index uses local QR", index.includes('src="vendor/qrcode.min.js"'));
  add("index has no remote runtime scripts", !/<script[^>]+src=["']https?:\/\//i.test(index));
  add("CSP script-src is self-only", headers.includes("script-src 'self';"));
  add("CSP no SheetJS CDN", !headers.includes("cdn.sheetjs.com"));
  add("CSP no jsDelivr", !headers.includes("cdn.jsdelivr.net"));
  add("App has no fetch()", !/\bfetch\s*\(/.test(app));
  add("App has no XHR", !/XMLHttpRequest/.test(app));
  add("App has no sendBeacon", !/sendBeacon/.test(app));
  add("Vendor finalized marker", await exists(".vendor-finalized"));

  let failed = 0;
  for (const c of checks) {
    console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
    if (!c.ok) failed++;
  }
  console.log(`\n${checks.length-failed}/${checks.length} production preflight checks passed.`);
  if (failed) process.exitCode = 1;
}

main().catch(err => {
  console.error(err?.stack || err);
  process.exitCode = 1;
});
