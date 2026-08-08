import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { extractCvWithAI } from "@/lib/ai-provider";
import { extractAndSaveProfilePhoto } from "@/lib/cv-photo-extractor";
import { findOrCreateEmployeeProfile } from "@/lib/employee-deduplication";
import { parseCvTextToStructure, normalizeKerningText } from "@/lib/cv-batch-processor";
import { validateExtraction } from "@/lib/extraction-validator";
import { saveProfileToDb } from "@/lib/db-schema";
import fs from "fs";
import path from "path";
import PDFParser from "pdf2json";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: (url: any, init: any = {}) => fetch(url, { ...init, cache: "no-store" }) },
});

function extractTextWithPdf2Json(buffer: Buffer): Promise<string> {
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

        if (!fullText.trim()) {
          const rawText = pdfParser.getRawTextContent() || "";
          try {
            fullText = decodeURIComponent(rawText);
          } catch {
            fullText = rawText;
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
      } catch (e) {
        resolve("");
      }
    });
    pdfParser.parseBuffer(buffer);
  });
}

function cleanCandidateName(rawName: string, text: string, fileName: string): string {
  if (rawName && rawName.trim().length > 0 && !rawName.includes("Languages:") && !rawName.includes("Nationality:")) {
    return rawName.trim();
  }

  // Scan text lines for a person's name
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("%PDF"));

  const excluded = [
    "curriculum", "resume", "page", "education", "email", "tel", "phone",
    "languages", "nationality", "interests", "achievements", "work experience",
    "additional information", "degree", "university"
  ];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isExcluded = excluded.some((term) => lower.includes(term));
    if (!isExcluded && line.length >= 2 && line.length <= 40 && /^[a-zA-Z\s.-]+$/.test(line)) {
      return line;
    }
  }

  // Fallback to formatted filename
  return fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No PDF file selected." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "Invalid file type. Only PDF documents are allowed." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ success: false, error: "Uploaded PDF file is empty." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify PDF Magic Header (%PDF)
    const headerStr = buffer.toString("utf-8", 0, 5);
    if (!headerStr.startsWith("%PDF")) {
      return NextResponse.json({ success: false, error: "Corrupted or invalid PDF header detected." }, { status: 400 });
    }

    const uniqueId = `cv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storedFileName = `${uniqueId}_${sanitizeFileName}`;

    // Create Base64 Data URI for Vercel Read-Only Serverless compatibility
    const base64Data = buffer.toString("base64");
    let originalPdfUrl = `data:application/pdf;base64,${base64Data}`;

    // Attempt writing to local filesystem if writeable (local dev environment)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, storedFileName);
      fs.writeFileSync(filePath, buffer);
      originalPdfUrl = `/uploads/cvs/${storedFileName}`;
    } catch (fsErr: any) {
      console.log("Vercel Serverless read-only filesystem detected, using Data URI for PDF storage/preview.");
    }

    let candidateName = "";
    let extractedText = "";
    let structuredData: any = null;

    // 1. Ultra-Fast High-Speed Local PDF Text Extraction (~300ms)
    try {
      extractedText = await extractTextWithPdf2Json(buffer);
    } catch (pdfErr) {
      console.warn("pdf2json extraction warning:", pdfErr);
    }

    // 2. Universal AI Extraction (TokenRouter, OpenAI, DeepSeek, Groq, Claude, Ollama, or Gemini)
    try {
      const mimeType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");
      const aiJSON = await extractCvWithAI(base64Data, mimeType, extractedText);
      if (aiJSON) {
        candidateName = aiJSON.candidateName || "";
        if (aiJSON.extractedText && aiJSON.extractedText.trim().length > 0) {
          extractedText = aiJSON.extractedText.trim();
        }
        structuredData = aiJSON;
      }
    } catch (aiError: any) {
      console.warn("AI extraction notice:", aiError.message || aiError);
    }

    // Quality Validation
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Unreadable PDF file. Could not extract text." }, { status: 422 });
    }

    // Local heuristic fallback when no AI provider produced structured data
    if (!structuredData) {
      structuredData = parseCvTextToStructure(extractedText, file.name);
      candidateName = candidateName || structuredData.candidateName || "";
    }

    // Clean and validate Candidate Name
    candidateName = normalizeKerningText(cleanCandidateName(candidateName, extractedText, file.name));

    // Photo Extraction Pipeline
    let avatarUrl: string | undefined = undefined;
    try {
      avatarUrl = await extractAndSaveProfilePhoto(buffer, file.type || "application/pdf", file.name, uniqueId);
    } catch (photoErr) {
      console.warn("Photo extraction notice:", photoErr);
    }

    // Candidate Deduplication & Profile Upsert
    let upsertResult;
    try {
      upsertResult = await findOrCreateEmployeeProfile(structuredData || { personal: { fullName: candidateName } }, {
        id: uniqueId,
        candidateName,
        extractedText,
        structuredData,
        originalFileName: file.name,
        originalPdfUrl,
        avatarUrl,
      });
    } catch (dedupErr) {
      console.warn("Deduplication notice:", dedupErr);
    }

    const employeeProfile = upsertResult?.profile;

    // Gate junk extractions: flag for manual review instead of saving silently.
    let extractionOk = true;
    if (employeeProfile) {
      const validation = validateExtraction(structuredData || { candidateName }, file.name);
      extractionOk = validation.ok;
      if (!validation.ok) {
        console.warn(`Extraction flagged for review (${file.name}):`, validation.reasons.join("; "));
        employeeProfile.status = "review_required";
        employeeProfile.employmentDetails.currentStatus = "review_required";
        await saveProfileToDb(employeeProfile);
      }
    }

    // The cv_records table has no id/avatar columns, so stable identifiers and
    // the avatar reference are persisted inside the structured_data JSON.
    const enrichedStructuredData = {
      ...(structuredData || {}),
      employeeId: employeeProfile?.employeeId,
      applicantId: employeeProfile?.applicantId,
      cvNumber: employeeProfile?.cvNumber,
      avatarUrl: avatarUrl || employeeProfile?.avatarUrl,
    };

    const record = {
      id: uniqueId,
      candidate_name: candidateName,
      extracted_text: extractedText,
      structured_data: JSON.stringify(enrichedStructuredData),
      original_file_name: file.name,
      original_pdf_url: originalPdfUrl,
      created_at: new Date().toISOString(),
    };

    // Save raw CV record to Supabase (`public.cv_records`)
    const { error: dbError } = await supabase.from("cv_records").insert(record);
    if (dbError) {
      console.warn("Supabase cv_records insert warning:", dbError.message);
    }

    console.log(`CV Upload & Extraction completed in ${Date.now() - startTime}ms. Employee Profile ID: ${employeeProfile?.id}`);

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        employeeId: employeeProfile?.employeeId,
        applicantId: employeeProfile?.applicantId,
        cvNumber: employeeProfile?.cvNumber,
        candidateName: record.candidate_name,
        extractedText: record.extracted_text,
        structuredData: structuredData,
        originalFileName: record.original_file_name,
        originalPdfUrl: record.original_pdf_url,
        avatarUrl: avatarUrl || employeeProfile?.avatarUrl,
        employeeProfile: employeeProfile,
        needsReview: !extractionOk,
        uploadedAt: record.created_at,
      },
    });
  } catch (err: any) {
    console.error("CV Upload Handler error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to process PDF upload." }, { status: 500 });
  }
}
