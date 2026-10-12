# PRD — Product Catalog REST API

## Informasi Dokumen

| Item | Keterangan |
| --- | --- |
| Versi | 1.0 |
| Status | Draft implementasi untuk exercise bootcamp |
| Produk | REST API katalog untuk halaman detail produk Iqlifar |
| Teknologi | Node.js, Express.js, JavaScript |
| Penyimpanan | PostgreSQL; schema dan Layered Architecture dijelaskan di `architecture.md` |
| Referensi | Sumber produk: `project-AI/index.html` dan `project-AI/js/main.js`; pedoman: `api-product/Practical Guidance - Modern Back-End Development with AI.docx`. `mini-PRD.md` dicatat hanya untuk konteks karena brief produknya berbeda. |

## 1. Ringkasan Produk

API ini menyediakan data katalog yang diperlukan halaman detail produk, sehingga nama, harga, gambar, varian, ukuran, stok, dan deskripsi dapat dimuat dari respons server. API mendukung daftar produk, detail satu produk, dan penambahan produk baru. Request body untuk penambahan produk divalidasi sebelum data diproses.

Exercise guidance mensyaratkan nama, harga, foto, variasi, quantity, dan deskripsi. Implementasi halaman yang tersedia saat ini adalah konsep Iqlifar dengan varian aroma Iqlima dan Fariz, ukuran 50 ml/100 ml, harga contoh Rp99.000, serta stok contoh maksimal 10 per kombinasi varian dan ukuran. API menggunakan data tersebut sebagai baseline.

## 2. Referensi Produk dan Keputusan Scope

Referensi produk yang dipilih untuk API dan integrasi frontend adalah Iqlifar pada `project-AI/index.html` dan `project-AI/js/main.js`: varian aroma Iqlima/Fariz, ukuran 50 ml/100 ml, harga contoh Rp99.000, stok simulasi maksimal 10 per kombinasi, dan mockup CSS tanpa foto produk aktual. Keputusan ini menutup ambiguitas scope katalog.

`project-AI/mini-PRD.md` masih berisi brief Molecule 01 + Champaca yang berbeda dan tidak menjadi sumber data produk untuk pekerjaan ini. Prinsip kualitasnya tetap digunakan: harga/stok contoh harus diberi konteks dan klaim yang belum diverifikasi tidak boleh direka. Nilai komersial Iqlifar tetap perlu diverifikasi sebelum dipakai sebagai data produksi.

## 3. Masalah dan Pengguna

### Masalah

Halaman saat ini menyimpan data produk langsung di JavaScript. Ini mengikat konten ke frontend, membuat pembaruan data harus mengubah kode halaman, dan belum menyediakan antarmuka standar untuk membaca maupun menambahkan produk.

### Pengguna

- Pengunjung toko yang melihat informasi produk di halaman detail.
- Frontend yang memerlukan data produk berformat JSON.
- Developer/operator exercise yang menambahkan entri katalog melalui endpoint API.

## 4. Tujuan dan Bukan Tujuan

### Tujuan

- Menyediakan daftar produk dan detail berdasarkan ID.
- Mengizinkan penambahan produk melalui `POST` dengan validasi seluruh field dan batas input.
- Mengirim data yang konsisten dan mudah dipetakan ke UI halaman detail.
- Memisahkan atribut katalog, varian ukuran, harga, dan stok dengan jelas.
- Menggunakan status HTTP dan format error yang dapat ditangani frontend.

### Bukan Tujuan

- Autentikasi/otorisasi, panel admin, edit/hapus produk.
- Keranjang persisten, checkout, pembayaran, reservasi stok, atau sinkronisasi inventori real-time.
- Promosi, harga per region, kalkulasi pajak/ongkir, wishlist, review, atau rekomendasi.
- Menyediakan foto produk aktual untuk mockup yang saat ini hanya berupa CSS.

## 5. Ruang Lingkup API

Base path: `/api/v1` (major API version pada URL agar perubahan kontrak yang tidak kompatibel dapat diperkenalkan secara eksplisit).

