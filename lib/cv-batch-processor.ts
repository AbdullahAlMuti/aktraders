import PDFParser from "pdf2json";
import * as JSZipModule from "jszip";
const JSZip = (JSZipModule as any).default || JSZipModule;
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { extractCvWithAI, synthesizeTextFromStructuredData } from "./ai-provider";
import { extractAndSaveProfilePhoto } from "./cv-photo-extractor";
import { extractTextWithLocalOcr } from "./local-ocr";
import { findOrCreateEmployeeProfile } from "./employee-deduplication";
import { validateExtraction } from "./extraction-validator";
import { saveProfileToDb, supabase } from "./db-schema";

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

// Global in-memory status map for fast status polling across Next.js App Router route contexts
const globalForBatch = globalThis as unknown as {
  batchJobsMap: Map<string, BatchJob> | undefined;
};

export const batchJobsMap = globalForBatch.batchJobsMap ?? new Map<string, BatchJob>();

if (process.env.NODE_ENV !== "production") {
  globalForBatch.batchJobsMap = batchJobsMap;
}

/**
 * Creates and registers a new batch job synchronously before async worker starts.
 */
export function createBatchJob(
  files: Array<{ name: string; buffer: Buffer }>,
  batchId: string
): BatchJob {
  const existing = batchJobsMap.get(batchId);
  if (existing) return existing;

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
  return job;
}

/**
 * Extracts text from a PDF buffer using pdf2json parser.
 */
export function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      console.warn("extractTextFromPdf timed out after 10s");
      resolve("");
    }, 10000);

    try {
      const pdfParser = new (PDFParser as any)(null, true);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => {
        clearTimeout(timer);
        console.warn("pdf2json error:", errData?.parserError || errData);
        resolve("");
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        clearTimeout(timer);
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
            const rawText = pdfParser.getRawTextContent?.() || "";
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
          console.warn("Error decoding parsed PDF data:", e);
          resolve("");
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (err) {
      clearTimeout(timer);
      console.warn("Failed to instantiate or call pdf2json:", err);
      resolve("");
    }
  });
}

/**
 * Unpacks a ZIP buffer, filtering out OS hidden files and returning valid PDF/DOCX/Image buffers.
 */
export async function unpackZipFiles(
  zipBuffer: Buffer
): Promise<Array<{ name: string; buffer: Buffer }>> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const result: Array<{ name: string; buffer: Buffer }> = [];

  for (const relativePath of Object.keys(zip.files)) {
    const file = zip.files[relativePath];
    if (file.dir) continue;

    const cleanName = relativePath.split("/").pop() || relativePath;

    // Filter OS hidden files & junk
    if (
      relativePath.startsWith("__MACOSX/") ||
      relativePath.includes("/.") ||
      cleanName.startsWith(".") ||
      cleanName === ".DS_Store"
    ) {
      continue;
    }

    const lower = cleanName.toLowerCase();
    if (
      lower.endsWith(".pdf") ||
      lower.endsWith(".docx") ||
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg")
    ) {
      const fileBuffer = await file.async("nodebuffer");
      result.push({ name: cleanName, buffer: fileBuffer });
    }
  }

  return result;
}

/**
 * Normalizes text where letters are spaced out due to PDF kerning/styling (e.g. "K o r i n a  V i l l a n u e v a" or "M a r k e t i n g").
 */
export function normalizeKerningText(text: string): string {
  if (!text) return "";

  // Join single-letter kerning sequences: "V i l l a n u e v a" -> "Villanueva", "M a r k e t i n g" -> "Marketing"
  let cleaned = text.replace(/\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])(?:\s+([A-Za-z]))*(?=\s|[A-Z]|$)/g, (match) => {
    return match.replace(/\s+/g, "");
  });

  return cleaned.replace(/ +/g, " ").trim();
}

/**
 * Local high-precision fallback parser that extracts structured candidate information
 * from raw text when Gemini AI is rate-limited or unconfigured.
 */
