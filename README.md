# SmartRecruit Backend

SmartRecruit Backend adalah RESTful API untuk sistem rekrutmen cerdas. Proyek ini mendukung manajemen lowongan kerja, pelacakan kandidat, penyaringan CV otomatis menggunakan kecerdasan buatan (AI), unggah berkas, dan layanan pengiriman email.

## 🚀 Fitur Utama

- **Autentikasi & Otorisasi:** Sistem login/registrasi berbasis JWT untuk HR.
- **Manajemen Lowongan (Job Postings):** CRUD lowongan pekerjaan.
- **Manajemen Kandidat:** Pendaftaran kandidat ke lowongan tertentu.
- **Integrasi Penyimpanan:** Mengunggah resume/CV (PDF) ke Cloudinary.
- **Pemrosesan CV & AI:** Mengekstrak teks dari PDF dan memproses penilaian (scoring) otomatis dengan OpenAI API.
- **Pemberitahuan:** Notifikasi email otomatis menggunakan Nodemailer.

## 🛠️ Tech Stack

- **Platform:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Token (JWT) & bcryptjs
- **File Handling:** Multer & Cloudinary
- **AI / Data Extraction:** OpenAI API & pdf-parse
- **Email:** Nodemailer

## 📂 Struktur Direktori

```text
backend/
├── config/        # Konfigurasi database, Cloudinary, dll
├── controllers/   # Logika bisnis untuk setiap rute API
├── jobs/          # Proses background task (contoh: antrian screening CV)
├── middleware/    # Middleware (Autentikasi, Error Handler, Upload)
├── models/        # Skema database Mongoose (User, JobPosting, Candidate)
├── routes/        # Definisi rute API (Autentikasi, Kandidat, Dashboard, HR)
├── services/      # Abstraksi logika eksternal (AI, Email, Penyimpanan)
├── .env.example   # Contoh konfigurasi file environment
├── .gitignore     # Daftar file dan direktori yang diabaikan oleh Git
├── package.json   # Dependensi project dan scripts
└── server.js      # Titik masuk utama (Entry point) aplikasi
```

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal dan memiliki:
- [Node.js](https://nodejs.org/) (versi v14 ke atas disarankan)
- URI/Koneksi [MongoDB](https://www.mongodb.com/)
- Akun dan kredensial [Cloudinary](https://cloudinary.com/) (API Key & Secret)
- Akun dan kredensial [OpenAI API](https://openai.com/api/)
- Akun Email/SMTP untuk pengiriman email otomatis.

## ⚙️ Cara Setup & Menjalankan (Instalasi)

**1. Clone Repositori (Jika belum)**
```bash
git clone https://github.com/NorpajSucces/backend-cv-screening.git
cd backend-cv-screening 
```

**2. Instal Dependensi**
Pastikan Anda berada di root direktori backend, lalu jalankan:
```bash
npm install
```

**3. Setup Environment Variables (.env)**
Salin template konfigurasi ke file `.env` baru:
```bash
cp .env.example .env
```
Buka file `.env` dan lengkapi konfigurasi berikut dengan data Anda sendiri:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartrecruit
JWT_SECRET=rahasia_jwt_super_aman
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=nama_cloud_anda
CLOUDINARY_API_KEY=api_key_anda
CLOUDINARY_API_SECRET=api_secret_anda

# OpenAI
OPENAI_API_KEY=sk-xxxx...

# Email configuration
EMAIL_USER=email_anda@gmail.com
EMAIL_PASS=password_app_email_anda
EMAIL_FROM=SmartRecruit <noreply@smartrecruit.com>
```

**4. Jalankan Server API**

Untuk mode **Development** (dengan live-reload `nodemon`):
```bash
npm run dev
```

Untuk mode **Production**:
```bash
npm start
```

Jika berhasil berjalan, Anda akan melihat pesan seperti:
`Server berjalan di port 5000`
(Dan pesan koneksi sukses dari modul database)

## 📜 Scripts yang Tersedia

Di dalam direktori proyek, Anda dapat menjalankan perintah:
- `npm start`: Menjalankan server menggunakan Node biasa (untuk Production).
- `npm run dev`: Menjalankan server menggunakan Nodemon (otomatis mere-start saat ada perubahan file).
