# AK Traders - AI-Powered CV Extraction & Management Platform

A high-performance Next.js application designed around a streamlined CV workflow:
**PDF CV Upload** $\rightarrow$ **Instant Stream Extraction & Gemini AI Enhancement** $\rightarrow$ **Clean Text & Minimal JSON** $\rightarrow$ **Supabase Database Storage** $\rightarrow$ **Candidate Name Search** $\rightarrow$ **Complete CV View & Original PDF Viewer**.

---

## 🚀 Core Features & Primary Workflow

1. **PDF Upload**: Upload candidate CVs (PDF format up to 10MB).
2. **Instant High-Speed Extraction**: Uses direct PDF stream text parsing (`pdf2json`) and **Gemini 2.5 Flash AI** server-side to extract all readable information as clean text and identify the candidate's name.
3. **Minimal JSON Record**: Saves a clean, lightweight JSON structure:
   ```json
   {
     "id": "cv-1785765270004-5461",
     "candidateName": "John Doe",
     "extractedText": "Complete clean readable text extracted from the PDF",
     "originalFileName": "sample_cv.pdf",
     "originalPdfUrl": "/uploads/cvs/cv-1785765270004-5461_sample_cv.pdf",
     "uploadedAt": "2026-08-03T19:54:30.000Z"
   }
   ```
4. **Supabase Database Integration**: Stores CV records in `public.cv_records` table on Supabase.
5. **Original PDF Preservation**: Stores original uploaded documents in private object storage; production CVs must never be committed or served from `/public/`.
6. **Live Candidate Search**: Header search bar performs instant case-insensitive search by candidate name against Supabase.
7. **Complete CV & PDF Viewer**: Dedicated candidate CV page displaying complete extracted text and an inline viewer for the original PDF document.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL `public.cv_records`)
- **AI Service**: Google Gemini API (`gemini-2.5-flash`)
- **PDF Extraction**: `pdf2json` + `@google/generative-ai`

---

## ⚙️ Environment Configuration

`.env.example` থেকে একটি untracked `.env.local` তৈরি করুন এবং deployment secret manager-এ real credentials রাখুন। কোনো API key, service-role credential বা private storage credential repository-তে commit করবেন না।

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

---

## 🗄️ Supabase Database & Storage

Production schema, Row Level Security policies এবং private Storage buckets versioned Supabase migrations দিয়ে পরিচালিত হবে। Anonymous public read, upload বা delete policy ব্যবহার করবেন না। CV এবং profile image sensitive PII হিসেবে private bucket-এ রাখতে হবে এবং authorized request-এর জন্য short-lived signed URL দিতে হবে।

Legacy `public.cv_records` data migration complete না হওয়া পর্যন্ত compatibility source হিসেবে রাখা হবে; নতুন deployment-এ normalized employee/profile schema ব্যবহার করা হবে।

---

## 💻 Local Quickstart

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 🔌 API Endpoints

- `POST /api/cv/upload` - Upload PDF file, extract text via Gemini AI & local parser, save to Supabase.
- `GET /api/cv/search?query=name` - Search candidates by name (case-insensitive partial match).
- `GET /api/cv/[id]` - Retrieve a single candidate's CV record by ID.
