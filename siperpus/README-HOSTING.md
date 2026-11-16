# SIPERPUS UNUGIRI

Aplikasi web statis berbasis HTML, CSS, dan JavaScript.

## Login demo
- Username: `petugas01`
- Password: `admin123`

## Denda keterlambatan
- Masa pinjam: 7 hari.
- Tarif awal: Rp1.000 per hari keterlambatan.
- Ubah nilai `FINE_PER_DAY` di bagian atas `app.js` jika tarif kampus berbeda.

## Menjalankan lokal
Buka `index.html` melalui browser. Data disimpan di `localStorage` browser yang digunakan.

## Hosting dengan GitHub Pages
1. Buat repository baru di akun GitHub.
2. Upload `index.html`, `style.css`, dan `app.js` ke folder utama (root) repository.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
6. Tunggu proses selesai. Alamat situs akan muncul pada halaman Settings → Pages.

Catatan: login ini hanya autentikasi demo di sisi browser, bukan sistem keamanan untuk data rahasia. Data localStorage juga tersimpan per perangkat/browser dan tidak tersinkron antar pengguna. Untuk penggunaan perpustakaan sungguhan, diperlukan backend, database, dan autentikasi server.
