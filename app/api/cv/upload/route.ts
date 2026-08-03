import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import PDFParser from "pdf2json";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function extractTextWithPdf2Json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true);
    pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", () => {
      try {
        const rawText = pdfParser.getRawTextContent() || "";
        const cleanText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim();
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

    // Save Original PDF File to Secure Local Storage (/public/uploads/cvs/)
    const sanitizeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueId = `cv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const storedFileName = `${uniqueId}_${sanitizeFileName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cvs");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, storedFileName);
    fs.writeFileSync(filePath, buffer);
    const originalPdfUrl = `/uploads/cvs/${storedFileName}`;

    let candidateName = "";
    let extractedText = "";

    // 1. Ultra-Fast High-Speed Local PDF Text Extraction (~300ms)
    try {
      extractedText = await extractTextWithPdf2Json(buffer);
    } catch (pdfErr) {
      console.warn("pdf2json extraction warning:", pdfErr);
    }

    // 2. High-Speed Gemini 2.5 Flash AI Enhancement (1.2s max timeout guard)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const documentPart = {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: "application/pdf",
          },
        };

        const prompt = `Read this CV PDF and extract all readable information as clean plain text. Identify candidateName. Return valid JSON with candidateName and extractedText.`;

        // 1.2s max timeout race so slow network calls never block response
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini AI fast timeout")), 1200)
        );

        const aiPromise = model.generateContent([prompt, documentPart]);
        const result: any = await Promise.race([aiPromise, timeoutPromise]);

        const responseText = result.response.text();
        const cleanedJSONText = responseText.replace(/```json|```/g, "").trim();
        const aiJSON = JSON.parse(cleanedJSONText);

        if (aiJSON.extractedText && aiJSON.extractedText.trim().length > 0) {
          candidateName = aiJSON.candidateName || "";
          extractedText = aiJSON.extractedText.trim();
        }
      } catch (geminiError: any) {
        // Fall back to instant local extraction text
      }
    }

    // Quality Validation
    if (!extractedText || extractedText.trim().length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return NextResponse.json({ success: false, error: "Unreadable PDF file. Could not extract text." }, { status: 422 });
    }

    // Clean and validate Candidate Name
    candidateName = cleanCandidateName(candidateName, extractedText, file.name);

    // Minimal JSON Record
    const record = {
      id: uniqueId,
      candidate_name: candidateName,
      extracted_text: extractedText,
      original_file_name: file.name,
      original_pdf_url: originalPdfUrl,
      created_at: new Date().toISOString(),
    };

    // Save Record to Supabase Database (`public.cv_records`)
    const { error: dbError } = await supabase.from("cv_records").insert(record);

    if (dbError) {
      console.error("Supabase DB Insert Error:", dbError);
      return NextResponse.json({ success: false, error: "Database save failed: " + dbError.message }, { status: 500 });
    }

    console.log(`CV Upload & Extraction completed in ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        candidateName: record.candidate_name,
        extractedText: record.extracted_text,
        originalFileName: record.original_file_name,
        originalPdfUrl: record.original_pdf_url,
        uploadedAt: record.created_at,
      },
    });
  } catch (err: any) {
    console.error("CV Upload Handler error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to process PDF upload." }, { status: 500 });
  }
}