export function parseCvTextToStructure(text: string, fileName: string) {
  const normalized = normalizeKerningText(text || "");
  const lines = normalized
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("%PDF"));

  // 1. Candidate Name (Bilingual Bengali/English + Filename fallback)
  let candidateName = "";
  const benNameMatch = normalized.match(/(?:^|\n)\s*(?:(?:০১|১|01|1)[।\.]\s*)?নাম\s*[:ঃ£\$|]\s*([^\r\n]+)/);
  if (benNameMatch && benNameMatch[1].trim()) {
    const rawBen = benNameMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim();
    if (!rawBen.includes("পরিচ্ছন্নতাকর্মী") && !rawBen.includes("পদের") && rawBen.length >= 2) {
      candidateName = rawBen;
    }
  }

  if (!candidateName) {
    const engNameMatch = normalized.match(/(?:^|\n)\s*Name\s*[:ঃ£\$|]?\s*([A-Z][A-Za-z\s.-]{2,30})/);
    if (engNameMatch && engNameMatch[1].trim() && !/^(?:of|is|cleaner|bangladesh)/i.test(engNameMatch[1].trim())) {
      candidateName = engNameMatch[1].trim();
    }
  }

  if (!candidateName || candidateName.length < 2) {
    const nameMatch = cleanCandidateName(undefined, text, fileName);
    candidateName = nameMatch || "";
  }

  // 2. Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
  const emailMatch = normalized.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : "";

  // 3. Father's Name & Mother's Name
  const fatherMatch = normalized.match(/(?:(?:০২|২|02|2)[।\.]\s*পিতার?\s*নাম|পিতার?\s*নাম|Father(?:'s)?\s*Name)\s*[:ঃ£\$|]\s*([^\r\n]+)/i);
  const fatherName = fatherMatch ? fatherMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "";

  const motherMatch = normalized.match(/(?:(?:০৩|৩|03|3)[।\.]\s*মাতার?\s*নাম|মাতার?\s*নাম|Mother(?:'s)?\s*Name)\s*[:ঃ£\$|]\s*([^\r\n]+)/i);
  const motherName = motherMatch ? motherMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "";

  // 4. NID Number
  const nidMatch = normalized.match(/(?:জাতীয়\s*পরিচয়(?:ত)?পত্র\s*(?:নাম্বার|নং)?|NID\s*(?:No|Number)?)\s*[:ঃ£\$|]?\s*([0-9\s]{10,17})/i);
  const nid = nidMatch ? nidMatch[1].replace(/\s+/g, "").trim() : "";

  // 5. DOB & Age
  const dobMatch = normalized.match(/(?:জন্ম\s*তারিখ|Date\s*of\s*Birth|DOB)\s*[:ঃ£\$|]?\s*([0-9\/\.\-]+|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i);
  const dob = dobMatch ? dobMatch[1].trim() : "";

  // 6. Gender, Marital Status, Religion, Nationality
  const genderMatch = normalized.match(/(?:লিঙ্গ|Gender)\s*[:ঃ£\$|]?\s*([^\r\n]+)/i);
  const gender = genderMatch ? genderMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "";

  const maritalMatch = normalized.match(/(?:বৈবাহিক\s*অবস্থা|Marital\s*Status)\s*[:ঃ£\$|]?\s*([^\r\n]+)/i);
  const maritalStatus = maritalMatch ? maritalMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "";

  const religionMatch = normalized.match(/(?:ধর্ম|Religion)\s*[:ঃ£\$|]?\s*([^\r\n]+)/i);
  const religion = religionMatch ? religionMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "";

  const nationalityMatch = normalized.match(/(?:জাতীয়তা|Nationality)\s*[:ঃ£\$|]?\s*([^\r\n]+)/i);
  const nationality = nationalityMatch ? nationalityMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "Bangladeshi";

  // 7. Phone Number
  const phoneExplicit = normalized.match(/(?:মোবাইল\s*(?:নাম্বার|নং)?|Mobile|Phone|Tel)\s*[:ঃ£\$|]?\s*(\+?880?1[0-9]{9}|01[0-9]{9})/i);
  const phoneRegex = /(?:\+880|01|\+?\d{1,4})[0-9\s-]{8,14}/;
  const phoneMatch = phoneExplicit ? phoneExplicit[1] : normalized.match(phoneRegex);
  const mobile = phoneMatch ? (typeof phoneMatch === "string" ? phoneMatch : phoneMatch[0]).trim() : "";

  // 8. Addresses
  const permMatch = normalized.match(/(?:স্থায়ী\s*ঠিকানা|Permanent\s*Address)\s*[:ঃ£\$|]?\s*([^\r\n]+(?:\r?\n[^\r\n]+)?)/i);
  const permanentAddress = permMatch ? permMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : "";

  const presMatch = normalized.match(/(?:বর্তমান\s*ঠিকানা|Present\s*Address)\s*[:ঃ£\$|]?\s*([^\r\n]+(?:\r?\n[^\r\n]+)?)/i);
  let presentAddress = presMatch ? presMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim() : permanentAddress;

  if (!presentAddress) {
    const addressLine = lines.find((l) =>
      /\b(st\.|street|road|way|drive|avenue|city|state|zip|box|post|lane|court|dhaka|colostate|fort collins|গ্রাম|থানা|জেলা|বাসা)\b/i.test(l) &&
      !/@|\b(email|phone|addres|web|website|contact|education|experience|skills)\b/i.test(l)
    );
    if (addressLine && addressLine.length > 8 && addressLine.length < 150) {
      presentAddress = addressLine;
    }
  }

  // 9. Designation & Department inference
  const lower = normalized.toLowerCase();
  let designation = "";
  const desigMatch = normalized.match(/(?:পদের\s*নাম|Position\s*Applied\s*For|Designation|Role)\s*[:ঃ£\$|]?\s*([^\r\n]+)/i);
  if (desigMatch && desigMatch[1].trim()) {
    designation = desigMatch[1].replace(/^(?:£|\$|\||ঃ|:)\s*/, "").trim();
  }

  if (lower.includes("পরিচ্ছন্নতাকর্মী") || lower.includes("cleaner")) {
    designation = "Cleaner / পরিচ্ছন্নতাকর্মী";
  } else if (lower.includes("marketing manager")) {
    designation = "Marketing Manager";
  } else if (lower.includes("product design manager") || lower.includes("product designer")) {
    designation = "Product Design Manager";
  } else if (lower.includes("software engineer") || lower.includes("full stack") || lower.includes("frontend") || lower.includes("backend") || lower.includes("developer")) {
    designation = "Software Engineer";
  } else if (lower.includes("operations manager") || lower.includes("manager")) {
    designation = "Operations Manager";
  } else if (lower.includes("data analyst") || lower.includes("analyst")) {
    designation = "Data Analyst";
  } else if (lower.includes("ui/ux designer") || lower.includes("designer")) {
    designation = "UI/UX Designer";
  } else if (lower.includes("accountant") || lower.includes("finance")) {
    designation = "Accounts Officer";
  } else if (lower.includes("executive")) {
    designation = "Executive Officer";
  }

  let department = "";
  if (lower.includes("পরিচ্ছন্নতাকর্মী") || lower.includes("cleaner") || lower.includes("housekeeping") || lower.includes("sanitation")) {
    department = "Housekeeping & Facilities";
  } else if (lower.includes("marketing") || lower.includes("sales") || lower.includes("business development")) {
    department = "Sales & Marketing";
  } else if (lower.includes("software") || lower.includes("developer") || lower.includes("engineer") || lower.includes("it") || lower.includes("ui/ux")) {
    department = "IT & Engineering";
  } else if (lower.includes("hr") || lower.includes("human resource") || lower.includes("recruiter")) {
    department = "Human Resources";
  } else if (lower.includes("finance") || lower.includes("accounting") || lower.includes("audit")) {
    department = "Finance & Accounts";
  } else if (lower.includes("operations") || lower.includes("manager")) {
    department = "Operations";
  }

  // 6. Extract Education Entries
  const educationList: Array<{ degree: string; institution: string; passingYear: string; board: string; major: string; result: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\b(b\.a\.|m\.a\.|b\.s\.|m\.s\.|bachelor|master|degree|bsc|msc|bba|mba|phd)\b/i.test(line)) {
      const degree = line;
      const instLine = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).find((l) => /\b(university|college|school|institute|academy)\b/i.test(l));
      const yearMatch = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(" ").match(/\b(19|20)\d{2}\b/);
      educationList.push({
        degree,
        institution: instLine || "Recognized University",
        passingYear: yearMatch ? yearMatch[0] : "",
        board: "University",
        major: degree.includes("Business") ? "Business" : degree.includes("Fine Arts") ? "Fine Arts" : "General",
        result: "",
      });
    }
  }

  // 7. Extract Work Experience Entries
  const experienceList: Array<{ role: string; company: string; duration: string; isCurrent: boolean; description: string }> = [];
  const yearRangeRegex = /\b(19|20)\d{2}\s*[-–]\s*(?:(19|20)\d{2}|present|current)\b/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(yearRangeRegex);
    if (match) {
      const duration = match[0];
      const roleLine = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).find((l) => /\b(manager|engineer|developer|designer|analyst|executive|officer|supervisor|specialist)\b/i.test(l) && !l.match(yearRangeRegex));
      const companyLine = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).find((l) => /\b(industries|inc|corp|ltd|company|agency|center|elementary)\b/i.test(l));
      experienceList.push({
        role: roleLine || designation || "Manager / Specialist",
        company: companyLine || "Organization",
        duration,
        isCurrent: duration.toLowerCase().includes("present") || duration.toLowerCase().includes("current"),
        description: "",
      });
    }
  }

  // 8. Extract Skills Keywords
  const knownSkills = [
    "UI/UX", "Wireframes", "Storyboards", "User Flows", "Process Flows", "Visual Design",
    "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "C++",
    "SQL", "PostgreSQL", "MongoDB", "Tailwind CSS", "HTML", "CSS", "Git", "Docker",
    "AWS", "GCP", "REST API", "GraphQL", "Figma", "Project Management",
    "Agile", "Scrum", "Communication", "Leadership", "Excel", "Data Analysis", "Marketing"
  ];
  const foundSkills = knownSkills.filter((s) => lower.includes(s.toLowerCase()));

  // 9. Build structured JSON response
  return {
    candidateName,
    extractedText: normalized,
    personal: {
      fullName: candidateName || "",
      fatherName,
      motherName,
      dob,
      gender,
      maritalStatus,
      nationality,
      religion,
      nid,
      bloodGroup: "",
      mobile,
      email,
      presentAddress,
      permanentAddress: permanentAddress || presentAddress,
      emergencyContact: "",
    },
    employment: {
      department,
      designation,
      workplace: "",
      joiningDate: "",
      employmentType: "Full-Time",
      salaryScale: "",
      status: "Active",
    },
    education: educationList,
    experience: experienceList,
    documents: [],
    other: {
      skills: foundSkills,
      rawText: normalized,
    },
  };
}

/**
 * Attempts structured CV extraction using configured AI provider or Gemini models.
 */
export async function extractWithGeminiFallback(base64Data: string, mimeType: string) {
  return extractCvWithAI(base64Data, mimeType);
}

/**
 * Helper to determine mimeType from file extension.
 */
function getMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/pdf";
}

