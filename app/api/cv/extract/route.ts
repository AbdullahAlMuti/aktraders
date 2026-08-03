import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const { PDFParse } = require("pdf-parse");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB < 1 ? `${(file.size / 1024).toFixed(1)} KB` : `${sizeInMB.toFixed(1)} MB`;
    const mimeType = file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/png");

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. High-Precision Multimodal OCR Extraction via Gemini 1.5 Flash AI
    if (apiKey && apiKey.startsWith("AIzaSy")) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const documentPart = {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: mimeType,
          },
        };

        const prompt = `You are a high-precision document OCR and HR extractor for AK Traders. Inspect the attached document (PDF, PNG, or JPG) and extract ALL text into a clean JSON object with exact fields:
- fullName: string
- email: string
- phone: string
- designation: string
- department: string
- education: array of objects with period, degree, institution
- workExperience: array of objects with period, company, role
- additionalInfo: object with any skills, languages, achievements

RULES:
1. Extract exact names, emails, phones, education, work experience, companies, dates EXACTLY as written.
2. DO NOT invent or guess text. If a field is missing, use null or empty array.
3. Preserve exact spelling.

RETURN ONLY VALID RAW JSON. DO NOT INCLUDE MARKDOWN BACKTICKS OR COMMENTS.`;

        // Fast 6-second timeout race so users never wait indefinitely
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout")), 6000)
        );

        const aiPromise = model.generateContent([prompt, documentPart]);
        const result: any = await Promise.race([aiPromise, timeoutPromise]);

        const responseText = result.response.text();
        const cleanedJSONText = responseText.replace(/```json|```/g, "").trim();
        const aiJSON = JSON.parse(cleanedJSONText);

        return NextResponse.json({
          success: true,
          provider: "Gemini 1.5 Flash AI",
          data: {
            ...aiJSON,
            cvFileName: file.name,
            cvFileSize: formattedSize,
            extractedAt: new Date().toISOString(),
          },
        });
      } catch (geminiError: any) {
        console.warn("Gemini Vision AI notice:", geminiError.message || geminiError);
      }
    }

    // 2. Direct High-Precision PDF Text Stream Extraction
    let extractedText = "";
    if (mimeType === "application/pdf") {
      try {
        const uint8Array = new Uint8Array(buffer);
        const parser = new PDFParse(uint8Array);
        const pdfData = await parser.getText();
        extractedText = pdfData.text || "";
      } catch (pdfError) {
        console.warn("PDFParse notice:", pdfError);
      }
    }

    // Filter out non-printable binary characters to prevent garbage output
    const cleanPrintableText = extractedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ").trim();

    const lines = cleanPrintableText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("%PDF-"));

    const parsedData = parseCVTextExact(extractedText, lines, file.name);

    const jsonOutput = {
      fullName: parsedData.fullName,
      email: parsedData.email,
      phone: parsedData.phone,
      designation: parsedData.designation,
      department: parsedData.department,
      education: parsedData.education,
      workExperience: parsedData.workExperience,
      additionalInfo: parsedData.additionalInfo,
      extractedDocumentLines: lines,
      cvFileName: file.name,
      cvFileSize: formattedSize,
      extractedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      provider: "PDF Stream Reader",
      data: jsonOutput,
    });
  } catch (error: any) {
    console.error("CV Extraction error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process file" }, { status: 500 });
  }
}

function parseCVTextExact(fullText: string, lines: string[], fileName: string) {
  let fullName = "";
  for (const line of lines.slice(0, 5)) {
    if (
      !line.toLowerCase().includes("curriculum") &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("education") &&
      !line.toLowerCase().includes("email")
    ) {
      fullName = line;
      break;
    }
  }
  if (!fullName) {
    fullName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const emailMatch = fullText.match(emailRegex);
  const emailLine = lines.find((l) => l.toLowerCase().includes("email") || l.toLowerCase().includes("e-mail"));
  const email = emailMatch ? emailMatch[0] : (emailLine ? emailLine.replace(/e-mail:?/i, "").trim() : "Not Specified");

  const phoneRegex = /(?:\+8801|01|\+44|0)[3-9]\d{8,10}/;
  const phoneMatch = fullText.match(phoneRegex);
  const phoneLine = lines.find((l) => l.toLowerCase().includes("tel:") || l.toLowerCase().includes("phone") || l.toLowerCase().includes("mobile"));
  const phone = phoneMatch ? phoneMatch[0] : (phoneLine ? phoneLine.slice(phoneLine.toLowerCase().indexOf("tel")).trim() : "Not Specified");

  const educationEntries: Array<{ period?: string; details?: string }> = [];
  lines.forEach((line, idx) => {
    if (line.match(/\b\d{4}\s*[-–\s]+\s*\d{4}\b/)) {
      educationEntries.push({
        period: line.match(/\b\d{4}\s*[-–\s]+\s*\d{4}\b/)?.[0],
        details: lines[idx + 1] || line,
      });
    }
  });

  const workExperience: Array<{ period?: string; company?: string; role?: string }> = [];
  lines.forEach((line, idx) => {
    const periodMatch = line.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-–\s\d]+/i);
    if (periodMatch) {
      workExperience.push({
        period: periodMatch[0].trim(),
        company: line.replace(periodMatch[0], "").trim() || lines[idx + 1] || "Company",
        role: lines[idx + 1] || lines[idx + 2] || "Role",
      });
    }
  });

  const additionalInfo: Record<string, string> = {};
  lines.forEach((line) => {
    if (line.toLowerCase().includes("interests:")) additionalInfo["interests"] = line.replace(/interests:/i, "").trim();
    if (line.toLowerCase().includes("achievements:")) additionalInfo["achievements"] = line.replace(/achievements:/i, "").trim();
    if (line.toLowerCase().includes("nationality:")) additionalInfo["nationality"] = line.replace(/nationality:/i, "").trim();
    if (line.toLowerCase().includes("languages:")) additionalInfo["languages"] = line.replace(/languages:/i, "").trim();
  });

  return {
    fullName,
    email,
    phone,
    designation: workExperience[0]?.role || lines[1] || "Executive",
    department: detectDepartment(fullText.toLowerCase()),
    education: educationEntries,
    workExperience,
    additionalInfo,
  };
}

function detectDepartment(lowerText: string): string {
  if (lowerText.includes("sales") || lowerText.includes("marketing")) return "Sales";
  if (lowerText.includes("operation") || lowerText.includes("supply")) return "Operations";
  if (lowerText.includes("hr") || lowerText.includes("human resource")) return "HR";
  if (lowerText.includes("finance") || lowerText.includes("account") || lowerText.includes("financing")) return "Finance";
  if (lowerText.includes("it") || lowerText.includes("software") || lowerText.includes("tech") || lowerText.includes("digital")) return "IT";
  return "Operations";
}
