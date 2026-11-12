# Catat Toko — APK Android & Aplikasi Windows

Aplikasi pencatatan toko UMKM ala BukuWarung: kasir + nota WA, utang-piutang + tagih WA,
buku kas, stok, laporan laba rugi, cadangan data, dan lisensi masa coba 30 hari.
Data tersimpan di perangkat (offline, tanpa server).

## Isi folder

| Folder / file | Fungsi |
|---|---|
| `www/` | Aplikasinya (HTML/JS). Dipakai oleh versi Windows dan Android. |
| `www/config.js` | **Pengaturan: nama aplikasi, masa coba, kata rahasia lisensi, kontak WA.** |
| `main.js` | Jendela aplikasi Windows (Electron). |
| `capacitor.config.json` | Pengaturan aplikasi Android (Capacitor). |
| `assets/` | Ikon dan splash screen. Ganti `icon.png` (1024×1024) jika ingin logo lain. |
| `tools/keygen.js` | Pembuat kode aktivasi. **Jangan ikut dibagikan ke pembeli.** |
| `.github/workflows/build.yml` | Build otomatis APK + installer Windows di GitHub. |

## Langkah 1 — Atur `www/config.js`

1. Ganti `LICENSE_SECRET` dengan kata rahasia Anda sendiri (minimal 16 karakter, simpan baik-baik).
2. Isi `KONTAK_NAMA` dan `KONTAK_WA` (nomor yang dihubungi pembeli untuk aktivasi).
3. Jika tidak perlu lisensi, ubah `LICENSE_ENABLED` menjadi `false`.

## Langkah 2 — Build otomatis lewat GitHub (cara paling mudah)

Tidak perlu install Android Studio atau Visual Studio.

1. Buat repository **private** baru di GitHub, lalu upload seluruh isi folder ini (termasuk folder `.github`).
2. Buka tab **Actions** → workflow **Build APK & Windows** berjalan otomatis (±10–15 menit).
3. Setelah selesai (centang hijau), buka run tersebut → bagian **Artifacts**:
   - `CatatToko-Windows` → berisi `CatatToko-Setup-1.0.0.exe`
   - `CatatToko-Android` → berisi `CatatToko.apk`
4. Untuk rilis resmi: buat tag `v1.0.0` (Releases → Draft new release → tag `v1.0.0`).
   File .exe dan .apk otomatis ditempel di halaman Release.

## Langkah 3 — Install

**Windows:** jalankan `CatatToko-Setup-1.0.0.exe`. Karena belum ditandatangani sertifikat,
Windows SmartScreen akan memberi peringatan → klik *More info* → *Run anyway*.

**Android:** kirim `CatatToko.apk` ke HP, buka, izinkan *Install unknown apps*.

## Kode aktivasi (lisensi)

1. Pembeli memakai aplikasi gratis 30 hari. Setelah itu muncul layar aktivasi berisi **ID perangkat**
   (contoh `7KQ2-M8XA-PZ4N`) dan tombol untuk mengirim ID itu ke WA Anda.
2. Anda buat kodenya di komputer (perlu Node.js):
   ```
   node tools/keygen.js 7KQ2-M8XA-PZ4N
   ```
3. Kirim kode aktivasi ke pembeli. Satu kode hanya berlaku untuk satu perangkat.

Catatan keamanan: ini lisensi offline sederhana. Cukup untuk UMKM, tetapi orang yang paham
teknik bisa membongkarnya, dan data aplikasi yang dihapus (clear data) akan mengulang masa coba.
Untuk lisensi yang lebih ketat perlu server aktivasi online.

## APK bertanda tangan (opsional, untuk rilis / Play Store)

Tanpa pengaturan ini, APK yang dihasilkan adalah *debug APK*: bisa di-install dan dipakai normal,
tapi tidak bisa diunggah ke Play Store. Untuk APK rilis:

1. Buat keystore sekali saja (perlu Java):
   ```
   keytool -genkey -v -keystore catattoko.jks -alias catattoko -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Ubah ke base64: `base64 -w0 catattoko.jks` (Linux/Mac) atau
   `[Convert]::ToBase64String([IO.File]::ReadAllBytes("catattoko.jks"))` (PowerShell).
3. Di GitHub: **Settings → Secrets and variables → Actions**, tambahkan:
   `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`catattoko`), `KEY_PASSWORD`.
4. Simpan file `.jks` dan passwordnya baik-baik. Jika hilang, update aplikasi tidak bisa di-install di atas versi lama.

## Build manual di komputer sendiri (opsional)

Perlu Node.js 20.

- **Windows** (di PC Windows): `npm install` lalu `npm run build:win` → hasil di folder `dist/`.
  Coba tanpa build: `npm start`.
- **Android** (perlu Android Studio + JDK 17):
  ```
  npm install
  npx cap add android
  npm run android:icons
  npx cap sync android
  npx cap open android
  ```
  Lalu di Android Studio: *Build → Build APK(s)*.

## Mengubah aplikasi

Semua tampilan dan logika ada di `www/index.html`. Setelah mengubah, cukup upload ulang ke GitHub
dan build berjalan lagi otomatis. Naikkan `version` di `package.json` setiap rilis baru.

Data pembeli aman saat update: data disimpan di perangkat dan tidak ikut terhapus ketika aplikasi
di-update (selama APK ditandatangani dengan kunci yang sama). Tetap sarankan pembeli memakai
**Pengaturan → Buat cadangan** secara rutin.
