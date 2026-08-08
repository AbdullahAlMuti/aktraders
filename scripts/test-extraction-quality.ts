/**
 * Extraction quality regression test. Runs known-hard CV templates through the
 * real AI pipeline and asserts the fields that used to fail. Requires AI
 * provider credentials: run with `npx -y tsx --env-file=.env.local scripts/test-extraction-quality.ts`.
 *
 * The Lorna case is the critical one: her name is drawn as vector graphics and
 * does NOT exist in the PDF text layer, so it can only pass via PDF-native
 * (document block) extraction.
 */
import fs from "fs";
import { extractCvWithAI } from "../lib/ai-provider";
import { extractTextFromPdf } from "../lib/cv-batch-processor";

const CASES = [
  {
    file: "public/uploads/cvs/cv-1786225304633-2311_White_Black_Simple_Resume.pdf",
    label: "Korina (kerned graphic template)",
    expect: { nameIncludes: "Korina", email: "hello@reallygreatsite.com", minEdu: 2, minExp: 1, minSkills: 3 },
  },
  {
    file: "public/uploads/cvs/cv-1786140450701-1752_Black_Modern_Professional_Resume.pdf",
    label: "Lorna (name drawn as graphic)",
    expect: { nameIncludes: "Lorna", email: "hello@reallygreatsite.com", minEdu: 1, minExp: 2, minSkills: 3 },
  },
];

let passed = 0,
  total = 0;
function assert(cond: boolean, name: string) {
  total++;
  if (cond) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else console.error(`[FAIL] ${name}`);
}

async function main() {
  for (const c of CASES) {
    if (!fs.existsSync(c.file)) {
      console.warn(`[SKIP] sample missing: ${c.file}`);
      continue;
    }
    const buffer = fs.readFileSync(c.file);
    const text = await extractTextFromPdf(buffer);
    const start = Date.now();
    const r = await extractCvWithAI(buffer.toString("base64"), "application/pdf", text);
    const secs = Math.round((Date.now() - start) / 1000);
    console.log(`\n=== ${c.label} (${secs}s) ===`);
    assert(!!r, "extraction returned a result");
    if (!r) continue;
    assert(
      (r.candidateName || "").includes(c.expect.nameIncludes),
      `name contains "${c.expect.nameIncludes}" (got "${r.candidateName}")`
    );
    assert((r.personal?.email || "") === c.expect.email, `email == ${c.expect.email} (got "${r.personal?.email}")`);
    assert((r.education?.length || 0) >= c.expect.minEdu, `education >= ${c.expect.minEdu} (got ${r.education?.length})`);
    assert(
      (r.experience?.length || 0) >= c.expect.minExp,
      `experience >= ${c.expect.minExp} (got ${r.experience?.length})`
    );
    assert(
      (r.other?.skills?.length || 0) >= c.expect.minSkills,
      `skills >= ${c.expect.minSkills} (got ${r.other?.skills?.length})`
    );
    // Gateway latency is volatile (12s-4min for identical requests); speed is
    // reported but only data quality fails the suite.
    if (secs >= 60) console.warn(`[SLOW] took ${secs}s (gateway variance; target <60s)`);
  }
  console.log(`\n${passed}/${total} PASSED`);
  process.exit(passed === total && total > 0 ? 0 : 1);
}
main();
