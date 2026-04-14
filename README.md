# SmartRecruit Backend

### **Frontend Repository:** [SmartRecruit Frontend](https://github.com/NorpajSucces/frontend-cv-screening)

> **SmartRecruit** is a full-scale intelligent recruitment system (RESTful API), built as the Capstone Project for KADA Batch 3 by Team 5. This project facilitates job vacancy management, applicant tracking, and most importantly: **Automated CV Screening using Artificial Intelligence (AI)**.

## Team 5 Members

| Name | Role | Social Links |
| :--- | :--- | :--- |
| **Zhafran Pradistyatama Kuncoro** | Project Manager + Backend | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/zhafran-kuncoro/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/NorpajSucces) |
| **Yusril Ihza Farhan Wijaya** | Backend | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yusril-wijaya/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/YusrilIhzaFarhanWijaya) |
| **Lucky Vera Oktavia** | Backend | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/luckyoktavia/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/luckyokta) |
| **Luthfiana Zahra Firdausi** | Frontend | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/luthfiana-zahra-99390a193/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/zahrafir) |
| **Aulia Puspa** | Frontend | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aulia-puspa-2a8456279/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/auliapuspa) |
| **Valentine Andreas Manurung** | Frontend | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/valentine-andreas-manurung-177282176/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/ghoskull) |
---

## 1. Project Overview
In today's competitive business era, HR teams are often stuck with manual and inefficient selection processes. SmartRecruit integrates conventional recruitment management with artificial intelligence—transforming the selection process from subjective and slow to objective, structured, and highly efficient. 

## 2. Core Features
- **Secure Authentication:** HR login and profile management using JSON Web Tokens (JWT) encrypted with `bcrypt`.
- **Job Postings Management:** Complete *CRUD* system for publishing job openings.
- **Public Application Process:** Candidates can apply for open positions without needing to register (*No-Login Apply*).
- **Asynchronous AI Processing (Background Jobs):** 
  - Extracts text from candidate-uploaded PDF CVs (`pdf-parse`).
  - Evaluates candidates (Scoring 0-100) and determines strengths/weaknesses as a *background job* using the **KADA AI Cloud Endpoint**.
  - Provides unique AI-generated *Rejection Feedback*.
- **File Management:** CVs are uploaded using Multer and safely stored in *Cloud Storage* via Cloudinary.
- **Automated Email Notifications:** Automated acceptance/rejection emails using Nodemailer.

## 3. System Architecture
The backend adopts an asynchronous, non-blocking architecture specifically tailored for heavy AI processing.

```text
Express API Server (Node.js)
  ↙         ↓          ↘
MongoDB   Cloudinary   KADA AI Cloud
Database  (CV Storage) (AI Screening)
              ↓
          Nodemailer
         (Email Notif)
```

### Background Processing (Workers)
We utilize a robust background worker system (`screeningJob.js` & `decisionJob.js`) instead of synchronous API calls:
- **`screeningJob.js`**: Automatically picks up `pending` candidates, extracts PDF text, and fires requests to the **KADA AI Cloud Endpoint** for scoring without blocking the HTTP response.
- **`decisionJob.js`**: Orchestrates HR decisions. When an applicant is rejected, it automatically generates personalized constructive feedback via AI and emails them gracefully in the background.

## 4. Database Schema (MongoDB Collections)
The system uses MongoDB Atlas with Mongoose ODM. Below is the detailed structure of our document models:

### `User` (HR Admin)
- `name` (String)
- `email` (String) - Unique
- `password` (String) - Hashed using `bcrypt`
- `role` (String) - Default: `"admin"`
- `createdAt` (Date)

### `JobPosting` (Vacancy)
- `title` (String)
- `aboutPosition` (String)
- `description` (String)
- `requirements` (Array of Strings)
- `location` (String)
- `employmentType` (Enum: `Full-time`, `Part-time`, `Internship`)
- `status` (Enum: `open`, `closed`) - Default: `"open"`
- `createdBy` (ObjectId) - Reference to **User**
- `createdAt` (Date)

