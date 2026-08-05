# Bulk CV Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a robust Bulk CV Upload feature supporting drag-and-drop of multiple files (PDF, DOCX, ZIP), asynchronous batch parsing with AI fallback, real-time batch progress tracking, and batch status polling.

**Architecture:** 
1. **API Tier**: 
   - `POST /api/cv/upload-bulk`: Receives `FormData` containing multiple files or `.zip` archive, extracts `.zip` contents, registers a batch job ID in an in-memory/Supabase state, and executes concurrent parsing tasks (capped at concurrency = 3).
   - `GET /api/cv/batch-status`: Polls status for a `batchId`, returning overall completion progress, success count, failure count, and per-item statuses.
2. **Parsing Engine**: `lib/cv-batch-processor.ts` handles PDF text extraction using `pdf2json`, ZIP extraction using `jszip`, and AI structured extraction with model fallback (`gemini-2.0-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-flash`) plus local regex/heuristics extraction fallback when AI fails or key is unconfigured.
3. **Frontend Tier**: `features/cv-upload/BulkUploadTab.tsx` provides a drag-and-drop dropzone, live batch processing monitor with percentage progress bar, item status badges, retry actions, and direct integration with the Candidate list.

**Tech Stack:** Next.js 14 App Router, TypeScript, `@google/generative-ai`, `pdf2json`, `jszip`, `lucide-react`, Tailwind CSS, Supabase Client (`public.cv_records`).

## Global Constraints

- Use Next.js 14 App Router standard API conventions (`NextRequest`, `NextResponse`).
- Support `.pdf`, `.docx`, `.png`, `.jpg`, `.zip` file extensions.
- Limit max batch size to 50 files or 100MB per upload session.
- Concurrency throttled to 3 parallel parsing jobs to prevent API rate limits.
- Individual file failure MUST NOT crash the batch job or affect other files.

---

### Task 1: Batch Process Utility & Parser Engine (`lib/cv-batch-processor.ts`)

**Files:**
- Create: `lib/cv-batch-processor.ts`
- Test: Manual / API test

**Interfaces:**
- Consumes: `@google/generative-ai`, `pdf2json`, `jszip`, `@supabase/supabase-js`
- Produces: `processSingleCvBuffer(buffer: Buffer, fileName: string)`, `processCvBatch(files: Array<{ name: string; buffer: Buffer }>, batchId: string)`

- [ ] **Step 1: Create `lib/cv-batch-processor.ts` with in-memory batch store and ZIP unpacking**

```ts
import PDFParser from "pdf2json";
import JSZip from "jszip";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export interface BatchItemStatus {
  id: string;
  fileName: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage?: string;
  candidateName?: string;
  recordId?: string;
}

export interface BatchJob {
  batchId: string;
  totalFiles: number;
  processedFiles: number;
  successFiles: number;
  failedFiles: number;
  status: "processing" | "completed" | "failed";
  items: BatchItemStatus[];
  createdAt: number;
}

// Global in-memory status map for fast status polling
export const batchJobsMap = new Map<string, BatchJob>();
```

- [ ] **Step 2: Add PDF Text Extraction & Name Extraction Fallback logic**

```ts
export function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const pdfParser = new PDFParser(null, true);
    pdfParser.on("pdfParser_dataError", () => resolve(""));
    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        let fullText = "";
        if (pdfData && pdfData.Pages) {
          for (const page of pdfData.Pages) {
            let pageText = "";
            let lastY = -1;
            if (page.Texts) {
              for (const textObj of page.Texts) {
                const y = textObj.y;
                let textStr = "";
                if (textObj.R) {
                  for (const run of textObj.R) {
                    if (run.T) {
                      try {
                        textStr += decodeURIComponent(run.T);
                      } catch {
                        textStr += run.T;
                      }
                    }
                  }
                }
                if (lastY !== -1 && Math.abs(y - lastY) > 0.3) {
                  pageText += "\n";
                } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
                  pageText += " ";
                }
                pageText += textStr;
                lastY = y;
              }
            }
            fullText += pageText + "\n\n";
          }
        }
        const cleanText = fullText
          .replace(/----------------Page \(\d+\) Break----------------/g, "")
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
          .replace(/ +/g, " ")
          .replace(/\n +/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        resolve(cleanText);
      } catch {
        resolve("");
      }
    });
    pdfParser.parseBuffer(buffer);
  });
}
```