| Method dan path | Tujuan | Sukses |
| --- | --- | --- |
| `GET /api/v1/products` | Mengambil seluruh produk aktif | `200 OK` |
| `GET /api/v1/products/:id` | Mengambil detail satu produk | `200 OK` |
| `POST /api/v1/products` | Memvalidasi lalu menambahkan produk | `201 Created` |

Semua respons menggunakan `Content-Type: application/json`. Versi exercise mengembalikan seluruh katalog tanpa pagination karena dataset lokal kecil. Jika katalog membesar, pagination menjadi kebutuhan lanjutan.

### 5.1 Struktur Produk

```json
{
  "id": "iqlifar",
  "name": "Iqlifar Store Parfum",
  "brand": "Iqlifar Store Parfum",
  "category": "fragrance",
  "description": "Koleksi parfum dengan dua karakter aroma.",
  "price": {
    "amount": 99000,
    "currency": "IDR"
  },
  "images": [
    {
      "url": null,
      "alt": "Mockup konsep botol parfum Iqlima",
      "isPrimary": true
    }
  ],
  "variants": [
    {
      "id": "iqlima-50",
      "name": "Iqlima",
      "attributes": { "sizeMl": 50 },
      "description": "Wewangian feminin dengan bukaan segar dan dasar hangat.",
      "notes": {
        "top": ["Bergamot", "Pear", "Saffron", "Mandarin orange"],
        "heart": ["Damask rose", "Jasmine sambac", "Iris", "Peony"],
        "base": ["Vanilla Madagaskar", "White musk", "Amber", "Sandalwood"]
      },
      "stock": 10
    }
  ],
  "availability": "in_stock",
  "createdAt": "2026-10-09T00:00:00.000Z",
  "updatedAt": "2026-10-09T00:00:00.000Z"
}
```

`amount` adalah integer dalam satuan rupiah. Harga berlaku pada produk sebagaimana UI saat ini; jika tiap ukuran memiliki harga berbeda, harga dipindahkan ke objek varian pada versi skema berikutnya. `stock` adalah bilangan unit yang tersedia untuk kombinasi aroma dan ukuran, bukan reservasi atau jaminan transaksi. `url: null` menandakan aset foto aktual belum tersedia; frontend dapat mempertahankan mockup konsep dan tidak boleh mencoba memuat URL kosong.

`availability` bernilai `in_stock` jika setidaknya satu varian memiliki stok lebih dari nol, dan `out_of_stock` jika seluruh varian stoknya nol. Quantity yang dipilih pengguna adalah state permintaan halaman dan tidak disimpan dalam katalog produk.

### 5.2 Format Respons Sukses

Seluruh respons sukses memakai envelope aplikasi yang seragam. Ini adalah kontrak proyek, bukan klaim bahwa ada satu envelope sukses universal untuk semua REST API. Status HTTP tetap menjadi sumber status utama; body tidak mengulang `responseCode`/`statusCode`.

```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": [],
  "meta": { "count": 0 }
}
```

`message` adalah ringkasan untuk developer/logging dan tidak menggantikan data yang terstruktur. `data` selalu ada: berupa array untuk collection dan objek untuk resource tunggal. `meta` opsional untuk metadata seperti count/pagination; jangan masukkan field produk ke dalamnya.

### 5.3 Respons Daftar

```json
{
  "success": true,
  "message": "Products retrieved successfully.",
  "data": [
    { "id": "iqlifar", "name": "Iqlifar Store Parfum" }
  ],
  "meta": { "count": 1 }
}
```

Setiap elemen `data` menggunakan schema produk penuh pada scope exercise agar dapat dipakai langsung oleh halaman detail. `meta.count` menyatakan jumlah elemen yang dikembalikan.

### 5.4 Respons Detail dan Create

`GET /api/v1/products/:id` mengembalikan satu objek produk pada properti `data`. `POST /api/v1/products` menerima objek produk tanpa `id`, `createdAt`, `updatedAt`, atau `availability`; server menghasilkan ID dan timestamp serta menghitung `availability`.

