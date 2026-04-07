# Dokumen Panduan Pengerjaan & Koordinasi Tim (SmartRecruit)

Dokumen ini disusun untuk memberikan transparansi peran, tanggung jawab koding (langkah implementasi murni, tanpa memberikan langsung blok kodenya), serta peta koordinasi mutlak yang harus dilakukan oleh masing-masing anggota tim, terutama sinkronisasi antara sisi Backend dan Frontend.

---

## 1. Zhafran (Backend)
**Domain:** Fondasi Aplikasi, Autentikasi (JWT) & HR Job Posting (CRUD)

**Langkah Pengerjaan (Coding Task):**
1. Mengerjakan *scaffolding* awal arsitektur Node.js & Express (`server.js`).
2. Melakukan konfigurasi koneksi *database* MongoDB menggunakan Mongoose (`config/db.js`).
3. Mengatur tata letak `middleware` dan pembuatan Skema Database awal (`User.js` & `JobPosting.js`).
4. Menyusun skrip utilitas `seed.js` untuk meng-injeksi akses akun HR Admin pertama ke *database* (`hrdemo@gmail.com`).
5. Membangun logika pendaftaran (*login*, *logout*, *change-password*) dengan men-generate maupun memvalidasi kerahasiaan token JWT di folder `controllers`.
6. Melakukan pembuatan REST API rute aman (*Protected Routes*) di manajemen *Job Posting* HR (Buat/Edit/Hapus lowongan pekerjaan).
7. Menyiapkan kerangka *skeleton* untuk Frontend (konfigurasi awal Vite, instalasi `axios`, dan arsitektur *interceptor* pelekatan JWT Token di *request header*).

**Peta Koordinasi:**
*   **Lintas Divisi (dengan Aulia - Frontend):** Zhafran wajib memberikan *payload* (format JSON) respons saat API Login ditekan. Aulia butuh rincian struktur model Data *Job Posting* agar dia bisa memetakan *Input text* pembuatan *job* di Form Frontend dengan benar sesuai nama properti Zhafran.

---

## 2. Yusril (Backend)
**Domain:** Job Halaman Publik, File Upload CV, & API Apply Pelamar

**Langkah Pengerjaan (Coding Task):**
1. Membuat spesifikasi Skema Database Pelamar (`Candidate.js`).
2. Menyiapkan *Middleware* menggunakan `multer` untuk merestriksi agar berkas yang dapat diterima di lamaran **hanyalah berkas berekstensi .pdf** maksimal batas MB tertentu.
3. Menyusun utilitas abtraksi berkas `storageService.js`. File ini mengunggah berkas terpotong ke *API Cloudinary*, dan mengembalikan URL final tanpa menyimpan file lokal selamanya.
4. Mendirikan URL GET bebas tanpa JWT (`/api/jobs`) agar halaman publik dapat mengambil data *array* berisi pekerjaan (*Job*). Menerapkan fungsionalitas pencarian kata kunci (*Query Search parameter*).
5. Membuat fungsi pamungkas: `POST /api/jobs/:id/apply` untuk menghisap kiriman pelamar.
6. Memastikan *Controller* menetapkan status default kandidat `= pending`, lalu di akhir kode, melempar data CV menuju sistem asinkron *screeningJob*.

**Peta Koordinasi:**
*   **Lintas Divisi (dengan Valen - Frontend):** Memastikan Valen mengubah metode pengiriman profil lamaran menggunakan paket `multipart/form-data` melalui Axios agar bundel dokumen CV (tipe biner PDF) tersampaikan utuh di *Backend* (tidak bisa menggunakan sekadar konvensi *application/json*).
*   **Satu Divisi (dengan Tim Bersama - AI Backend):** Memastikan pelatuk (trigger) yang mengeksekusi asinkron fungsi `screeningJob.js` milik Tim Bersama, terpasang rapi sesaat sebelum menyudahi respons ke pelamar.

---

## 3. Vera (Backend)
**Domain:** Pengelolaan Kandidat, Dashboard Statistics, & Surel Notifikasi (Nodemailer)