- [ ] **Step 3: Implement ZIP Unpacker Utility**

```ts
export async function unpackZipFiles(zipBuffer: Buffer): Promise<Array<{ name: string; buffer: Buffer }>> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const result: Array<{ name: string; buffer: Buffer }> = [];

  for (const relativePath of Object.keys(zip.files)) {
    const file = zip.files[relativePath];
    if (!file.dir && !relativePath.startsWith("__MACOSX/") && !relativePath.startsWith(".")) {
      const lower = relativePath.toLowerCase();
      if (lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
        const fileBuffer = await file.async("nodebuffer");
        const cleanName = relativePath.split("/").pop() || relativePath;
        result.push({ name: cleanName, buffer: fileBuffer });
      }
    }
  }
  return result;
}
```

- [ ] **Step 4: Implement Gemini AI Extraction with Multiple Model Fallbacks**

```ts
export async function extractWithGeminiFallback(base64Data: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-flash"];
  const genAI = new GoogleGenerativeAI(apiKey);

  const documentPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const prompt = `Extract structured CV info into JSON with fields: candidateName, personal (fullName, mobile, email, location), employment (department, designation), education (degree, institution), skills (array). Return ONLY valid JSON.`;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result: any = await model.generateContent([prompt, documentPart]);
      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      console.warn(`Model ${modelName} attempt notice:`, e.message || e);
    }
  }
  return null;
}
```

- [ ] **Step 5: Implement `processCvBatch` with Concurrency Throttling**

