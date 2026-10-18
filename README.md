# Buku Surat TU

Aplikasi persuratan sekolah (surat masuk, surat keluar, disposisi, tahun ajaran, ekspor Excel) satu file HTML dengan database Supabase.

## Isi
- `index.html`: aplikasi
- `supabase-schema.sql`: tabel dan kebijakan akses Supabase

## Pasang
1. Supabase: buka SQL Editor, tempel isi `supabase-schema.sql` (termasuk bagian Storage untuk gambar), lalu Run.
2. GitHub: buat repository baru, unggah `index.html` dan `README.md` (dan `supabase-schema.sql` bila mau).
3. GitHub Pages: Settings > Pages > Source: Deploy from a branch > Branch: `main`, folder `/ (root)` > Save.
4. Buka alamat `https://NAMA-AKUN.github.io/NAMA-REPO/`. Status sambungan tampil di bawah judul aplikasi.

## Ganti koneksi Supabase
Di `index.html`, cari `SB_URL` dan `SB_KEY`, lalu ganti dengan alamat proyek dan kunci publishable Anda.

## Kop surat dan tanda tangan
Di Portal admin, unggah kop surat, tanda tangan Kepala Sekolah, dan tanda tangan petugas TU. Gambar disimpan di Supabase Storage (bucket `surat-tu`) dan disalin di perangkat agar cetak tetap jalan offline.

## Portal admin
Kata sandi bawaan `admin123`. Cari `admin123` di `index.html` untuk menggantinya. Kata sandi ini tampil di kode halaman, jadi hanya pengaman ringan.

## Aplikasi Windows (offline)
Aplikasi desktop dibuat dengan Electron lewat GitHub Actions (`.github/workflows/build-windows.yml`).

**Cara membuat file .exe**
1. Di GitHub, buka tab **Actions** > **Build aplikasi Windows** > **Run workflow**.
2. Tunggu sekitar 3 sampai 5 menit sampai hijau, lalu buka run tersebut dan unduh artifact **Buku-Surat-TU-Windows** (isinya `Buku-Surat-TU-Setup-x.x.x.exe` untuk dipasang dan `Buku-Surat-TU-Portable-x.x.x.exe` tanpa pemasangan).
3. Alternatif: buat tag `v1.0.0` (atau `v1.0.1`, dst). File `.exe` otomatis muncul di halaman **Releases**.

**Penyimpanan data di komputer**
- Data disimpan di `Dokumen\Buku Surat TU\buku-surat-data.json` (versi portable: folder `Data Buku Surat TU` di samping file .exe).
- Cadangan harian otomatis di subfolder `cadangan` (30 hari terakhir).
- Menu **Berkas** > *Pilih folder penyimpanan data* untuk pindah ke drive D: atau flashdisk, serta *Simpan/Pulihkan cadangan*.
- Tanpa internet, aplikasi tetap bisa dipakai penuh (termasuk ekspor Excel dan cetak). Perubahan yang dibuat offline dikirim ke Supabase otomatis saat koneksi kembali.

**Ganti ikon**: timpa `desktop/build/icon.ico` dan `desktop/build/icon.png`.

Catatan: file .exe belum bertanda tangan digital, jadi Windows SmartScreen bisa menampilkan peringatan. Klik *More info* lalu *Run anyway*.