Contoh respons create:

```json
{
  "success": true,
  "message": "Product created successfully.",
  "data": {
    "id": "produk-baru",
    "name": "Produk Baru",
    "availability": "in_stock"
  },
  "meta": {}
}
```

Field respons contoh di atas disingkat; objek aktual mengikuti schema produk penuh. Respons `201` menyertakan header `Location: /api/v1/products/:id`.

### 5.5 Schema Konseptual JSON
```json
{
  "success": true,
  "message": "Human-readable summary.",
  "data": {},
  "meta": {}
}
```

## 6. Validasi `POST /api/v1/products`

Validasi dijalankan melalui middleware sebelum handler membuat atau menyimpan data. Gunakan allowlist field: field yang tidak tercantum ditolak agar nilai server seperti ID, availability, dan timestamp tidak dapat dipalsukan. Request body harus objek JSON; tolak body kosong, `null`, array, JSON rusak, dan tipe yang tidak sesuai.

| Field | Aturan |
| --- | --- |
| `name` | Wajib; string setelah trim 1–120 karakter |
| `brand` | Wajib; string setelah trim 1–80 karakter |
| `category` | Wajib; string lowercase 1–40 karakter, pola huruf/angka/hyphen |
| `description` | Wajib; string setelah trim 1–2.000 karakter |
| `price` | Wajib; objek dengan hanya `amount` dan `currency` |
| `price.amount` | Wajib; integer aman (`Number.isSafeInteger`), lebih besar dari 0 dan paling banyak 100.000.000.000 |
| `price.currency` | Wajib; kode ISO 4217 tiga huruf uppercase. Scope exercise menerima `IDR`; mata uang lain ditolak sampai regional pricing disepakati |
| `images` | Wajib; array 1–8 objek gambar |
| `images[].url` | Wajib; `null` atau URL HTTPS valid, maksimum 2.048 karakter; URL relatif ditolak |
| `images[].alt` | Wajib; string setelah trim 1–200 karakter |
| `images[].isPrimary` | Wajib; boolean; tepat satu gambar bernilai `true` |
| `variants` | Wajib; array 1–20 objek; `id` unik dalam produk |
| `variants[].id` | Wajib; slug 1–60 karakter, lowercase huruf/angka/hyphen |
| `variants[].name` | Wajib; string setelah trim 1–80 karakter |
| `variants[].attributes` | Wajib; objek non-kosong dengan `sizeMl` integer 1–10.000 pada MVP |
| `variants[].description` | Wajib; string setelah trim 1–1.000 karakter |
| `variants[].notes` | Wajib; objek berisi `top`, `heart`, `base`; tiap field array 1–12 string, tiap string 1–60 karakter setelah trim |
| `variants[].stock` | Wajib; integer 0–1.000.000 |

Tolak properti tambahan di root maupun objek nested, string kosong setelah trim, URL berbahaya/non-HTTPS, nilai numerik pecahan, nilai negatif, dan duplikasi ID varian. Deskripsi/notes diperlakukan sebagai teks biasa; output frontend wajib menggunakan `textContent` atau mekanisme escaping, bukan HTML mentah.

Body JSON dibatasi maksimal 100 KB. Parser hanya menerima `application/json`; media type lain menghasilkan `415 Unsupported Media Type`, body melebihi batas `413 Payload Too Large`. Validasi tidak mengklaim menggantikan autentikasi: endpoint POST pada exercise lokal tidak memiliki autentikasi dan tidak boleh dibuka sebagai endpoint publik produksi.

## 7. Format Error — RFC 9457 Problem Details

Semua error HTTP menggunakan format Problem Details RFC 9457 dengan media type `application/problem+json`. `status` pada body harus sama dengan status HTTP. Ekstensi `code` memberi identifier stabil untuk logic client dan `errors` memberi rincian validasi. Bentuk extension `errors` merupakan konvensi API ini.

