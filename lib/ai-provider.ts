import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedCvData {
  candidateName: string | null;
  extractedText: string;
  personal: {
    fullName: string;
    email: string;
    mobile: string;
    presentAddress: string;
    permanentAddress: string;
    fatherName: string;
    motherName: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
    religion: string;
    nid: string;
    bloodGroup: string;
    emergencyContact: string;
  };
  employment: {
    department: string;
    designation: string;
    workplace: string;
    joiningDate: string;
    employmentType: string;
    salaryScale: string;
    status: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    passingYear: string;
    board: string;
    major: string;
    result: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    isCurrent: boolean;
    description: string;
  }>;
  documents: any[];
  other: {
    skills: string[];
    rawText: string;
  };
}

const CV_EXTRACTION_PROMPT = `Read this CV document carefully and extract candidate details.

CRITICAL ACCURACY INSTRUCTIONS FOR GRAPHIC / MULTI-COLUMN LAYOUTS:
1. Multi-Column Layout: This CV may have a left or right sidebar (Contact, Address, Phone, Email, Education, Skills) and a main body column (Candidate Name, Title, Profile, Work Experience). Process BOTH columns completely.
2. Kerning & Spaced Letters: If words use letter-spacing or kerning (e.g. "K o r i n a  V i l l a n u e v a" or "M a r k e t i n g  M a n a g e r"), automatically join spaced-out letters into proper clean words ("Korina Villanueva", "Marketing Manager").
3. Candidate Name: Extract the exact person's full name (e.g. "Korina Villanueva"). Never output section headings like "Contact", "Addres", "Phone", "Web", "Profile", "Education", "Skills" as candidate name.
4. Designation: Extract the candidate's job title or target role (e.g. "Marketing Manager").
5. Education: Extract ALL education items (Degree e.g. "B.A. in Business", Institution e.g. "Borcelle University", Passing Year e.g. "2008").
6. Work Experience: Extract ALL work experience items (Role e.g. "Marketing Manager", Company e.g. "Arowwai Industries", Date range e.g. "2016 - 2020", Description).
7. Skills: Extract ALL listed skills (e.g. "UI/UX", "Wireframes", "Storyboards", "User Flows", "Process Flows", "Visual Design").
8. Contact: Extract phone number, email address, physical address, and website accurately.

Return ONLY a valid JSON object matching this schema:
{
  "candidateName": "Full Name",
  "extractedText": "Complete plain text of the CV preserving line breaks and sections",
  "personal": {
    "fullName": "Full Name",
    "email": "Email address",
    "mobile": "Phone number",
    "presentAddress": "Address",
    "permanentAddress": "Address or ''",
    "fatherName": "",
    "motherName": "",
    "dob": "",
    "gender": "",
    "maritalStatus": "",
    "nationality": "",
    "religion": "",
    "nid": "",
    "bloodGroup": "",
    "emergencyContact": ""
  },
  "employment": {
    "department": "Department e.g. Sales & Marketing, IT & Engineering",
    "designation": "Designation / Job Title e.g. Marketing Manager",
    "workplace": "Company / Location",
    "joiningDate": "",
    "employmentType": "Full-Time",
    "salaryScale": "",
    "status": "Active"
  },
  "education": [
    {
      "degree": "Degree e.g. B.A. in Business",
      "institution": "Institution e.g. Borcelle University",
      "passingYear": "2008",
      "board": "University",
      "major": "Business",
      "result": ""
    }
  ],
  "experience": [
    {
      "role": "Marketing Manager",
      "company": "Arowwai Industries",
      "duration": "2016 - 2020",
      "isCurrent": false,
      "description": ""
    }
  ],
  "documents": [],
  "other": {
    "skills": ["UI/UX", "Wireframes", "Storyboards", "User Flows", "Process Flows", "Visual Design"],
    "rawText": "Raw text of the CV"
  }
}`;

/**
 * Universal AI CV Extractor supporting TokenRouter, OpenAI, DeepSeek, Groq, Claude, Ollama, and Google Gemini.
 */
export async function extractCvWithAI(
  base64Data: string,
  mimeType: string,
  rawExtractedText?: string
): Promise<ExtractedCvData | null> {
  const provider = (process.env.AI_PROVIDER || "auto").toLowerCase();

  // Route by specified provider
  if (provider === "tokenrouter") return extractWithTokenRouter(rawExtractedText || "");
  if (provider === "openai") return extractWithOpenAI(base64Data, mimeType, rawExtractedText);
  if (provider === "deepseek") return extractWithDeepSeek(rawExtractedText || "");
  if (provider === "groq") return extractWithGroq(rawExtractedText || "");
  if (provider === "claude") return extractWithClaude(base64Data, mimeType, rawExtractedText);
  if (provider === "ollama") return extractWithOllama(rawExtractedText || "");
  if (provider === "gemini") return extractWithGemini(base64Data, mimeType);

  // Default "auto" mode: tries TokenRouter first, then other configured API keys
  if (rawExtractedText) {
    const res = await extractWithTokenRouter(rawExtractedText);
    if (res) return res;
  }
  if (process.env.OPENAI_API_KEY) {
    const res = await extractWithOpenAI(base64Data, mimeType, rawExtractedText);
    if (res) return res;
  }
  if (process.env.DEEPSEEK_API_KEY && rawExtractedText) {
    const res = await extractWithDeepSeek(rawExtractedText);
    if (res) return res;
  }
  if (process.env.GROQ_API_KEY && rawExtractedText) {
    const res = await extractWithGroq(rawExtractedText);
    if (res) return res;
  }
  if (process.env.CLAUDE_API_KEY) {
    const res = await extractWithClaude(base64Data, mimeType, rawExtractedText);
    if (res) return res;
  }
  if (process.env.GEMINI_API_KEY) {
    const res = await extractWithGemini(base64Data, mimeType);
    if (res) return res;
  }
  if (process.env.OLLAMA_BASE_URL && rawExtractedText) {
    const res = await extractWithOllama(rawExtractedText);
    if (res) return res;
  }

  return null;
}

