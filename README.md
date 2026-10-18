# Buku Surat TU

Aplikasi persuratan sekolah (surat masuk, surat keluar, disposisi, tahun ajaran, ekspor Excel) satu file HTML dengan database Supabase.

## Isi
- `index.html`: aplikasi
- `supabase-schema.sql`: tabel dan kebijakan akses Supabase

## Pasang
1. Supabase: buka SQL Editor, tempel isi `supabase-schema.sql`, lalu Run.
2. GitHub: buat repository baru, unggah `index.html` dan `README.md` (dan `supabase-schema.sql` bila mau).
3. GitHub Pages: Settings > Pages > Source: Deploy from a branch > Branch: `main`, folder `/ (root)` > Save.
4. Buka alamat `https://NAMA-AKUN.github.io/NAMA-REPO/`. Status sambungan tampil di bawah judul aplikasi.

## Ganti koneksi Supabase
Di `index.html`, cari `SB_URL` dan `SB_KEY`, lalu ganti dengan alamat proyek dan kunci publishable Anda.

## Portal admin
Kata sandi bawaan `admin123`. Cari `admin123` di `index.html` untuk menggantinya. Kata sandi ini tampil di kode halaman, jadi hanya pengaman ringan.