**Langkah Pengerjaan (Coding Task):**
1. Menyusun kode penghubung *SMTP Protocol* lewat `emailService.js` (Nodemailer) – dengan surel konfirmasi (*hardcoded template*).
2. Mengekstrak kalkulasi analitik pada `dashboardController.js` yang mengkalkulasikan total jumlah (count) Loker, lamaran masuk, yang diproses, dll (Metode GET `/api/dashboard/stats`).
3. Mengatur penyebaran data List Kandidat (Penyortiran lewat parameter *ID Job*) dan detail *Review* Kandidat.
4. Membangun sakelar aksi penerimaan pelamar dengan `PUT /api/candidates/:id/accept`, mengganti status dan otomatis mencabut *trigger Nodemailer* balasan bahagia.
5. Membangun sakelar penolakan pada `/api/candidates/:id/reject`. Tombol penolakan harus lebih cerdas dengan menembak dulu generator ulasan dari layanan AI agar email penolakan bernada *personal constructive feedback*.

**Peta Koordinasi:**
*   **Lintas Divisi (dengan Zahra - Frontend):** Vera harus memastikan Zahra memahami struktur *array* dari data *Dashboard stat* dan riwayat kandidat untuk dibentuk di grafik React `Recharts`.
*   **Satu Divisi (dengan Tim Bersama - AI Backend):** Vera membutuhkan fungsi lembar balik/tanggapan dari *aiService* berisi kalimat simpati + analisis (AI Feedback) sebelum *Email Nodemailer* penolakan lepas landas ke pelamar.

---

## 4. Tim Bersama (Backend - AI Specialist)
**Domain:** Arsitektur OpenAI GPT, Pengekstrakan Teks PDF, & Screening Ulasan Asinkron (*Background Job*)

**Langkah Pengerjaan (Coding Task):**
1. Merajut `aiService.js` yang mengirimkan pancingan *System Prompts* (perintah khusus AI) mutakhir berbasis API OpenAI.
2. Membentuk logika yang mengekstraksi Teks murni bermakna fungsional dari bingkai berkas *.PDF* menggunakan `pdf-parse`.
3. Membangun jantung penyaringan (*Script: screeningJob.js*) - yang tidak mencekik kinerja NodeJS (berjalan pada sistem sinkronisasi tertunda/async). Skrip ini menugaskan AI untuk mengeluarkan kalkulasi (*Skor 0-100*, Peluru Kelebihan *(Strengths)*, Peluru Kekurangan *(Weaknesses)*). Di akhir proses tugas ini akan memperbarui status DB Kandidat menjadi *"processed"*.
4. Mengkalibrasi AI *Rejection Feedback Generator*, agar memberikan penolakan bernada HR Profesional tanpa kaku layaknya robot kalkulator.

**Peta Koordinasi:**
*   **Satu Divisi (dengan Yusril & Vera):** Tim Bersama menyediakan selubung fungsi *Screening* agar bisa dipakai oleh Yusril di API lamaran, dan menyediakan selubung fungsi *Feedback Generator* agar bisa dipinjam Vera di API persetujuan HR. 

---

## 5. Valen (Frontend)
**Domain:** Antarmuka Halaman Pelamar *(Publik)*, Tabel Pekerjaan, & Mekanisme Pengisian Melamar

**Langkah Pengerjaan (Coding Task):**
1. Membuat rancangan laman *Landing Page* statis/indah (Slicing UI Dummy Company).
2. Membangun halaman katalog antarmuka *Job List* dan memfungsikan fitur paramater perantara (tombol centang jenis pencarian, *combo box*, dll) menggunakan UI State.
3. Merakit kolom detil loker (*Job Detail*) beserta narasi lengkap tentang fungsi jabatan.
4. Mendirikan formulir interaktif di `ApplyForm.jsx` menggunakan validasi ketat dari `React Hook Form` supaya tak ada isian yang meleset dari kaidah *input*, termasuk validasi format ekstensi *file Input* yang hanya membolehkan memuat `.pdf`.
5. Mendirikan koneksi pelontar *Redux Toolkit* (`jobSlice`) sehingga katalog pekerjaan tersaji dari lemari *Backend*.

