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
5. **Original PDF Preservation**: Stores original uploaded PDFs securely under `/public/uploads/cvs/`.
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

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qbawcgxjvjkvtgtczseo.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🗄️ Supabase Database Schema

To set up the database table, execute the following SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS public.cv_records (
    id TEXT PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    original_pdf_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cv_records ENABLE ROW LEVEL SECURITY;

-- Allow public reads and inserts
CREATE POLICY "Allow public read access" ON public.cv_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.cv_records FOR INSERT WITH CHECK (true);
```

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
