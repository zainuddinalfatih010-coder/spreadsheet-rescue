import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const vendorDir = path.join(root, "vendor");

const deps = [
  {
    name: "SheetJS CE 0.20.3",
    url: "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js",
    file: "xlsx.full.min.js",
    minBytes: 500_000,
    marker: "XLSX"
  },
  {
    name: "qrcodejs 1.0.0",
    url: "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js",
    file: "qrcode.min.js",
    minBytes: 10_000,
    marker: "QRCode"
  }
];

function get(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error(`Too many redirects: ${url}`));
    https.get(url, {
      headers: {
        "User-Agent": "Spreadsheet-Rescue-V10-Vendor/1.0",
        "Accept": "application/javascript,text/plain,*/*"
      }
    }, res => {
      const status = res.statusCode || 0;
      if ([301,302,303,307,308].includes(status) && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        return resolve(get(next, redirects + 1));
      }
      if (status !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${status} for ${url}`));
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function atomicWrite(file, data) {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

async function main() {
  await fs.mkdir(vendorDir, { recursive: true });

  for (const dep of deps) {
    process.stdout.write(`Downloading ${dep.name}... `);
    const data = await get(dep.url);
    const text = data.toString("utf8");

    if (data.length < dep.minBytes) {
      throw new Error(`${dep.name}: unexpected file size ${data.length} bytes`);
    }
    if (!text.includes(dep.marker)) {
      throw new Error(`${dep.name}: expected marker "${dep.marker}" not found`);
    }

    await atomicWrite(path.join(vendorDir, dep.file), data);
    console.log(`${data.length.toLocaleString()} bytes`);
  }

  const indexPath = path.join(root, "index.html");
  let index = await fs.readFile(indexPath, "utf8");

  const replacements = [
    [
      '<script defer src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>',
      '<script defer src="vendor/xlsx.full.min.js"></script>'
    ],
    [
      '<script defer src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>',
      '<script defer src="vendor/qrcode.min.js"></script>'
    ]
  ];

  for (const [from, to] of replacements) {
    if (index.includes(from)) index = index.replace(from, to);
    else if (!index.includes(to)) throw new Error(`index.html dependency tag not found: ${from}`);
  }
  await atomicWrite(indexPath, index);

  const headersPath = path.join(root, "_headers");
  let headers = await fs.readFile(headersPath, "utf8");
  headers = headers.replace(
    "script-src 'self' https://cdn.sheetjs.com https://cdn.jsdelivr.net",
    "script-src 'self'"
  );
  await atomicWrite(headersPath, headers);

  const notice = `THIRD-PARTY RUNTIME DEPENDENCIES

SheetJS Community Edition 0.20.3
Source: https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js
Project/docs: https://docs.sheetjs.com/
License: Apache-2.0

qrcodejs 1.0.0
Source: https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js
Project: https://github.com/davidshimjs/qrcodejs
License: MIT

These files are vendored for runtime stability. See upstream projects for license text and notices.
`;
  await atomicWrite(path.join(vendorDir, "THIRD_PARTY_NOTICES.txt"), notice);
  await atomicWrite(path.join(root, ".vendor-finalized"), `${new Date().toISOString()}\n`);

  console.log("\nVendor finalize complete.");
  console.log("Run: npm run preflight");
}

main().catch(err => {
  console.error("\nVENDOR FINALIZE FAILED");
  console.error(err?.stack || err);
  process.exitCode = 1;
});
