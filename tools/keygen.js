// Pembuat kode aktivasi Catat Toko (hanya untuk penjual, JANGAN ikut dibagikan).
// Pemakaian:  node tools/keygen.js ABCD-EFGH-JKLM
// Kata rahasia diambil dari www/config.js (LICENSE_SECRET), jadi harus sama
// dengan yang dipakai saat build aplikasi.
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const cfgPath = path.join(__dirname, "..", "www", "config.js");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(cfgPath, "utf8"), sandbox);
const secret = sandbox.window.CATAT_CONFIG && sandbox.window.CATAT_CONFIG.LICENSE_SECRET;

const dev = String(process.argv[2] || "").trim().toUpperCase();
if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(dev)) {
  console.log("Cara pakai: node tools/keygen.js <ID-PERANGKAT>");
  console.log("Contoh   : node tools/keygen.js 7KQ2-M8XA-PZ4N");
  process.exit(1);
}
if (!secret || /GANTI-DENGAN/.test(secret)) {
  console.log("Peringatan: LICENSE_SECRET di www/config.js masih bawaan. Ganti dulu sebelum menjual aplikasi.");
}

const hex = crypto.createHash("sha256").update(dev + "|" + secret, "utf8").digest("hex");
const key = hex.slice(0, 20).toUpperCase().match(/.{5}/g).join("-");
console.log("ID perangkat  : " + dev);
console.log("Kode aktivasi : " + key);
