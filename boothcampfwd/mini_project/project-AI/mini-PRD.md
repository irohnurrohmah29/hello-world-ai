# Mini PRD - Molecule 01 + Champaca Product Detail Page

## Informasi

| Item | Keterangan |
| --- | --- |
| Versi | 1.0 |
| Status | Draft untuk exercise Front-End |
| Konteks | Halaman detail produk parfum Escentric Molecules |
| Teknologi | HTML, CSS, dan JavaScript murni |
| Scope | Satu halaman detail produk dengan data lokal dan interaksi simulasi |
| Sumber produk | [Molecule 01 + Champaca](https://www.escentric.com/products/molecule-01-champaca) |
| Tanggal pemeriksaan | 9 Oktober 2026 |

## 1. Product Overview

Halaman detail produk membantu calon pembeli memahami karakter aroma dan informasi pembelian Molecule 01 + Champaca, melihat foto produk, memilih jumlah, lalu menambahkan produk ke bag. Pengalaman ini berfokus pada satu produk dan satu ukuran; proses checkout sungguhan tidak termasuk.

### Data Produk

| Data | Nilai |
| --- | --- |
| Nama | Molecule 01 + Champaca |
| Brand | Escentric Molecules |
| Kategori | Fragrance |
| Harga yang ditampilkan | £135 |
| Ukuran | 100 ml (satu-satunya varian pada halaman yang diperiksa) |
| Accord | Woody, Floral, Aromatic |
| Bahan aroma utama | Iso E Super dan champaca absolute |
| Ketersediaan | Tersedia saat pemeriksaan; endpoint produk melaporkan stok 20 unit. Nilai ini hanya snapshot, bukan jaminan stok saat transaksi. |
| Galeri | 3 gambar produk pada data produk |

### Deskripsi Aroma

Molecule 01 + Champaca memadukan Iso E Super dengan champaca absolute dari bunga champaca merah. Iso E Super digambarkan berkarakter seperti cedarwood: hangat, woody, lembut, dan velvety. Champaca membawa sisi floral yang kaya dengan nuansa jasmine, orange blossom, teh, dan kelembutan creamy. Perpaduannya memiliki pembukaan cerah dengan kesan orange blossom, bagian tengah floral-woody yang penuh, lalu dry-down halus dan woody.

Narasi produk menyebut parfum ini sebagai komposisi yang terasa opulent sekaligus ringan, dengan jejak aroma yang luminous dan elegan. Halaman mengutip perfumer Geza Schoen tentang kontras antara kekayaan champaca dan transparansi Iso E Super; untuk exercise, kutipan dapat diringkas tanpa menyalin teks panjang.

### Konten Halaman

Konten utama mencakup header dan navigasi, promo/banner, galeri foto, nama dan harga, accord, deskripsi, pilihan ukuran, quantity, tombol Add to bag, wishlist, serta footer. Halaman juga menampilkan kontrol wilayah toko, cookie consent, newsletter offer, dan bagian Description, Notes, Ingredients, serta Delivery & Returns.

Pada saat pemeriksaan, halaman menampilkan konteks toko UK: pengiriman gratis untuk pesanan di atas £80, hadiah M+ Trio 8.5 ml untuk pesanan di atas £125, serta tawaran diskon newsletter 16% untuk pesanan pertama. Promo, mata uang, dan ongkir dapat berubah berdasarkan wilayah dan waktu.

**Catatan data:** Ekstraksi halaman menampilkan judul accordion Ingredients dan Delivery & Returns, tetapi tidak menampilkan isi rinci keduanya. Jangan membuat klaim daftar bahan lengkap, kebijakan retur, atau estimasi pengiriman sebelum konten tersebut diverifikasi dari sumber resmi.

## 2. Problem + Target User

### Problem

Calon pembeli perlu memahami profil aroma dan detail pembelian tanpa kehilangan konteks saat berpindah dari galeri ke informasi produk. Halaman juga harus menghindari pilihan variasi yang tidak ada: produk ini hanya memiliki ukuran 100 ml.

Masalah yang ingin diselesaikan:

- Karakter aroma dan komposisi utama perlu disajikan secara ringkas dan mudah dipindai.
- Harga, ukuran, stok, dan jumlah yang dipilih harus terlihat jelas.
- Pengguna harus mendapat feedback setelah menambah produk ke bag atau wishlist.
- Informasi regional seperti mata uang, promosi, dan pengiriman tidak boleh disajikan sebagai ketentuan universal.

### Target User

Calon pembeli parfum yang mengakses toko melalui desktop atau smartphone, ingin mengevaluasi karakter aroma, melihat kemasan, dan memutuskan apakah akan menambahkan produk ke bag.

Kebutuhan utama: memahami aroma, meninjau foto dan harga, memastikan ukuran, mengubah quantity, lalu menerima konfirmasi atas tindakannya.

## 3. Goals + Non-Goals

### Goals

- Menampilkan nama, harga, ukuran, accord, dan ringkasan aroma dengan jelas.
- Menyediakan galeri yang memungkinkan pengguna melihat seluruh foto produk.
- Menyediakan quantity yang tidak boleh kurang dari satu dan tidak boleh melebihi stok yang tersedia pada data aplikasi.
- Menampilkan feedback setelah Add to bag dan perubahan status wishlist.
- Menyajikan layout yang mudah digunakan pada desktop dan mobile.
- Menampilkan promo, mata uang, dan kebijakan wilayah sebagai data yang dapat diperbarui, bukan klaim tetap.

### Non-Goals

Versi ini tidak mencakup:

- Login dan registrasi.
- API produk atau sinkronisasi stok langsung.
- Bag atau wishlist persisten lintas sesi.
- Checkout, pembayaran, pajak, atau perhitungan ongkos kirim.
- Rekomendasi, rating, review, atau pengelolaan produk admin.
- Klaim konsentrasi, ketahanan aroma dalam jam, atau daftar ingredients lengkap yang tidak terverifikasi.

## 4. User Flow

1. Pengguna membuka halaman detail Molecule 01 + Champaca.
2. Halaman menampilkan foto utama, nama produk, harga £135, accord, ukuran 100 ml, dan ringkasan aroma.
3. Pengguna menavigasi galeri untuk melihat foto lain; foto utama mengikuti thumbnail yang dipilih.
4. Pengguna membaca bagian Description, Notes, Ingredients, atau Delivery & Returns yang memiliki konten terverifikasi.
5. Pengguna mengubah quantity menggunakan tombol minus dan plus.
6. Pengguna dapat menekan Add to wishlist; status tombol berubah dan feedback ditampilkan.
7. Pengguna menekan Add to bag; ringkasan konfirmasi menampilkan nama produk, ukuran 100 ml, quantity, dan subtotal.

### Kondisi Awal

- Foto utama menampilkan gambar pertama dari galeri.
- Harga tampil dalam mata uang market yang aktif; untuk konteks halaman yang diperiksa: £135.
- Ukuran 100 ml ditampilkan sebagai pilihan tunggal, tanpa selector variasi yang menyesatkan.
- Quantity bernilai 1.
- Wishlist belum aktif.
- Tombol Add to bag aktif bila produk tersedia.

### Aturan Interaksi

- Quantity minimum adalah 1; tombol minus tidak boleh menurunkan nilai di bawah batas itu.
- Quantity maksimum mengikuti stok lokal yang tersedia; stok yang berasal dari snapshot tidak boleh dianggap sebagai data live.
- Subtotal dihitung dari harga per item dikalikan quantity.
- Add to bag memberikan konfirmasi visual dan tidak menjalankan pembayaran.
- Wishlist menampilkan perubahan status dan tidak menyimpan data secara persisten pada versi ini.
- Jika produk tidak tersedia, tombol Add to bag dinonaktifkan dan status stok ditampilkan.
