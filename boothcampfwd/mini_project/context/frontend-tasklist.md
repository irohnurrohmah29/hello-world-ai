# Frontend Task List — Product Detail

Acuan: [api-prd.md](api-prd.md), [architecture.md](architecture.md), dan halaman saat ini di `project-AI/index.html`.

## 0. Persiapan dan Kontrak API

- [x] Tetapkan Iqlifar pada `project-AI/index.html` dan `project-AI/js/main.js` sebagai katalog frontend; jangan mengambil data Molecule 01 + Champaca dari mini-PRD.
- [ ] Tetapkan base URL API per environment dan identifier produk yang dipakai pada route detail.
- [ ] Untuk development lokal, arahkan request browser ke backend, misalnya `http://localhost:3000/api/v1`; jangan konek ke PostgreSQL dari frontend.
- [ ] Pastikan kontrak GET detail: success envelope (`success`, `message`, `data`, `meta`) dan struktur Product/Image/Variant.
- [ ] Pastikan makna `stockQuantity`: stok per varian, bukan jumlah yang dipilih di kontrol quantity.
- [ ] Tentukan fallback visual saat `image_url` bernilai `null` karena halaman saat ini memakai mockup CSS.

## 1. Persiapan Integrasi

- [ ] Pisahkan konfigurasi base URL API dari kode UI agar dapat diubah per environment.
- [ ] Buat modul/API client untuk request JSON dan parsing success/error response.
- [ ] Tangani error RFC 9457 berdasarkan HTTP status dan kode masalah, tanpa mengasumsikan setiap error memiliki bentuk sukses.
- [ ] Tampilkan pesan yang aman dan mudah dipahami ketika API tidak tersedia.
- [ ] Batasi rendering deskripsi dan data API sebagai teks; jangan memasukkan response ke HTML mentah.

## 2. Memuat Data Produk

- [ ] Panggil `GET /api/v1/products/:id` saat halaman detail dibuka.
- [ ] Tampilkan state loading saat request berjalan.
- [ ] Isi nama, deskripsi, harga, mata uang, foto, varian, ukuran, notes, dan availability dari response API.
- [ ] Hapus hardcode data produk dari sumber UI setelah integrasi setiap field terverifikasi.
- [ ] Gunakan foto utama dari `images`; tampilkan thumbnail sesuai urutan galeri bila tersedia lebih dari satu foto.
- [ ] Jika foto aktual tidak tersedia (`url: null`), gunakan mockup CSS dengan keterangan konsep dan alt/accessibility label yang sesuai.
- [ ] Jika response gagal atau produk tidak ditemukan, tampilkan state error/not-found dan aksi retry yang sesuai.
- [ ] Jika produk tidak tersedia, tampilkan status stok habis dan nonaktifkan aksi pembelian/konfirmasi.

## 3. Varian, Ukuran, dan Quantity

- [ ] Bangun pilihan aroma/warna dan ukuran berdasarkan `variants`, bukan array hardcode.
- [ ] Hubungkan setiap kombinasi pilihan ke varian/SKU yang benar.
- [ ] Tampilkan harga varian jika `price` override tersedia; jika null, gunakan harga produk.
- [ ] Sinkronkan gambar/label/notes dengan varian terpilih bila response menyediakan data terkait.
- [ ] Set quantity awal ke 1 saat varian valid dipilih.
- [ ] Batasi quantity minimum 1 dan maksimum `stockQuantity` dari varian terpilih.
- [ ] Perbarui tombol minus/plus, ringkasan jumlah, subtotal, dan status tombol sesuai pilihan/stok.
- [ ] Jangan mengirim quantity pilihan ke endpoint katalog; endpoint GET hanya memasok stok dan detail produk.

## 4. Feedback Interaksi dan Aksesibilitas

- [ ] Tampilkan ringkasan pilihan varian, ukuran, jumlah, dan total harga.
- [ ] Berikan konfirmasi saat pengguna mengonfirmasi pilihan/add action; jangan memberi kesan pembayaran berlangsung jika checkout belum tersedia.
- [ ] Pastikan tombol dan pilihan varian dapat digunakan dengan keyboard.
- [ ] Gunakan label accessible, `aria-pressed` untuk pilihan, dan live region untuk perubahan ringkasan/status.
- [ ] Pastikan status loading/error/stok habis tidak hanya dibedakan melalui warna.
- [ ] Pertahankan layout responsif untuk mobile dan desktop.

## 5. Konfigurasi dan CORS

- [ ] Minta backend mengizinkan origin frontend yang benar melalui CORS allowlist bila berbeda origin.
- [ ] Pastikan frontend hanya memakai URL HTTP API; jangan memasukkan `DATABASE_URL`, user, atau password database ke kode/environment frontend.
- [ ] Tangani timeout/network error dan cegah request ganda yang tidak diperlukan.
- [ ] Jangan menaruh credential rahasia atau akses admin dalam bundle frontend.
- [ ] Gunakan HTTPS untuk API dan URL foto pada deployment.

## 6. Verifikasi dan Handoff

- [ ] Cocokkan field UI dengan contoh response OpenAPI/Swagger.
- [ ] Periksa halaman pada data produk tersedia, stok nol, foto null, response kosong/invalid, dan kegagalan jaringan.
- [ ] Periksa pemilihan setiap varian/ukuran mengubah stok maksimum serta subtotal dengan benar.
- [ ] Pastikan tidak ada klaim harga, stok, foto, notes, atau kebijakan yang belum diverifikasi.
- [ ] Catat kebutuhan backend yang belum terpenuhi (misalnya identifier, CORS, field gambar, atau harga per varian).

## Definition of Done

- [ ] Halaman mengambil informasi produk dari API, bukan dari data produk hardcode.
- [ ] Foto, harga, varian/ukuran, stok, dan deskripsi menampilkan state fallback yang benar.
- [ ] Quantity tidak melewati stok varian dan ringkasan harga konsisten.
- [ ] Loading, not-found, out-of-stock, dan network error memiliki tampilan yang jelas.
- [ ] Halaman dapat digunakan pada mobile/desktop dan kontrol penting dapat diakses dengan keyboard.
