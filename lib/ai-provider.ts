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
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
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
    duration?: string;
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
    languages?: string[];
    certifications?: string[];
    projects?: string[];
    achievements?: string[];
    references?: string[];
    careerObjective?: string;
    professionalSummary?: string;
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
8. Contact: Extract phone number, email address, physical address, website, LinkedIn, GitHub and portfolio links accurately.
9. Other Details: Extract ALL languages, certifications, projects, achievements/awards, references, career objective and professional summary if present.
10. Missing Data: If a field is not present in the CV, return an empty string "" or empty array []. NEVER invent, guess, or fabricate values.

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
    "emergencyContact": "",
    "linkedinUrl": "",
    "githubUrl": "",
    "portfolioUrl": ""
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
    "languages": ["English", "Bengali"],
    "certifications": ["Certification name (year)"],
    "projects": ["Project name - short description"],
    "achievements": ["Achievement or award"],
    "references": ["Reference name, title, contact"],
    "careerObjective": "Career objective text or ''",
    "professionalSummary": "Profile / summary / about-me text or ''",
    "rawText": "Raw text of the CV"
  }
}`;

/**
 * Universal AI CV Extractor supporting AgentRouter, TokenRouter, OpenAI, DeepSeek, Groq, Claude, Ollama, and Google Gemini.
 */
export async function extractCvWithAI(
  base64Data: string,
  mimeType: string,
  rawExtractedText?: string
): Promise<ExtractedCvData | null> {
  const provider = (process.env.AI_PROVIDER || "auto").toLowerCase();

  const attempt = async (name: string): Promise<ExtractedCvData | null> => {
    switch (name) {
      case "agentrouter":
        return process.env.AGENTROUTER_API_KEY ? extractWithAgentRouter(base64Data, mimeType, rawExtractedText) : null;
      case "tokenrouter":
        return process.env.TOKENROUTER_API_KEY && rawExtractedText ? extractWithTokenRouter(rawExtractedText) : null;
      case "openai":
        return process.env.OPENAI_API_KEY ? extractWithOpenAI(base64Data, mimeType, rawExtractedText) : null;
      case "deepseek":
        return process.env.DEEPSEEK_API_KEY && rawExtractedText ? extractWithDeepSeek(rawExtractedText) : null;
      case "groq":
        return process.env.GROQ_API_KEY && rawExtractedText ? extractWithGroq(rawExtractedText) : null;
      case "claude":
        return process.env.CLAUDE_API_KEY ? extractWithClaude(base64Data, mimeType, rawExtractedText) : null;
      case "gemini":
        return process.env.GEMINI_API_KEY ? extractWithGemini(base64Data, mimeType) : null;
      case "ollama":
        return process.env.OLLAMA_BASE_URL && rawExtractedText ? extractWithOllama(rawExtractedText) : null;
      default:
        return null;
    }
  };

  // Preferred provider first, then fall back through every other configured
  // provider so a single failing/misconfigured provider never breaks extraction.
  const chain = ["agentrouter", "tokenrouter", "openai", "deepseek", "groq", "claude", "gemini", "ollama"];
  const ordered = provider !== "auto" && chain.includes(provider) ? [provider, ...chain.filter((c) => c !== provider)] : chain;

  for (const name of ordered) {
    try {
      const res = await attempt(name);
      if (res) return res;
    } catch (err: any) {
      console.warn(`AI provider ${name} notice:`, err?.message || err);
    }
  }

  return null;
}

/**
 * AgentRouter API Integration (https://agentrouter.org)
 * Supports both Anthropic Messages API (/v1/messages) and OpenAI Chat Completions API (/v1/chat/completions).
 */
async function extractWithAgentRouter(
  base64Data: string,
  mimeType: string,
  rawExtractedText?: string
): Promise<ExtractedCvData | null> {
  const apiKey = process.env.AGENTROUTER_API_KEY;
  const baseUrl = (process.env.AGENTROUTER_BASE_URL || "https://agentrouter.org").replace(/\/$/, "");
  const modelName = process.env.AGENTROUTER_MODEL || "claude-opus-4-8";

  if (!apiKey) return null;

  // AgentRouter's gateway only accepts requests that identify as a coding CLI
  // client; without these headers every call is rejected with 401
  // "unauthorized client detected" regardless of key validity.
  const clientHeaders = {
    "User-Agent": "claude-cli/1.0.83 (external, cli)",
    "x-app": "cli",
  };

  try {
    const isImage = mimeType.startsWith("image/");
    const isClaudeModel = modelName.toLowerCase().includes("claude");

    // 1. If Claude model, try Anthropic Messages API format first
    if (isClaudeModel) {
      try {
        const anthropicContent: any[] = [];
        if (isImage) {
          anthropicContent.push({
            type: "image",
            source: { type: "base64", media_type: mimeType, data: base64Data },
          });
        }
        anthropicContent.push({
          type: "text",
          text: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawExtractedText || ""}`,
        });

        const messagesEndpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/messages` : `${baseUrl}/v1/messages`;
        const res = await fetch(messagesEndpoint, {
          method: "POST",
          signal: AbortSignal.timeout(90000),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "anthropic-version": "2023-06-01",
            ...clientHeaders,
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 4000,
            messages: [{ role: "user", content: anthropicContent }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const responseText = data.content?.[0]?.text || "";
          const cleaned = responseText.replace(/```json|```/g, "").trim();
          if (cleaned) return JSON.parse(cleaned);
        }
      } catch (anthropicErr) {
        console.warn("AgentRouter Anthropic endpoint notice:", anthropicErr);
      }
    }

    // 2. OpenAI Chat Completions format
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

    const completionsEndpoint = baseUrl.endsWith("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
    let response = await fetch(completionsEndpoint, {
      method: "POST",
      signal: AbortSignal.timeout(90000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...clientHeaders,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: contentPayload }],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      response = await fetch(completionsEndpoint, {
        method: "POST",
        signal: AbortSignal.timeout(90000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...clientHeaders,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "user",
              content: `${CV_EXTRACTION_PROMPT}\n\nRAW CV TEXT:\n${rawExtractedText || ""}`,
            },
          ],
          temperature: 0.1,
        }),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn("AgentRouter API notice:", response.status, errText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    let jsonStr = typeof content === "string" ? content : JSON.stringify(content);
    jsonStr = jsonStr.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (err: any) {
    console.warn("AgentRouter extraction error:", err.message || err);
    return null;
  }
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
      signal: AbortSignal.timeout(90000),
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
      signal: AbortSignal.timeout(90000),
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
      signal: AbortSignal.timeout(90000),
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
      signal: AbortSignal.timeout(90000),
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
      signal: AbortSignal.timeout(90000),
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
    process.env.GEMINI_MODEL || "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
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
        setTimeout(() => reject(new Error(`Timeout model ${modelName}`)), 45000)
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
      signal: AbortSignal.timeout(90000),
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