```json
{
  "type": "https://api.example.com/problems/validation-error",
  "title": "Request validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/products",
  "code": "VALIDATION_ERROR",
  "errors": [
    { "field": "price.amount", "code": "must_be_positive_integer", "message": "Must be a positive integer." }
  ]
}
```

| Status | Kode | Kondisi |
| --- | --- | --- |
| `400` | `BAD_REQUEST` / `VALIDATION_ERROR` | JSON malformed, body bukan objek, atau field gagal validasi |
| `404` | `PRODUCT_NOT_FOUND` | ID produk tidak ditemukan |
| `409` | `PRODUCT_ALREADY_EXISTS` | ID hasil slug/name sudah digunakan (jika ID ditentukan dari slug name) |
| `413` | `PAYLOAD_TOO_LARGE` | Body melewati 100 KB |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Content-Type bukan JSON |
| `500` | `INTERNAL_ERROR` | Kegagalan tak terduga; detail internal tidak dikirim ke client |

Error tidak mengembalikan stack trace, path lokal, atau detail internal server. Untuk `POST`, ID dibuat dari slug `name`; jika slug sudah ada, kembalikan `409` dan minta nama unik untuk exercise ini.

## 8. User Stories dan Acceptance Criteria

### US-01 — Melihat katalog

Sebagai frontend, saya ingin mengambil semua produk agar dapat menampilkan item katalog yang tersedia.

- **AC1:** `GET /api/v1/products` mengembalikan `200` dan JSON dengan `data` berupa array serta `meta.count` sesuai jumlah produk.
- **AC2:** Setiap item memuat ID, nama, harga/mata uang, images, variants (termasuk stok dan size), description, dan availability.
- **AC3:** Array kosong tetap menghasilkan `200`, `data: []`, dan `meta.count: 0`.

### US-02 — Melihat detail produk

Sebagai pengunjung, saya ingin halaman detail memuat produk berdasarkan ID agar informasi dan pilihan yang tampil konsisten dengan katalog.

- **AC1:** ID valid yang tersedia menghasilkan `200` dengan objek `data` lengkap.
- **AC2:** ID tidak ditemukan menghasilkan `404 PRODUCT_NOT_FOUND` dengan format error standar.
- **AC3:** Data contoh Iqlifar memberikan varian Iqlima/Fariz dan ukuran 50/100 ml, dengan stok 10 untuk masing-masing kombinasi sesuai data frontend saat ini.

### US-03 — Menambahkan produk katalog

Sebagai operator exercise, saya ingin menambahkan produk agar dapat menguji alur create melalui Postman.

- **AC1:** Body valid menghasilkan `201`, objek `data` mengikuti schema, ID dan timestamp dihasilkan server, availability dihitung server, dan `Location` menunjuk resource baru.
- **AC2:** Body yang kehilangan field wajib atau melanggar tipe/range menghasilkan `400 VALIDATION_ERROR` dengan field penyebab.
- **AC3:** Properti tambahan, `id`, `availability`, atau timestamp yang dikirim client ditolak.
- **AC4:** URL gambar harus HTTPS atau null, dan tepat satu image ditandai primary.
- **AC5:** Duplikasi ID hasil slug menghasilkan `409 PRODUCT_ALREADY_EXISTS`; data lama tidak berubah.
- **AC6:** Body kosong atau JSON malformed tidak menyebabkan server crash dan tidak membuat produk.

### US-04 — Menghubungkan UI ke API

Sebagai pengunjung, saya ingin melihat data produk dari API pada halaman detail.

- **AC1:** Nama, harga, deskripsi, ukuran, notes, gambar (jika URL tersedia), dan stok dibaca dari respons API, bukan objek statis frontend.
- **AC2:** Jika gambar URL null, halaman tetap menampilkan mockup konsep dengan keterangan bahwa itu bukan foto aktual.
- **AC3:** Quantity minimum 1 dan maksimum tidak lebih dari stok varian terpilih.
- **AC4:** Loading, produk tidak ditemukan, dan kegagalan jaringan ditampilkan sebagai state yang dapat dipahami; interaksi konfirmasi dinonaktifkan sebelum data siap.