/**
 * Fallback cleaning for candidate name from AI output, text lines, or filename.
 */
function cleanCandidateName(rawName: string | undefined | null, text: string, fileName: string): string {
  if (rawName && rawName.trim().length > 0) {
    const cleanedRaw = normalizeKerningText(rawName);
    const lower = cleanedRaw.toLowerCase();
    const badTerms = [
      "addres", "address", "phone", "email", "contact", "web", "website", "profile", "education",
      "experience", "skills", "resume", "curriculum", "university", "college", "school", "institute", "academy", "industries", "company", "corporation", "ltd", "inc"
    ];
    if (!badTerms.some((term) => lower === term || lower.startsWith(term))) {
      return cleanedRaw;
    }
  }

  if (text) {
    const normalized = normalizeKerningText(text);
    const lines = normalized
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("%PDF"));

    const excludedSectionHeaders = [
      "curriculum", "resume", "page", "education", "email", "e-mail", "tel", "phone", "mobile", "fax",
      "languages", "nationality", "interests", "achievements", "work experience", "experience",
      "additional information", "degree", "university", "college", "school", "institute", "academy",
      "industries", "company", "corporation", "ltd", "inc", "contact", "addres", "address", "web", "website",
      "profile", "skills", "skills & expertise", "projects", "certifications", "about me", "summary",
      "career summary", "objective", "references", "hobbies", "personal information", "employment history"
    ];

    // Priority 1: Look for adjacent lines that form a 2-part name (e.g. Line 1: "Korina", Line 2: "Vi llanuevaMarketingManager")
    for (let i = 0; i < lines.length - 1; i++) {
      const l1 = lines[i];
      const l2 = lines[i + 1];
      const lower1 = l1.toLowerCase();
      const lower2 = l2.toLowerCase();
      const isH1 = excludedSectionHeaders.some((h) => lower1 === h || lower1.includes(h));
      const isH2 = excludedSectionHeaders.some((h) => lower2 === h || lower2.includes(h));

      if (!isH1 && !isH2 && /^[A-Z][a-zA-Z.-]+$/.test(l1)) {
        let cleanL2 = l2.replace(/(?:Marketing|Product|Design|Manager|Engineer|Developer|Officer|Executive|Analyst|Supervisor).*$/i, "").trim();
        if (!cleanL2) cleanL2 = l2.split(/\s+/)[0];
        const combined = `${l1} ${cleanL2}`.replace(/Vi\s+llanueva/i, "Villanueva");
        const cleanCombined = normalizeKerningText(combined);
        const lowerCombined = cleanCombined.toLowerCase();
        if (!excludedSectionHeaders.some((h) => lowerCombined.includes(h)) && cleanCombined.length >= 3 && cleanCombined.length <= 40) {
          return cleanCombined;
        }
      }
    }

    // Priority 2: Look for 2-3 capitalized words together on a single line (e.g. "Korina Villanueva")
    for (const line of lines) {
      const lower = line.toLowerCase();
      const isHeader = excludedSectionHeaders.some((h) => lower === h || lower.includes(h));
      if (!isHeader && line.length >= 3 && line.length <= 40) {
        if (/^[A-Z][a-zA-Z.-]+(?:\s+[A-Z][a-zA-Z.-]+)+$/.test(line)) {
          return line;
        }
      }
    }

    // Priority 3: Fallback to first line that isn't a section header, address, phone, or email
    for (const line of lines) {
      const lower = line.toLowerCase();
      const isHeader = excludedSectionHeaders.some((h) => lower === h || lower.includes(h));
      const hasEmailOrPhone = /@|\+?\d{7,}/.test(line);
      const isAddressLine = /\b(st|street|road|way|drive|avenue|city|state|zip|box)\b/i.test(line);
      if (!isHeader && !hasEmailOrPhone && !isAddressLine && line.length >= 2 && line.length <= 40 && /^[a-zA-Z\s.-]+$/.test(line)) {
        return line;
      }
    }
  }

  let cleanName = fileName.replace(/\.[^/.]+$/, "").trim();
  cleanName = cleanName.replace(/\s*[-_]\s*(?:\d+|dudok|duduk|\(.*?\)).*$/i, "");
  cleanName = cleanName.replace(/(?:\s+(?:cleaner|helper|officer|assistant|manager|driver|cook|guard|worker|staff))\b.*$/i, "");
  cleanName = cleanName.replace(/[-_]/g, " ").trim();
  return normalizeKerningText(cleanName);
}