/**
 * TokenRouter API Integration (e.g. moonshotai/kimi-k3-free, deepseek, etc.)
 */
async function extractWithTokenRouter(rawText: string): Promise<ExtractedCvData | null> {
  const apiKey = process.env.TOKENROUTER_API_KEY;
  const baseUrl = process.env.TOKENROUTER_BASE_URL || "https://api.tokenrouter.com/v1";
  const modelName = process.env.TOKENROUTER_MODEL || "moonshotai/kimi-k3-free";

  if (!apiKey || !rawText) return null;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawText}`,
              },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("TokenRouter API notice:", response.status, errText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    let jsonStr = typeof content === "string" ? content : JSON.stringify(content);
    jsonStr = jsonStr.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err: any) {
    console.warn("TokenRouter extraction error:", err.message || err);
    return null;
  }
}

/**
 * OpenAI (GPT-4o / GPT-4o-mini) Extraction
 */
async function extractWithOpenAI(
  base64Data: string,
  mimeType: string,
  rawExtractedText?: string
): Promise<ExtractedCvData | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const isImage = mimeType.startsWith("image/");
    const contentPayload: any[] = [{ type: "text", text: CV_EXTRACTION_PROMPT }];

    if (isImage) {
      contentPayload.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${base64Data}` },
      });
    } else if (rawExtractedText) {
      contentPayload.push({
        type: "text",
        text: `RAW CV TEXT:\n${rawExtractedText}`,
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: contentPayload }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.warn("OpenAI API notice:", await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (err: any) {
    console.warn("OpenAI extraction error:", err.message || err);
    return null;
  }
}

/**
 * DeepSeek (DeepSeek-V3 / DeepSeek-R1) OpenAI-Compatible Extraction
 */
async function extractWithDeepSeek(rawText: string): Promise<ExtractedCvData | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || !rawText) return null;

  const modelName = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are an expert HR AI resume parser. Output ONLY valid JSON." },
          { role: "user", content: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawText}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.warn("DeepSeek API notice:", await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (err: any) {
    console.warn("DeepSeek extraction error:", err.message || err);
    return null;
  }
}

/**
 * Groq Llama 3.3 Ultra-Fast Extraction
 */
async function extractWithGroq(rawText: string): Promise<ExtractedCvData | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !rawText) return null;

  const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "system", content: "You are an expert HR AI resume parser. Output ONLY valid JSON." },
          { role: "user", content: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawText}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.warn("Groq API notice:", await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (err: any) {
    console.warn("Groq extraction error:", err.message || err);
    return null;
  }
}

/**
 * Anthropic Claude 3.5 Sonnet Extraction
 */
async function extractWithClaude(
  base64Data: string,
  mimeType: string,
  rawText?: string
): Promise<ExtractedCvData | null> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return null;

  const modelName = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";

  try {
    const isImage = mimeType.startsWith("image/");
    const contentPayload: any[] = [];

    if (isImage) {
      contentPayload.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64Data,
        },
      });
    }

    contentPayload.push({
      type: "text",
      text: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawText || ""}`,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 4000,
        messages: [{ role: "user", content: contentPayload }],
      }),
    });

    if (!response.ok) {
      console.warn("Claude API notice:", await response.text());
      return null;
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text || "";
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    return cleaned ? JSON.parse(cleaned) : null;
  } catch (err: any) {
    console.warn("Claude extraction error:", err.message || err);
    return null;
  }
}

/**
 * Google Gemini Extraction Engine
 */
async function extractWithGemini(base64Data: string, mimeType: string): Promise<ExtractedCvData | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelsToTry = [
    process.env.GEMINI_MODEL || "gemini-1.5-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
  ];
  const genAI = new GoogleGenerativeAI(apiKey);

  const documentPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout model ${modelName}`)), 10000)
      );
      const aiPromise = model.generateContent([CV_EXTRACTION_PROMPT, documentPart]);
      const result: any = await Promise.race([aiPromise, timeoutPromise]);

      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e: any) {
      console.warn(`Gemini model ${modelName} notice:`, e.message || e);
    }
  }

  return null;
}

/**
 * Local Ollama Extraction Engine
 */
async function extractWithOllama(rawText: string): Promise<ExtractedCvData | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const modelName = process.env.OLLAMA_MODEL || "llama3.2";

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelName,
        prompt: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawText}`,
        format: "json",
        stream: false,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.response ? JSON.parse(data.response) : null;
  } catch (err: any) {
    console.warn("Ollama extraction notice:", err.message || err);
    return null;
  }
}