## 9. Alur Pengguna dan Integrasi

1. Frontend meminta `GET /api/v1/products/iqlifar` saat halaman detail dibuka.
2. UI menampilkan loading, kemudian memetakan response `data` ke komponen produk, pilihan aroma, ukuran, notes, harga, dan stok.
3. Pengguna memilih aroma dan ukuran; stok kombinasi terpilih mengatur batas tombol quantity.
4. Frontend memperlihatkan error/retry jika API gagal dan tidak mengasumsikan stok tersedia.
5. Operator mengirim JSON produk ke `POST /api/v1/products` melalui Postman; middleware memvalidasi sebelum handler.
6. Respons `201` berisi produk yang dapat dibaca melalui endpoint detail.

### Contoh request POST

```json
{
  "name": "Iqlifar Store Parfum",
  "brand": "Iqlifar Store Parfum",
  "category": "fragrance",
  "description": "Koleksi parfum dengan dua karakter aroma.",
  "price": { "amount": 99000, "currency": "IDR" },
  "images": [
    { "url": null, "alt": "Mockup konsep botol Iqlima", "isPrimary": true }
  ],
  "variants": [
    {
      "id": "iqlima-50",
      "name": "Iqlima",
      "attributes": { "sizeMl": 50 },
      "description": "Bukaan segar dengan floral romantis dan dasar hangat.",
      "notes": {
        "top": ["Bergamot", "Pear"],
        "heart": ["Damask rose", "Jasmine sambac"],
        "base": ["Vanilla Madagaskar", "White musk"]
      },
      "stock": 10
    }
  ]
}
```

Payload contoh memperlihatkan satu varian; untuk representasi katalog Iqlifar, sertakan seluruh kombinasi varian dan ukuran yang tersedia.

## 10. Kebutuhan Kualitas dan Keamanan

- Middleware JSON parser harus dipasang dengan limit body 100 KB.
- Middleware validasi berjalan sebelum handler POST dan hanya meneruskan request valid.
- Error handler terpusat menjaga format respons dan tidak membocorkan stack trace.
- Gunakan nilai parameter route sebagai data, bukan menyusun query atau path filesystem.
- Batasi panjang string/array/angka sesuai tabel validasi untuk mengurangi input abusif.
- Terapkan escaping output di frontend untuk mencegah konten produk diperlakukan sebagai HTML.
- PostgreSQL menjadi penyimpanan persisten; harga dan stok seed tetap data simulasi sampai diverifikasi.
- CORS hanya dibuka untuk origin frontend yang diperlukan saat frontend dan API berjalan pada origin berbeda; jangan gunakan wildcard untuk deployment produksi.

## 11. Susunan Direktori — Layered Architecture MVC

Pisahkan tanggung jawab agar route HTTP, validasi, aturan bisnis, dan akses data tidak tercampur. MVC ditempatkan pada lapisan presentasi: **Route → Controller → Service → Repository**. `Model` mendefinisikan bentuk data/domain; repository mengelola sumber data PostgreSQL melalui driver `pg`, selaras dengan [architecture.md](architecture.md).

```text
api-product/
├── src/
│   ├── app.js                     # konfigurasi Express, middleware, mount routes
│   ├── server.js                  # bootstrap/listen dan graceful shutdown
│   ├── config/
│   │   └── env.js                 # pembacaan dan validasi konfigurasi environment
│   ├── routes/
│   │   └── product.routes.js      # deklarasi endpoint /api/v1/products
│   ├── controllers/
│   │   └── product.controller.js  # HTTP request/response; delegasi ke service
│   ├── services/
│   │   └── product.service.js     # use case, aturan bisnis, availability, ID
│   ├── repositories/
│   │   └── product.repository.js  # akses data PostgreSQL melalui pg
│   ├── models/
│   │   └── product.model.js       # bentuk/domain product dan variant
│   ├── validators/
│   │   └── product.validator.js   # validasi dan normalisasi payload POST
│   ├── middlewares/
│   │   ├── validate-request.js    # jalankan validator sebelum controller
│   │   ├── not-found.js           # fallback route 404
│   │   └── error-handler.js       # error → RFC 9457 Problem Details
│   ├── errors/
│   │   └── app-error.js           # error aplikasi terstruktur dan status HTTP
│   └── utils/
│       ├── slug.js                # normalisasi slug/ID
│       └── problem-details.js     # pembentuk response error standar
├── data/
│   └── products.seed.js           # data contoh Iqlifar untuk PostgreSQL
├── docs/
│   └── openapi.yaml               # kontrak OpenAPI 3.x endpoint dan schema
├── .env.example                   # contoh konfigurasi, tanpa secret
├── package.json
└── README.md                      # cara menjalankan dan contoh request
```