### `Candidate` (Applicant & AI Context)
- `name` (String)
- `email` (String)
- `phone` (String)
- `jobId` (ObjectId) - Reference to **JobPosting**
- `cvUrl` (String) - Cloud URL from Cloudinary
- `status` (Enum: `pending`, `processed`, `advanced`, `rejected`, `failed`) - Default: `"pending"`
- `appliedAt` (Date)

**AI Generated Data Fields (Loaded Asynchronously):**
- `aiScore` (Number, 0-100) - AI evaluation rating
- `aiStrengths` (Array of Strings)
- `aiWeaknesses` (Array of Strings)
- `aiFeedback` (String) - Personalized constructive rejection feedback

## 5. API Endpoints Map

> **Interactive Documentation:** We use **Swagger UI** for complete and interactive API documentation. You can access the full, testable endpoint documentation dynamically at: `http://localhost:5000/api-docs` (when running locally).

### Auth & HR Core (Requires JWT)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/login` | HR login, emits JWT token |
| GET | `/api/dashboard/stats`| Gets Live HR stats analytics |
| GET/POST | `/api/hr/jobs` | CRUD operations for vacancies |
| DELETE | `/api/hr/jobs/:id` | Cascade Deletes job + candidates + Cloudinary URLs |

### Public Job Board (No Login Required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/jobs` | Retrieve open jobs with search/filters |
| POST | `/api/jobs/:id/apply` | Submit Application + Upload CV (Triggers AI Worker) |

### Candidate AI Decisions
| Method | URL | Description |
|--------|-----|-------------|
| PUT | `/api/candidates/:id/accept` | Accept candidate (Background Email) |
| PUT | `/api/candidates/:id/reject` | Reject candidate (Background AI Feedback + Email) |

## 6. Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Platform** | Node.js + Express.js | Main server-side framework |
| **Database** | MongoDB + Mongoose | NoSQL DB with object modeling |
| **AI Integration** | KADA AI Cloud API | `gpt-5.2-pro` model for CV Scoring |
| **Authentication** | JWT + bcrypt | Admin security system |
| **Storage** | Multer + Cloudinary | Middleware for File Handling & Cloud Storage |
| **Utilities** | pdf-parse + Nodemailer | CV text extraction & Email Delivery |

## 7. Project Structure

```text
backend-cv-screening/
├── config/        # MongoDB and External Integrations (Cloudinary/Email)
├── controllers/   # Core Business Logic per Endpoint (HR, Public, AI)
├── jobs/          # Background workers (e.g., Non-blocking AI evaluation queue)
├── middleware/    # Auth, Role Validators, and Error Handling
├── models/        # Database Collections Schema (User, JobPosting, Candidate)
├── routes/        # API Route Definitions (/api/auth, /api/hr, /api/candidates, etc.)
├── services/      # Service Layer (aiService.js, emailService.js, uploadService.js)
├── .env.example   # Environment variables template
└── server.js      # Main Entry Point
```

## 8. Local Development Setup

**1. Clone the repository and install dependencies:**
```bash
git clone https://github.com/NorpajSucces/backend-cv-screening.git
cd backend-cv-screening
npm install
```

**2. Configure Environment Variables (`.env`):**
Create the `.env` configuration file base on your environment:
```env
PORT=5000
MONGO_URI=mongodb+srv://<your_username>@cluster.mongodb.net/smartrecruit
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d

# External Integration (Cloudinary)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# KADA AI Cloud Integration
KADA_API_URL=https://api.kada.ai/v1/chat/completions
KADA_API_KEY=xxx
KADA_MODEL=openai/gpt-5.2-pro

# Nodemailer Configuration (Gmail App Passwords recommended)
EMAIL_USER=xxx
EMAIL_PASS=xxx
EMAIL_FROM=SmartRecruit <noreply@smartrecruit.com>
```

**3. Start the API Server:**
```bash
npm run dev
```

---

*Crafted by Team 5, KADA Batch 3*
