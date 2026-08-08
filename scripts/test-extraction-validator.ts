import { validateExtraction } from "../lib/extraction-validator";

let passed = 0,
  total = 0;
function assert(cond: boolean, name: string) {
  total++;
  if (cond) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else console.error(`[FAIL] ${name}`);
}

// Good extraction passes
const good = {
  candidateName: "Korina Villanueva",
  personal: { fullName: "Korina Villanueva", email: "korina@example.com", mobile: "+123-456-7890" },
  education: [{ degree: "B.A." }],
  experience: [{ role: "Manager" }],
};
assert(validateExtraction(good, "korina_cv.pdf").ok === true, "valid extraction passes");

// Filename-as-name fails
const fromFile = {
  candidateName: "White Black and Blue Modern Professional Resume A4",
  personal: {},
  education: [],
  experience: [],
};
assert(
  validateExtraction(fromFile, "White Black and Blue Modern Professional Resume A4.pdf").ok === false,
  "filename-as-name rejected"
);

// Section heading as name fails
const heading = { candidateName: "Work Experience", personal: { email: "a@b.com" }, education: [], experience: [] };
assert(validateExtraction(heading, "cv.pdf").ok === false, "section heading rejected");

// Kerned single letters fail
const kerned = { candidateName: "W a r d i e r e", personal: { email: "a@b.com" }, education: [], experience: [] };
assert(validateExtraction(kerned, "cv.pdf").ok === false, "kerned name rejected");

// No substance fails (name only, nothing else)
const empty = { candidateName: "John Smith", personal: {}, education: [], experience: [] };
assert(validateExtraction(empty, "cv.pdf").ok === false, "no-substance extraction rejected");

// Substance via phone only passes
const phoneOnly = { candidateName: "John Smith", personal: { mobile: "01700123456" }, education: [], experience: [] };
assert(validateExtraction(phoneOnly, "cv.pdf").ok === true, "phone counts as substance");

// Missing name fails
const noName = { candidateName: "", personal: { email: "a@b.com" }, education: [], experience: [] };
assert(validateExtraction(noName, "cv.pdf").ok === false, "missing name rejected");

console.log(`${passed}/${total}`);
process.exit(passed === total ? 0 : 1);