**Peta Koordinasi:**
*   **Lintas Divisi (dengan Yusril - Backend):** Valen harus memastikan URL API Pengiriman CV (*File Multipart*) selaras dengan pembungkus *Backend* milik Yusril, dan mengoreksi error *File too large* di UI.

---

## 6. Aulia (Frontend)
**Domain:** Panel Rute Tertutup HR, Form *Login*, & Ekosistem CRUD Pekerjaan (*Job Posting*)

**Langkah Pengerjaan (Coding Task):**
1. Merancang bingkai layar (*Login UI*) bagi HR.
2. Memfokuskan pengamanan rute *React Router DOM*: membungkus Dasbor ke dalam `ProtectedRoute.jsx` agar siapa pun tanpa JWT Token di-tendang (*redirect*) kembali ke gerbang Login.
3. Mengelola mekanisme (*Token Storage*) via Local Storage peramban (tanpa menggunakan cookie demi kemudahan di React SPA).
4. Slicing UI tabel-tabel pembedahan CRUD Pekerjaan. Fitur penambahan lowongan dengan desain *Form* yang cukup masif (tentang *skills*, persyaratan, letak kota, dll). Menambah *Toggle* animasi interaktif penutupan Loker (Buka/Tutup lowongan).
5. Merajut penyalur memori dari Redux (`authSlice` untuk\ state orang login, dan mekanisme edit/buang dari API *job posting* milik *backend*).

**Peta Koordinasi:**
*   **Lintas Divisi (dengan Zhafran - Backend Lead):** Sangat bergantung pada struktur *Response* pengantaran (*auth*). Sinkronisasi rute URL khusus `/api/hr/...` di fungsi pengambilan Axios *Frontend* dengan yang di-*deploy* Zhafran. Pastikan parameter ubah Sandi tepat presisi sasaran field-field *Request*-nya.

---

## 7. Zahra (Frontend)
**Domain:** Tampilan Beranda HR Dasbor, Statistik Visual (Charts), & Tinjauan Eksekusi AI Kandidat

**Langkah Pengerjaan (Coding Task):**
1. Menciptakan seni antarmuka dengan ekstensi `Recharts` yang mengambil data statistik agar menjadi Visual Grafik Pie (*Domain kerja*) dan Diagram Bar yang indah mendalam di Layar Overview/Dashboard HR.
2. Merangkai kerangka Daftar Tabel riwayat pengelompokan lamaran berdasarkan Job Postingan. Menghidupkan alat navigasi penyortiran Kandidat di Redux.
3. **Penyatuan Tampilan AI:** Membangun antarmuka terperinci (*Candidate Summary Details*), menampilkan bingkai hasil ekstraksi kelebihan / kekurangan CV hasil *Scoring* OpenAI GPT, merancang warna-warna dinamis (Hijau = Kecocokan Di Atas 80, Merah = Di bawah 40).
4. **Implementasi Keahlian Lanjut (Polling):** Mengonfigurasi mekanisme penyegaran (*Auto Refetch API Redux*) asinkron setiap 5 - 10 detik agar pelamar yang tadinya berlogo "*Pending*" bisa lompat ter- *refresh* memunculkan logo / nilai skornya seketika (simulasi *Real-time*).
5. Membuat dua pemicu final yang aman: Tombol berani (*Button* merah besar "Kirim AI Rejeksi") & Tombol sakelar "Terima" yang dipasang sistem tameng peringatan konfirmasi UI Modal (*Are you sure to perform this action?*).

**Peta Koordinasi:**
*   **Lintas Divisi (dengan Vera - Backend):** Sangat bergantung pada data kembalian API Kandidat statistik Dasbor milik Vera. Harus selaras jika Vera merubah status teks Kandidat apa saja parameter yang akan disajikan dan perhatikan animasi *Loader* selama API Vera menyurati surat tolak di belakang antarmuka.

---
*Dokumen ini dapat digunakan sebagai referensi untuk Daily/Weekly Stand-up Team.*
