import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
const { PDFParse } = require("pdf-parse");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
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

    // 1. Send PDF to Gemini API Server-Side
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.startsWith("AIzaSy")) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const documentPart = {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: "application/pdf",
          },
        };

        const prompt = `Read this CV PDF and extract all readable information as clean plain text. Preserve the document's meaningful section order and content. Do not summarize, rewrite, infer, improve, or invent anything. Remove only obvious extraction noise such as duplicated lines, isolated page numbers, and meaningless characters. Also identify the candidate's name. Return only valid JSON with two fields: candidateName and extractedText. Do not include markdown, explanations, comments, confidence scores, or any information not present in the PDF.`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API request timed out")), 7000)
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
        console.warn("Gemini API fallback notice:", geminiError.message || geminiError);
      }
    }

    // 2. Direct PDF Stream Extraction Fallback
    if (!extractedText) {
      try {
        const uint8Array = new Uint8Array(buffer);
        const parser = new PDFParse(uint8Array);
        const pdfData = await parser.getText();
        const rawText = pdfData.text || "";
        const cleanText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim();
        extractedText = cleanText;
      } catch (pdfErr) {
        console.error("PDF stream parser error:", pdfErr);
      }
    }

    // Quality Validation
    if (!extractedText || extractedText.trim().length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return NextResponse.json({ success: false, error: "Unreadable PDF file. Could not extract text." }, { status: 422 });
    }

    // Extract Candidate Name from lines if Gemini did not provide it
    if (!candidateName || candidateName === "Actual candidate name") {
      const lines = extractedText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      for (const line of lines.slice(0, 5)) {
        if (!line.toLowerCase().includes("curriculum") && !line.toLowerCase().includes("resume") && !line.toLowerCase().includes("page")) {
          candidateName = line;
          break;
        }
      }
      if (!candidateName) {
        candidateName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      }
    }

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
