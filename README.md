# RekapPanen

## Deskripsi Singkat
RekapPanen adalah layanan backend berbasis REST API yang dirancang untuk membantu pencatatan keuangan dan operasional budidaya padi per musim tanam. Aplikasi ini mencatat kebutuhan bahan tanam (bibit, pupuk, irigasi/air, dan BBM pembajakan), menghitung upah pekerja harian berdasarkan tahapan kerja (pembajakan, penanaman, pemupukan, hingga pemanenan), serta merekap distribusi penjualan hasil panen ke berbagai pembeli (seperti tengkulak maupun Bulog) dengan harga jual yang berbeda-beda.

---

## Tech Stack
* Runtime Environment: Node.js
* Web Framework: ExpressJS
* Database & ODM: MongoDB & Mongoose
* Middleware & Konfigurasi: CORS, Dotenv
* Development Tool: Nodemon
* API Testing: Postman

---

## Fitur Utama & Penjelasan Singkat
1. Create Data Musim Tanam (`POST`): Menambahkan pencatatan periode musim tanam baru beserta rincian biaya bahan, upah pekerja harian per tahap, jumlah hasil panen, dan distribusi penjualan. Sistem otomatis menghitung subtotal setiap item, total modal operasional, pendapatan, sisa panen, serta keuntungan bersih saat data disimpan.
2. Read Data & Ringkasan Keuangan (`GET`): Menampilkan seluruh daftar rekapitulasi per musim tanam sekaligus ringkasan akumulasi total modal dan keuntungan bersih dari keseluruhan musim yang tercatat, serta mendukung pencarian detail satu musim tanam spesifik berdasarkan ID.
3. Update Data Musim Berjalan (`PUT`): Memperbarui rincian pengeluaran bahan, penambahan upah pekerja, maupun data penjualan pada musim tanam yang masih berstatus `Berjalan` dan menghitung ulang seluruh total secara otomatis. Musim tanam yang hasil panennya sudah terjual habis (`Selesai`) otomatis terkunci agar data historis tetap aman.
4. Delete Data Musim Tanam (`DELETE`): Menghapus catatan rekapitulasi musim tanam tertentu secara permanen dari database MongoDB berdasarkan ID.

---

## Instalasi & Cara Menjalankan Aplikasi

### Prasyarat
Pastikan sudah terpasang:
* [Node.js](https://nodejs.org/) (versi 18 atau lebih baru)
* [MongoDB Community Server / MongoDB Compass](https://www.mongodb.com/try/download/community) (atau akun MongoDB Atlas)
* [Postman](https://www.postman.com/) untuk menguji endpoint API

### Langkah-Langkah Menjalankan
1. **Clone repository ini ke komputer lokal:**
   ```bash
   git clone [https://github.com/USERNAME_KAMU/rekap-panen-api.git](https://github.com/USERNAME_KAMU/rekap-panen-api.git)
   cd rekap-panen-api

2. **Install seluruh package/dependensi yang dibutuhkan:** 
   npm install

3. **Buat dan atur file konfigurasi .env:**
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/rekap_panen_db

4. **Jalankan server aplikasi:**
   npm run dev atau npm start

5. **Verifikasi server berjalan:**
   Server berjalan di http://localhost:5000
   MongoDB Terhubung: 127.0.0.1

Aplikasi siap digunakan dan diuji melalui Postman pada alamat http://localhost:5000/api/rekap-panen.

**DAFTAR ENDPOINT API**
1. POST /api/rekap-panen – Menambah data musim tanam baru dan menghitung total otomatis. (201, 500)

2. GET /api/rekap-panen – Mengambil ringkasan total seluruh musim dan daftar data per musim. (200, 500)

3. GET /api/rekap-panen/:id – Mengambil detail data satu musim tanam berdasarkan ID. (200, 404, 500)

4. PUT /api/rekap-panen/:id – Memperbarui data musim berstatus Berjalan dan menghitung ulang. (200, 400, 404, 500)

5. DELETE /api/rekap-panen/:id – Menghapus data musim tanam berdasarkan ID. (200, 404, 500)
