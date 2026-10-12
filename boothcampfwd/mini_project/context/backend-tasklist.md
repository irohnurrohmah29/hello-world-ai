# Backend Task List — Product Catalog API

Acuan: [api-prd.md](api-prd.md) dan [architecture.md](architecture.md).

## 0. Keputusan dan Persiapan

- [x] Tetapkan Iqlifar pada `project-AI/index.html` dan `project-AI/js/main.js` sebagai satu-satunya referensi katalog untuk scope ini; abaikan data Molecule 01 + Champaca pada mini-PRD.
- [ ] Verifikasi harga, mata uang, foto, varian, dan stok sebelum dianggap sebagai data produk aktual.
- [ ] Tetapkan identifier endpoint detail: UUID atau slug; dokumentasi arsitektur saat ini mencatat keduanya sebagai opsi terbuka.
- [ ] Tetapkan versi Node.js LTS dan catat pada `engines`/`.nvmrc`.
- [ ] Buat project Node.js backend dengan Express.js, PostgreSQL, `pg`, migration SQL, validator schema, dan Swagger UI.
- [x] Sediakan `api-product/docker-compose.yml` untuk PostgreSQL dengan healthcheck dan named volume.
- [x] Sediakan `api-product/.env.example`; jangan commit file `.env` atau password lokal.
- [ ] Salin `api-product/.env.example` menjadi `api-product/.env`, lalu isi password lokal yang tidak digunakan di production.
- [ ] Jalankan PostgreSQL lokal dengan `docker compose up -d db` dari folder `api-product` dan pastikan healthcheck lulus.
- [ ] Konfigurasikan backend host memakai `DATABASE_URL` dengan host `localhost` dan port yang dipetakan Compose.

## 1. Fondasi Aplikasi

- [ ] Buat struktur direktori sesuai Layered Architecture MVC pada `architecture.md`.
- [ ] Implementasikan `src/app.js` untuk konfigurasi Express dan middleware.
- [ ] Implementasikan `src/server.js` untuk bootstrap server dan graceful shutdown.
- [ ] Tambahkan parsing JSON dengan batas maksimal 100 KB dan error handler untuk JSON malformed.
- [ ] Tambahkan middleware not-found dan error handler terpusat dengan format Problem Details RFC 9457.
- [ ] Tambahkan request ID serta logging method, route, status, dan durasi tanpa mencatat secret.
- [ ] Tambahkan health endpoint dan konfigurasi CORS allowlist untuk origin frontend yang diperlukan.

## 2. PostgreSQL dan Schema

- [ ] Konfigurasikan koneksi PostgreSQL memakai connection pool `pg` dan environment variable.
- [ ] Pastikan frontend tidak mengakses port/database PostgreSQL secara langsung.
- [ ] Buat migration awal untuk `products`, `product_images`, dan `product_variants` sesuai `architecture.md`.
- [ ] Terapkan primary key UUID, foreign key, unique constraint, check constraint, serta index yang dibutuhkan.
- [ ] Pastikan aturan foto utama: paling banyak satu foto primary per produk; service memastikan tepat satu primary jika tersedia foto aktual.
- [ ] Buat migration runner atau dokumentasikan perintah migration yang repeatable.
- [ ] Buat seed produk contoh hanya setelah sumber katalog final disepakati; tandai harga/stok konsep sebagai data simulasi.
- [ ] Pastikan produk tanpa foto aktual bisa memakai placeholder dengan `image_url: null`.

## 3. Model, Repository, dan Service

- [ ] Definisikan model/domain Product, ProductImage, dan ProductVariant.
- [ ] Implementasikan repository untuk list produk, detail produk, dan create produk.
- [ ] Gunakan parameterized SQL di seluruh query; jangan menyusun SQL dari input pengguna.
- [ ] Pastikan query GET tidak menggandakan produk saat menggabungkan foto dan varian.
- [ ] Implementasikan service untuk memetakan record ke DTO response.
- [ ] Turunkan `availability` dari stok varian aktif; jangan menyimpan nilai turunan yang mudah tidak sinkron.
- [ ] Implementasikan pembuatan slug/ID dan penanganan konflik unik.
- [ ] Implementasikan create Product, Images, dan Variants dalam satu transaksi dengan rollback saat ada kegagalan.

