import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFParser from "pdf2json";

export const dynamic = "force-dynamic";

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

    // 1. High-Precision Vision AI Extraction via Gemini 1.5 Flash
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const documentPart = {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: mimeType,
          },
        };

        const prompt = `Read this CV PDF document and extract all text content exactly in the layout and formatting structure as it appears in the PDF document. Preserve all section headers, line breaks, paragraph spacing, bullet points, work experience timelines, and education formatting intact. Return ONLY a valid JSON object with candidate info and formatted text fields.`;

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout")), 10000)
        );

        const aiPromise = model.generateContent([prompt, documentPart]);
        const result: any = await Promise.race([aiPromise, timeoutPromise]);

        const responseText = result.response.text();
        const cleanedJSONText = responseText.replace(/```json|```/g, "").trim();
        const aiJSON = JSON.parse(cleanedJSONText);

        return NextResponse.json({
          success: true,
          provider: "Gemini 2.5 Flash AI",
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

    // 2. Direct High-Precision Local PDF Text Stream Extraction
    let extractedText = "";
    if (mimeType === "application/pdf") {
      try {
        extractedText = await extractTextWithPdf2Json(buffer);
      } catch (pdfError) {
        console.warn("pdf2json notice:", pdfError);
      }
    }

    const lines = extractedText
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

  return {
    fullName,
    email,
    phone,
    designation: "Applicant",
    department: "Candidate",
    education: [],
    workExperience: [],
    additionalInfo: {},
  };
}