### Aturan Ketergantungan Antar-Lapisan

- `routes` hanya menghubungkan path/method, middleware, dan controller; tidak memuat aturan bisnis.
- `controllers` membaca parameter/body, memanggil service, lalu menetapkan status/header/response envelope.
- `services` menjalankan use case dan aturan domain; tidak mengimpor Express atau mengirim response HTTP.
- `repositories` menjadi satu-satunya lapisan service untuk membaca/menulis data; tidak mengetahui request/response.
- `validators` memeriksa bentuk request dan menghasilkan error validasi terstruktur; controller tidak mengulang validasi.
- `models` menyatakan representasi domain, bukan ORM wajib. DTO respons dapat dipetakan service/controller agar field internal tidak bocor.
- Middleware error handler terpasang paling akhir pada app; error tak tertangani diformat sebagai RFC 9457 tanpa stack trace pada response.
- Dependency mengalir ke dalam: route/controller → service → repository. Repository tidak memanggil controller atau service.

### Alur Request

`HTTP request → JSON parser/content-type → route → validation middleware (POST) → controller → service → repository → service/controller response mapper → JSON response`

`GET` mengikuti alur yang sama tanpa body validation. `POST` wajib lolos validator sebelum controller/service dipanggil. Error dari lapisan mana pun diteruskan ke error handler terpusat dan dipetakan ke Problem Details.

## 12. Asumsi dan Keputusan Implementasi

- ID awal produk adalah `iqlifar`; data seed dibuat dari konten Iqlifar yang benar-benar ada di `index.html` dan `main.js`.
- Harga Rp99.000 adalah harga contoh bersama untuk semua ukuran pada UI saat ini, bukan harga komersial terverifikasi.
- Stok 10 adalah batas simulasi lokal, bukan inventori aktual.
- Belum ada foto aktual; gunakan `url: null` dan alt text yang menjelaskan mockup.
- Iqlifar adalah satu-satunya referensi produk untuk scope API ini; konten Molecule 01 + Champaca pada mini-PRD tidak masuk seed maupun response API.
- Kontrak harga saat ini menempatkan harga pada level produk karena UI memakai satu nilai harga. Jika harga bervariasi berdasarkan ukuran, pindahkan `price` ke tiap varian sebelum implementasi.
- PostgreSQL menyimpan data persisten; autentikasi admin, pagination, dan perubahan stok atomik memerlukan scope lanjutan.

## 13. Definisi Selesai

- Ketiga endpoint pada ruang lingkup tersedia dan menggunakan format respons yang didokumentasikan.
- Produk seed sesuai sumber halaman yang dipilih dan ID detail dapat dipanggil.
- Request POST valid membuat produk; request invalid ditolak oleh middleware tanpa mengubah data.
- Acceptance criteria dapat diperiksa melalui Postman dan halaman detail dapat mengonsumsi respons GET.
- Dokumentasi menyatakan dengan jelas bahwa data harga, stok, dan gambar saat ini merupakan data konsep.
- Semua endpoint memakai versi `/api/v1`, success envelope konsisten, dan error mengikuti RFC 9457 Problem Details.
- Implementasi mengikuti batas tanggung jawab dan arah dependency Layered Architecture MVC di atas.