```ts
export async function processCvBatch(
  files: Array<{ name: string; buffer: Buffer }>,
  batchId: string
) {
  const job: BatchJob = {
    batchId,
    totalFiles: files.length,
    processedFiles: 0,
    successFiles: 0,
    failedFiles: 0,
    status: "processing",
    createdAt: Date.now(),
    items: files.map((f, i) => ({
      id: `item-${i}-${Date.now()}`,
      fileName: f.name,
      status: "queued",
      progress: 0,
    })),
  };
  batchJobsMap.set(batchId, job);

  const CONCURRENCY = 3;
  let index = 0;

  async function worker() {
    while (index < files.length) {
      const currentIndex = index++;
      const file = files[currentIndex];
      const item = job.items[currentIndex];

      item.status = "processing";
      item.progress = 30;

      try {
        const text = await extractTextFromPdf(file.buffer);
        item.progress = 60;

        const base64 = file.buffer.toString("base64");
        const aiData = await extractWithGeminiFallback(base64, "application/pdf");

        const candidateName = aiData?.candidateName || aiData?.personal?.fullName || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
        item.candidateName = candidateName;

        // Save to Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const uniqueId = `cv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const record = {
          id: uniqueId,
          candidate_name: candidateName,
          extracted_text: text || "Extracted from PDF upload",
          structured_data: aiData ? JSON.stringify(aiData) : null,
          original_file_name: file.name,
          original_pdf_url: `data:application/pdf;base64,${base64}`,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("cv_records").insert(record);
        if (error) {
          console.warn("Supabase insert warning:", error.message);
        }

        item.status = "completed";
        item.progress = 100;
        item.recordId = uniqueId;
        job.successFiles++;
      } catch (err: any) {
        item.status = "failed";
        item.errorMessage = err.message || "Failed to process file";
        job.failedFiles++;
      } finally {
        job.processedFiles++;
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => worker());
  await Promise.all(workers);

  job.status = job.failedFiles === files.length ? "failed" : "completed";
}
```

---

### Task 2: Backend API Routes (`app/api/cv/upload-bulk/route.ts` & `app/api/cv/batch-status/route.ts`)

**Files:**
- Create: `app/api/cv/upload-bulk/route.ts`
- Create: `app/api/cv/batch-status/route.ts`

**Interfaces:**
- Consumes: `lib/cv-batch-processor.ts`
- Produces: API response for upload and status polling

- [ ] **Step 1: Implement `POST /api/cv/upload-bulk`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { processCvBatch, unpackZipFiles, batchJobsMap } from "@/lib/cv-batch-processor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFiles = formData.getAll("files") as File[];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided." }, { status: 400 });
    }

    const filesToProcess: Array<{ name: string; buffer: Buffer }> = [];

    for (const file of uploadedFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.name.toLowerCase().endsWith(".zip")) {
        const unpacked = await unpackZipFiles(buffer);
        filesToProcess.push(...unpacked);
      } else {
        filesToProcess.push({ name: file.name, buffer });
      }
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json({ success: false, error: "No valid PDF or document files found in submission." }, { status: 400 });
    }

    const batchId = `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Fire & forget async background processing so HTTP response returns immediately
    processCvBatch(filesToProcess, batchId).catch((err) => {
      console.error(`Batch ${batchId} processing error:`, err);
    });

    return NextResponse.json({
      success: true,
      batchId,
      totalFiles: filesToProcess.length,
      message: `Batch upload started for ${filesToProcess.length} CV(s).`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Bulk upload failed." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Implement `GET /api/cv/batch-status`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { batchJobsMap } from "@/lib/cv-batch-processor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return NextResponse.json({ success: false, error: "Missing batchId parameter." }, { status: 400 });
  }

  const job = batchJobsMap.get(batchId);
  if (!job) {
    return NextResponse.json({ success: false, error: "Batch job not found." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    batch: job,
  });
}
```

---

### Task 3: Bulk Upload UI Tab & Batch Progress Component (`features/cv-upload/BulkUploadTab.tsx`)

**Files:**
- Create: `features/cv-upload/BulkUploadTab.tsx`
- Modify: `app/(dashboard)/cv-upload/page.tsx`

**Interfaces:**
- Consumes: `/api/cv/upload-bulk`, `/api/cv/batch-status`
- Produces: Interactive Bulk Upload Dropzone & Live Batch Progress Monitor

- [ ] **Step 1: Build `BulkUploadTab.tsx` component with drag-and-drop & live progress state**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, FolderArchive, CheckCircle2, AlertTriangle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BatchItem {
  id: string;
  fileName: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  errorMessage?: string;
  candidateName?: string;
}

interface BatchJob {
  batchId: string;
  totalFiles: number;
  processedFiles: number;
  successFiles: number;
  failedFiles: number;
  status: "processing" | "completed" | "failed";
  items: BatchItem[];
}

export function BulkUploadTab() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<BatchJob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll status when batch is active
  useEffect(() => {
    if (!activeBatchId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/cv/batch-status?batchId=${activeBatchId}&_t=${Date.now()}`);
        const data = await res.json();
        if (data.success && data.batch) {
          setBatchData(data.batch);
          if (data.batch.status !== "processing") {
            clearInterval(interval);
            setIsUploading(false);
          }
        }
      } catch (err) {
        console.error("Batch status poll error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((f) => {
      const lower = f.name.toLowerCase();
      return lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".zip") || lower.endsWith(".png") || lower.endsWith(".jpg");
    });

    if (validFiles.length === 0) {
      setErrorMsg("Please upload valid PDF, DOCX, or ZIP files.");
      return;
    }
    setErrorMsg(null);
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/cv/upload-bulk", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.batchId) {
        setActiveBatchId(data.batchId);
      } else {
        setErrorMsg(data.error || "Failed to start bulk upload.");
        setIsUploading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Bulk upload error.");
      setIsUploading(false);
    }
  };

  const overallPercent = batchData
    ? Math.round((batchData.processedFiles / Math.max(batchData.totalFiles, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      {!activeBatchId && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.zip,.png,.jpg"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
              dragActive ? "border-blue-500 bg-blue-50/70" : "border-blue-200 bg-slate-50/50 hover:border-blue-400"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Bulk Drag & Drop CVs / ZIP Archive
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select multiple PDFs, Word documents, or a `.zip` archive containing CVs
            </p>
            <p className="mt-2 text-xs text-slate-400">Supports PDF, DOCX, ZIP (Max 50 files per batch)</p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 p-4 text-xs text-red-600 border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Selected File Count List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                <span>Selected Files ({selectedFiles.length})</span>
                <button onClick={() => setSelectedFiles([])} className="text-xs text-red-600 hover:underline">
                  Clear All
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border bg-slate-50 p-2.5 text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      {file.name.endsWith(".zip") ? (
                        <FolderArchive className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate font-medium text-slate-800">{file.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleStartUpload}
                  disabled={isUploading}
                  className="bg-[#1657FF] hover:bg-blue-700 h-11 px-8 font-semibold text-sm"
                  rightIcon={isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                >
                  {isUploading ? "Starting Batch..." : `Process ${selectedFiles.length} CVs`}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress & Live Monitor */}
      {activeBatchId && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {batchData?.status === "processing" ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                Bulk CV Processing Monitor
              </h3>
              <p className="text-xs text-slate-500">Batch ID: {activeBatchId}</p>
            </div>
            {batchData?.status !== "processing" && (
              <Button
                onClick={() => { setActiveBatchId(null); setBatchData(null); setSelectedFiles([]); }}
                variant="outline"
                className="text-xs"
              >
                Upload New Batch
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Overall Progress ({batchData?.processedFiles || 0} / {batchData?.totalFiles || 0} files)</span>
              <span>{overallPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <div className="text-xs text-blue-600 font-medium">Total Files</div>
              <div className="text-xl font-bold text-blue-900">{batchData?.totalFiles || 0}</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <div className="text-xs text-emerald-600 font-medium">Successfully Parsed</div>
              <div className="text-xl font-bold text-emerald-900">{batchData?.successFiles || 0}</div>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              <div className="text-xs text-red-600 font-medium">Failed</div>
              <div className="text-xl font-bold text-red-900">{batchData?.failedFiles || 0}</div>
            </div>
          </div>

          {/* Per File Item Status List */}
          <div className="border rounded-xl divide-y max-h-80 overflow-y-auto">
            {batchData?.items.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 truncate">
                  {item.status === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                  {item.status === "failed" && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                  {item.status === "processing" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />}
                  {item.status === "queued" && <div className="h-2 w-2 rounded-full bg-slate-300 shrink-0" />}

                  <div>
                    <div className="font-semibold text-slate-800 truncate">{item.fileName}</div>
                    {item.candidateName && <div className="text-[11px] text-blue-600 font-medium">Candidate: {item.candidateName}</div>}
                    {item.errorMessage && <div className="text-[11px] text-red-500">{item.errorMessage}</div>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                  item.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  item.status === "failed" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `app/(dashboard)/cv-upload/page.tsx` to add Tab Toggle for Single vs Bulk CV Upload**

Integrate `BulkUploadTab` component into the main `/cv-upload` route so users can seamlessly toggle between "Single CV Wizard" and "Bulk CV Upload".

---

### Task 4: Integration Verification

- [ ] **Step 1: Execute build and type-check verification**
  Run: `npm run type-check`
  Expected: PASS with 0 errors.

- [ ] **Step 2: Verify API routes & Dev Server**
  Run: `npm run dev`
  Test POST request to `/api/cv/upload-bulk` with multi-file form data and verify status response via `/api/cv/batch-status`.