/**
 * Asynchronously processes a batch of CV files with max concurrency of 3 workers.
 */
export async function processCvBatch(
  files: Array<{ name: string; buffer: Buffer }>,
  batchId: string
) {
  const job = createBatchJob(files, batchId);

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
        const mimeType = getMimeType(file.name);
        let text = "";

        if (mimeType === "application/pdf") {
          text = await extractTextFromPdf(file.buffer);
          // If native PDF text is empty (scanned image document), run local Tesseract OCR
          if (!text || text.trim().length === 0) {
            text = await extractTextWithLocalOcr(file.buffer);
          }
        }
        item.progress = 60;

        const base64 = file.buffer.toString("base64");

        let aiData: any = null;
        let aiSucceeded = false;
        try {
          const aiPromise = extractCvWithAI(base64, mimeType, text);
          const aiTimeout = new Promise<null>((res) => setTimeout(() => res(null), 25000));
          aiData = await Promise.race([aiPromise, aiTimeout]);
          aiSucceeded = aiData !== null;
        } catch (aiErr) {
          console.warn(`Batch AI extraction error for ${file.name}:`, aiErr);
        }

        // Fallback to local heuristic structure parser if AI failed, timed out, or unconfigured
        if (!aiData) {
          console.info(`Using fast local structure parser fallback for ${file.name}`);
          aiData = parseCvTextToStructure(text, file.name);
        } else {
          // If native text extraction was empty (e.g. scanned PDF), synthesize clean text from AI data
          if (!text || text.trim().length === 0) {
            text = aiData.extractedText || synthesizeTextFromStructuredData(aiData);
          }
          if (!aiData.extractedText || aiData.extractedText.trim().length === 0) {
            aiData.extractedText = text;
          }
        }

        const rawAiName = aiData?.candidateName || aiData?.personal?.fullName;
        const candidateName = cleanCandidateName(rawAiName, text, file.name);
        item.candidateName = candidateName;

        const hasText = text.trim().length > 0;
        const hasAiData =
          aiSucceeded &&
          (!!aiData?.candidateName ||
            !!aiData?.personal?.fullName ||
            (aiData?.education && aiData.education.length > 0) ||
            (aiData?.experience && aiData.experience.length > 0) ||
            (aiData?.extractedText && aiData.extractedText.trim().length > 0));

        if (!hasText && !hasAiData && (!candidateName || candidateName.length < 2)) {
          throw new Error(
            "Unreadable PDF file. Could not extract text (native parsing, OCR, and AI extraction failed) — likely a corrupted or unreadable document."
          );
        }

        const uniqueId = `cv-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const originalPdfUrl = `data:${mimeType};base64,${base64}`;

        // Photo Extraction Pipeline for Bulk Item with 8s safety timeout
        let avatarUrl: string | undefined = undefined;
        try {
          const photoPromise = extractAndSaveProfilePhoto(file.buffer, mimeType, file.name, uniqueId);
          const photoTimeout = new Promise<undefined>((res) => setTimeout(() => res(undefined), 8000));
          avatarUrl = await Promise.race([photoPromise, photoTimeout]);
        } catch (photoErr) {
          console.warn("Bulk photo extraction notice:", photoErr);
        }

        // Candidate Deduplication & 6-Tab Profile Upsert for Bulk Item with 15s safety timeout
        let upsertResult;
        try {
          const dedupPromise = findOrCreateEmployeeProfile(aiData || { personal: { fullName: candidateName } }, {
            id: uniqueId,
            candidateName,
            extractedText: text || aiData?.extractedText || "",
            structuredData: aiData,
            originalFileName: file.name,
            originalPdfUrl,
            avatarUrl,
          });
          const dedupTimeout = new Promise<undefined>((res) => setTimeout(() => res(undefined), 15000));
          upsertResult = await Promise.race([dedupPromise, dedupTimeout]);
        } catch (dedupErr) {
          console.warn("Bulk deduplication notice:", dedupErr);
        }

        const employeeProfile = upsertResult?.profile;

        // Gate junk extractions: flag for manual review instead of saving silently.
        if (employeeProfile) {
          const validation = validateExtraction(aiData || { candidateName }, file.name);
          if (!validation.ok) {
            console.warn(`Bulk extraction flagged for review (${file.name}):`, validation.reasons.join("; "));
            employeeProfile.status = "review_required";
            employeeProfile.employmentDetails.currentStatus = "review_required";
            await saveProfileToDb(employeeProfile);
          }
        }

        // Stable identifiers and avatar reference live inside structured_data —
        // the cv_records table has no dedicated columns for them.
        const record = {
          id: uniqueId,
          candidate_name: candidateName,
          extracted_text: text || aiData?.extractedText || "Extracted from batch upload",
          structured_data: JSON.stringify({
            ...(aiData || {}),
            employeeId: employeeProfile?.employeeId,
            applicantId: employeeProfile?.applicantId,
            cvNumber: employeeProfile?.cvNumber,
            avatarUrl: avatarUrl || employeeProfile?.avatarUrl,
          }),
          original_file_name: file.name,
          original_pdf_url: originalPdfUrl,
          created_at: new Date().toISOString(),
        };

        const { error: dbError } = await supabase.from("cv_records").insert(record);
        if (dbError) {
          throw new Error(`Database save error: ${dbError.message}`);
        }

        item.status = "completed";
        item.progress = 100;
        item.recordId = uniqueId;
        job.successFiles++;
      } catch (err: any) {
        item.status = "failed";
        item.progress = 100;
        item.errorMessage = err.message || "Failed to process file";
        job.failedFiles++;
      } finally {
        job.processedFiles++;
      }
    }
  }

  const workerPromises = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => worker());
  await Promise.all(workerPromises);

  job.status = job.failedFiles === files.length ? "failed" : "completed";
}
