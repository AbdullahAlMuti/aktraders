/**
 * Validates an AI CV extraction before it is persisted. A failing result means
 * the profile should be saved with status "review_required" instead of "active",
 * so junk extractions are flagged to the user rather than silently stored.
 */
export interface ExtractionValidation {
  ok: boolean;
  reasons: string[];
}

const SECTION_HEADINGS = [
  "contact",
  "address",
  "phone",
  "email",
  "web",
  "website",
  "profile",
  "education",
  "experience",
  "work experience",
  "skills",
  "languages",
  "resume",
  "curriculum",
  "curriculum vitae",
  "cv",
  "about me",
  "summary",
  "objective",
  "references",
  "certifications",
  "projects",
  "achievements",
  "personal information",
];

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

export function validateExtraction(structured: any, fileName: string): ExtractionValidation {
  const reasons: string[] = [];
  const p = structured?.personal || structured?.personalInformation || {};
  const name = String(structured?.candidateName || p.fullName || "").trim();

  // --- Name checks ---
  if (!name) {
    reasons.push("no candidate name extracted");
  } else {
    if (name.length < 2 || name.length > 60) reasons.push("name length implausible");
    if (!/[a-zA-Z]/.test(name)) reasons.push("name contains no letters");
    if (/^(?:[A-Za-z] )+[A-Za-z]\.?$/.test(name)) reasons.push("name is kerned single letters");
    if (SECTION_HEADINGS.includes(normalize(name))) reasons.push("name is a section heading");

    const fileBase = normalize(fileName.replace(/\.[^.]+$/, ""));
    if (fileBase && normalize(name) === fileBase) reasons.push("name derived from filename");
    if (/\b(resume|cv|curriculum|template|professional|modern|simple|minimalist)\b/i.test(name)) {
      reasons.push("name looks like a document title");
    }
  }

  // --- Substance check: at least one real data point beyond the name ---
  const email = String(p.email || "").trim();
  const phoneDigits = (String(p.mobile || p.phone || "").match(/\d/g) || []).length;
  const eduCount = Array.isArray(structured?.education) ? structured.education.length : 0;
  const expCount = Array.isArray(structured?.experience) ? structured.experience.length : 0;
  const hasSubstance = /@/.test(email) || phoneDigits >= 7 || eduCount > 0 || expCount > 0;
  if (!hasSubstance) reasons.push("no contact, education, or experience extracted");

  return { ok: reasons.length === 0, reasons };
}