## 4. Validasi dan Keamanan Input

- [ ] Validasi body POST sebelum controller/service dijalankan.
- [ ] Tolak body kosong, JSON bukan object, property tambahan, serta tipe data yang tidak sesuai.
- [ ] Terapkan batas panjang/range untuk nama, deskripsi, harga, ukuran, stok, URL foto, SKU, notes, dan array sesuai PRD.
- [ ] Batasi currency ke IDR pada MVP dan validasi harga sebagai integer positif.
- [ ] Validasi URL foto sebagai HTTPS atau `null` untuk placeholder.
- [ ] Pastikan SKU/slug duplikat menghasilkan `409 Conflict` dengan error publik yang stabil.
- [ ] Terapkan constraint database sebagai pertahanan kedua terhadap input invalid.
- [ ] Pastikan error response tidak membocorkan SQL, credential, filesystem path, atau stack trace.
- [ ] Pastikan endpoint POST tidak dibuka untuk penggunaan publik sebelum autentikasi/otorisasi admin tersedia.

## 5. API dan Kontrak Response

- [ ] Implementasikan `GET /api/v1/products` dengan response envelope `success`, `message`, `data`, dan `meta`.
- [ ] Implementasikan `GET /api/v1/products/:id` dengan response envelope yang sama.
- [ ] Implementasikan `POST /api/v1/products` dengan validasi middleware, transaksi, status `201`, dan header `Location`.
- [ ] Gunakan status HTTP yang sesuai; jangan mengulang status code dalam success body.
- [ ] Format seluruh error dengan RFC 9457 `application/problem+json`, termasuk ekstensi kode dan detail validasi.
- [ ] Tangani JSON malformed (`400`), not found (`404`), duplikasi (`409`), body terlalu besar (`413`), media type salah (`415`), dan kegagalan internal (`500`).
- [ ] Batasi hasil list atau tambahkan pagination sebelum ukuran katalog menjadi besar.

## 6. Swagger dan OpenAPI

- [ ] Buat `docs/openapi.yaml` menggunakan OpenAPI 3.1.
- [ ] Dokumentasikan GET list, GET detail, POST, parameter, request schema, response schema, status, dan contoh.
- [ ] Dokumentasikan format success envelope dan error RFC 9457.
- [ ] Sajikan Swagger UI dari backend pada `GET /api-docs`.
- [ ] Sajikan spesifikasi pada `GET /api-docs/openapi.yaml`.
- [ ] Pastikan Swagger UI `Try it out` dapat mengirim request ke base URL API lokal.
- [ ] Batasi akses dokumentasi API sesuai kebijakan deployment.

## 7. Integrasi, Verifikasi, dan Handoff

- [ ] Sediakan `.env.example` berisi nama variable saja, tanpa credential.
- [ ] Dokumentasikan install, konfigurasi database, migration, seed, start server, dan alamat Swagger di README.
- [ ] Verifikasi GET list mengembalikan produk dan metadata yang sesuai.
- [ ] Verifikasi GET detail mengembalikan seluruh relasi foto dan varian.
- [ ] Verifikasi POST valid membuat seluruh record secara atomik.
- [ ] Verifikasi payload invalid ditolak dan tidak meninggalkan record parsial.
- [ ] Verifikasi error response sesuai schema dan content type yang didokumentasikan.
- [ ] Verifikasi Swagger UI dan OpenAPI spec merepresentasikan implementasi aktual.
- [ ] Beri tahu frontend mengenai base URL, identifier yang dipilih, bentuk response, dan perilaku error.

## Definition of Done

- [ ] API berjalan dengan PostgreSQL dan menyimpan data secara persisten.
- [ ] Tiga endpoint katalog tersedia dengan validasi, status HTTP, dan format response yang konsisten.
- [ ] Create produk lintas tabel bersifat atomik.
- [ ] Swagger UI dapat digunakan untuk membaca dan mencoba API.
- [ ] Instruksi menjalankan API dapat diikuti dari README tanpa credential yang dibagikan di repository.
