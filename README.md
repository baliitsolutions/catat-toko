# Catat Toko — APK Android & Aplikasi Windows

Aplikasi pencatatan toko UMKM ala BukuWarung: kasir + nota WA, utang-piutang + tagih WA,
buku kas, stok, laporan laba rugi, cadangan data, dan lisensi masa coba 30 hari.
Data tersimpan di perangkat (offline, tanpa server).

## Isi folder

| Folder / file | Fungsi |
|---|---|
| `www/` | Aplikasinya (HTML/JS). Dipakai oleh versi Windows dan Android. |
| `www/config.js` | **Pengaturan: nama aplikasi, masa coba, kunci publik lisensi, kontak WA.** |
| `main.js` | Jendela aplikasi Windows (Electron). |
| `capacitor.config.json` | Pengaturan aplikasi Android (Capacitor). |
| `assets/` | Ikon dan splash screen. Ganti `icon.png` (1024×1024) jika ingin logo lain. |
| `lisensi/` | Aplikasi Windows **Pembuat Lisensi** (khusus penjual, jangan dibagikan ke pembeli). |
| `.github/workflows/build.yml` | Build otomatis APK + installer Windows di GitHub. |

## Langkah 1 — Atur `www/config.js`

1. Isi `LICENSE_PUBLIC_KEY` dengan kunci publik dari aplikasi **Pembuat Lisensi** (lihat bagian Kode aktivasi).
2. Isi `KONTAK_NAMA` dan `KONTAK_WA` (nomor yang dihubungi pembeli untuk aktivasi).
3. Jika tidak perlu lisensi, ubah `LICENSE_ENABLED` menjadi `false`.

## Langkah 2 — Build otomatis lewat GitHub (cara paling mudah)

Tidak perlu install Android Studio atau Visual Studio.

1. Buat repository **private** baru di GitHub, lalu upload seluruh isi folder ini (termasuk folder `.github`).
2. Buka tab **Actions** → workflow **Build APK & Windows** berjalan otomatis (±10–15 menit).
3. Setelah selesai (centang hijau), buka run tersebut → bagian **Artifacts**:
   - `CatatToko-Windows` → berisi `CatatToko-Setup-1.0.0.exe`
   - `CatatToko-Android` → berisi `CatatToko.apk`
   - `PembuatLisensi-Windows` → berisi `PembuatLisensi-Setup-1.0.0.exe` (untuk Anda sendiri)
4. Untuk rilis resmi: buat tag `v1.0.0` (Releases → Draft new release → tag `v1.0.0`).
   File .exe dan .apk otomatis ditempel di halaman Release.

## Langkah 3 — Install

**Windows:** jalankan `CatatToko-Setup-1.0.0.exe`. Karena belum ditandatangani sertifikat,
Windows SmartScreen akan memberi peringatan → klik *More info* → *Run anyway*.

**Android:** kirim `CatatToko.apk` ke HP, buka, izinkan *Install unknown apps*.

## Kode aktivasi (lisensi)

Lisensi memakai tanda tangan digital (Ed25519). Aplikasi Catat Toko hanya menyimpan **kunci publik**,
jadi aplikasi yang dijual hanya bisa *memeriksa* kode, tidak bisa *membuat* kode. Kunci rahasia hanya
ada di komputer Anda, di aplikasi **Pembuat Lisensi**.

**Persiapan (sekali saja):**
1. Install `PembuatLisensi-Setup-1.0.0.exe` di komputer Anda.
2. Buka aplikasinya → **Buat kunci baru**.
3. Menu **Kunci** → **Salin kunci publik** → tempel ke `LICENSE_PUBLIC_KEY` di `www/config.js` → build ulang Catat Toko.
4. Menu **Kunci** → **Cadangkan kunci & daftar** → simpan file cadangan di flashdisk / Google Drive pribadi.
   Jika kunci hilang, Anda tidak bisa lagi membuat kode untuk aplikasi yang sudah terjual.

**Setiap ada pembeli:**
1. Pembeli memakai aplikasi gratis 30 hari. Setelah itu muncul layar aktivasi berisi **ID perangkat**
   (contoh `7KQ2-M8XA-PZ4N`) dan tombol untuk mengirim ID itu ke WA Anda.
2. Di Pembuat Lisensi: menu **Buat kode** → isi ID perangkat, nama, no. WA → **Buat kode**.
3. Klik **Kirim via WhatsApp** (pesan berisi kode dan cara pakainya), atau salin kodenya.
4. Pembeli menempel kode di kolom **Kode aktivasi** → **Aktifkan**. Satu kode hanya berlaku untuk satu perangkat.

Semua kode yang dibuat tercatat di menu **Daftar lisensi** dan bisa diekspor ke CSV (Excel).

Catatan: data aplikasi yang dihapus (clear data) di perangkat pembeli akan mengulang masa coba dan
membuat ID perangkat baru. Untuk kontrol penuh (misalnya lisensi bulanan) perlu server aktivasi online.

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

## Build langsung di komputer sendiri (tanpa GitHub)

GitHub hanya cara praktis. Semua bisa juga dibuat langsung di komputer Windows Anda.

**Persiapan sekali saja:** install [Node.js LTS](https://nodejs.org) dan [Git](https://git-scm.com), lalu:
```
git clone https://github.com/baliitsolutions/catat-toko.git
cd catat-toko
npm install
```

**Installer Windows Catat Toko:**
```
npm run build:win
```
Hasilnya di folder `dist\CatatToko-Setup-1.0.0.exe`. Coba jalankan tanpa build: `npm start`.

**Installer Pembuat Lisensi:**
```
cd lisensi
npm install
npm run build:win
```
Hasilnya di `lisensi\dist\PembuatLisensi-Setup-1.0.0.exe`.

**APK Android** (perlu [Android Studio](https://developer.android.com/studio), yang sudah membawa JDK):
```
npx cap add android
npm run android:icons
npx cap sync android
npx cap open android
```
Android Studio terbuka → menu *Build → Build App Bundle(s) / APK(s) → Build APK(s)*.
Hasilnya di `android\app\build\outputs\apk\debug\app-debug.apk`.
Setelah mengubah file di `www/`, cukup jalankan `npx cap sync android` lalu build lagi.

## Mengubah aplikasi

Semua tampilan dan logika ada di `www/index.html`. Setelah mengubah, cukup upload ulang ke GitHub
dan build berjalan lagi otomatis. Naikkan `version` di `package.json` setiap rilis baru.

Data pembeli aman saat update: data disimpan di perangkat dan tidak ikut terhapus ketika aplikasi
di-update (selama APK ditandatangani dengan kunci yang sama). Tetap sarankan pembeli memakai
**Pengaturan → Buat cadangan** secara rutin.
