import { extractCvWithAI } from "@/lib/ai-provider";
import fs from "fs";
import path from "path";

function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...valParts] = trimmed.split("=");
          process.env[key.trim()] = valParts.join("=").trim();
        }
      }
    }
  } catch (e) {}
}

loadEnvLocal();

async function runLiveTest() {
  console.log("=== Testing AgentRouter Integration Live ===");
  console.log("AI_PROVIDER:", process.env.AI_PROVIDER);
  console.log("AGENTROUTER_BASE_URL:", process.env.AGENTROUTER_BASE_URL);
  console.log("AGENTROUTER_MODEL:", process.env.AGENTROUTER_MODEL);
  console.log("AGENTROUTER_API_KEY set:", !!process.env.AGENTROUTER_API_KEY);

  const sampleCvText = `
    KORINA VILLANUEVA
    Marketing Manager
    Email: korina.v@example.com
    Phone: +880 1700-123456
    Address: Dhaka, Bangladesh

    EDUCATION:
    B.A. in Business Administration - Borcelle University (2018)

    WORK EXPERIENCE:
    Marketing Manager - Arowwai Industries (2020 - Present)
    - Managed digital marketing campaigns and brand strategy.

    SKILLS:
    Digital Marketing, UI/UX, Project Management
  `;

  const startTime = Date.now();
  const result = await extractCvWithAI("", "application/pdf", sampleCvText);
  const elapsed = Date.now() - startTime;

  if (result) {
    console.log(`\n✅ Extraction Successful in ${elapsed}ms!`);
    console.log("Extracted Candidate Name:", result.candidateName);
    console.log("Email:", result.personal?.email);
    console.log("Phone:", result.personal?.mobile);
    console.log("Designation:", result.employment?.designation);
    console.log("Skills:", result.other?.skills);
  } else {
    console.log(`\n❌ AgentRouter API extraction returned null in ${elapsed}ms.`);
  }
}

runLiveTest();
