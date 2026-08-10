/**
 * Unit tests for the deterministic CV → search-column normalizer.
 *
 * Run: npx -y tsx scripts/test-candidate-normalizer.ts
 */
import {
  assessCvQuality,
  deriveExperienceYears,
  detectTraining,
  matchDistrict,
  normalizeEducation,
  normalizeGender,
  normalizeProfession,
  normalizeProfile,
  parseDateOfBirth,
  toSearchColumns,
} from "../lib/candidate-normalizer";
import type { FullEmployeeProfile } from "../types/employee.types";

let passed = 0,
  total = 0;
function assert(cond: boolean, name: string) {
  total++;
  if (cond) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else console.error(`[FAIL] ${name}`);
}

/** Fixed "today" so the age-plausibility window never makes a test flaky. */
const TODAY = new Date(2026, 7, 10);
const CURRENT_YEAR = new Date().getFullYear();

function makeProfile(overrides: Partial<FullEmployeeProfile> = {}): FullEmployeeProfile {
  return {
    id: "EMP-000123",
    employeeId: "EMP-000123",
    applicantId: "APP-000123",
    cvNumber: "CV-000123",
    name: "Rahim Uddin",
    email: "rahim@example.com",
    phone: "01711000000",
    department: "operations",
    designation: "Driver",
    organization: "AK Traders",
    status: "active",
    joiningDate: "2020-01-01",
    cvCount: 1,
    personalInformation: { fullName: "Rahim Uddin", phone: "01711000000", email: "rahim@example.com" },
    employmentDetails: {
      employeeId: "EMP-000123",
      applicantId: "APP-000123",
      cvNumber: "CV-000123",
      currentStatus: "active",
      currentDesignation: "Driver",
      department: "operations",
    },
    educationalQualifications: [],
    workExperience: [],
    attachedDocuments: [],
    otherDetails: { skills: [] },
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/* ------------------------------------------------------------------ gender */

assert(normalizeGender("M") === "male", "gender: M → male");
assert(normalizeGender("male") === "male", "gender: male → male");
assert(normalizeGender("Man") === "male", "gender: Man → male");
assert(normalizeGender("পুরুষ") === "male", "gender: পুরুষ → male");
assert(normalizeGender("F") === "female", "gender: F → female");
assert(normalizeGender("Female") === "female", "gender: Female → female (not male)");
assert(normalizeGender("FEMALE") === "female", "gender: FEMALE → female (not male)");
assert(normalizeGender("Woman") === "female", "gender: Woman → female (not male)");
assert(normalizeGender("মহিলা") === "female", "gender: মহিলা → female");
assert(normalizeGender("নারী") === "female", "gender: নারী → female");
assert(normalizeGender("Transgender") === "other", "gender: unrecognised non-empty → other");
assert(normalizeGender("") === null, "gender: empty → null");
assert(normalizeGender("   ") === null, "gender: whitespace → null");
assert(normalizeGender(null) === null, "gender: null → null");
assert(normalizeGender(undefined) === null, "gender: undefined → null");

/* --------------------------------------------------------------------- dob */

assert(parseDateOfBirth("15/01/1990", TODAY) === "1990-01-15", "dob: DD/MM/YYYY");
assert(parseDateOfBirth("15-01-1990", TODAY) === "1990-01-15", "dob: DD-MM-YYYY");
assert(parseDateOfBirth("1990-01-15", TODAY) === "1990-01-15", "dob: YYYY-MM-DD");
assert(parseDateOfBirth("15 Jan 1990", TODAY) === "1990-01-15", "dob: 15 Jan 1990");
assert(parseDateOfBirth("15 January 1990", TODAY) === "1990-01-15", "dob: 15 January 1990");
assert(parseDateOfBirth("January 15, 1990", TODAY) === "1990-01-15", "dob: January 15, 1990");
assert(parseDateOfBirth("Jan 15 1990", TODAY) === "1990-01-15", "dob: Jan 15 1990");
assert(parseDateOfBirth("1990", TODAY) === "1990-01-01", "dob: bare year");
assert(parseDateOfBirth("1990-01-15T00:00:00.000Z", TODAY) === "1990-01-15", "dob: ISO timestamp");
assert(parseDateOfBirth("DOB: 15/01/1990", TODAY) === "1990-01-15", "dob: labelled value");
assert(parseDateOfBirth("03/25/1990", TODAY) === "1990-03-25", "dob: month-first fallback when day-first impossible");
assert(parseDateOfBirth("05/06/1990", TODAY) === "1990-06-05", "dob: ambiguous prefers day-first");
assert(parseDateOfBirth("2020-01-01", TODAY) === null, "dob: implied age < 14 rejected");
assert(parseDateOfBirth("1900-05-05", TODAY) === null, "dob: implied age > 75 rejected");
assert(parseDateOfBirth("31/02/1990", TODAY) === null, "dob: impossible calendar date rejected");
assert(parseDateOfBirth("not a date", TODAY) === null, "dob: garbage → null");
assert(parseDateOfBirth("", TODAY) === null, "dob: empty → null");
assert(parseDateOfBirth(null, TODAY) === null, "dob: null → null");
assert(parseDateOfBirth(undefined, TODAY) === null, "dob: undefined → null");
assert(parseDateOfBirth({ nope: true }, TODAY) === null, "dob: non-string → null");

/* --------------------------------------------------------------- education */

const dakhil = normalizeEducation([{ degree: "Dakhil", board: "Madrasah Education Board" }]);
assert(dakhil.level === "ssc" && dakhil.board === "madrasa", "education: Dakhil → ssc / madrasa");

const alim = normalizeEducation([{ degree: "Alim", board: "Madrasah Education Board" }]);
assert(alim.level === "hsc" && alim.board === "madrasa", "education: Alim → hsc / madrasa");

const bsc = normalizeEducation([{ degree: "B.Sc in CSE", board: "Dhaka" }]);
assert(bsc.level === "bachelor" && bsc.board === "general", "education: B.Sc in CSE → bachelor / general");

const diplomaBoard = normalizeEducation([
  { degree: "Diploma in Engineering", board: "Bangladesh Technical Education Board" },
]);
assert(
  diplomaBoard.level === "diploma" && diplomaBoard.board === "technical",
  "education: Diploma in Engineering → diploma / technical (board field)"
);

const diplomaPoly = normalizeEducation([{ degree: "Diploma in Engineering", qualificationName: "Polytechnic Diploma" }]);
assert(
  diplomaPoly.level === "diploma" && diplomaPoly.board === "technical",
  "education: Diploma / Polytechnic → diploma / technical (degree text)"
);

const ladder = normalizeEducation([
  { degree: "SSC" },
  { degree: "HSC" },
  { degree: "B.Sc in Civil" },
  { degree: "MBA" },
]);
assert(ladder.level === "masters", "education: highest level wins across records");

const ladderReversed = normalizeEducation([{ degree: "MBA" }, { degree: "SSC" }, { degree: "JSC" }]);
assert(ladderReversed.level === "masters", "education: highest level wins regardless of order");

const boardFromWinner = normalizeEducation([
  { degree: "Dakhil", board: "Madrasah Education Board" },
  { degree: "B.Sc in Physics", board: "Dhaka University" },
]);
assert(
  boardFromWinner.level === "bachelor" && boardFromWinner.board === "general",
  "education: board is read from the winning record only"
);

assert(normalizeEducation([{ degree: "Fazil" }]).level === "bachelor", "education: Fazil → bachelor");
assert(normalizeEducation([{ degree: "Fazil" }]).board === "madrasa", "education: Fazil → madrasa board");
assert(normalizeEducation([{ degree: "Kamil" }]).level === "masters", "education: Kamil → masters");
assert(normalizeEducation([{ degree: "M.A in Bangla" }]).level === "masters", "education: M.A → masters");
assert(normalizeEducation([{ degree: "B A", major: "Islamic Studies" }]).level === "bachelor", "education: B A → bachelor");
assert(normalizeEducation([{ degree: "Bangla Literature" }]).level === "other", "education: BA does not match inside BANGLA");
assert(normalizeEducation([{ degree: "MS Office Management" }]).level === "other", "education: MS Office is not a Masters");
assert(normalizeEducation([{ degree: "JSC" }]).level === "below_ssc", "education: JSC → below_ssc");
assert(normalizeEducation([{ degree: "Class 8 Pass" }]).level === "below_ssc", "education: Class 8 → below_ssc");
assert(normalizeEducation([{ degree: "MBBS" }]).level === "bachelor", "education: MBBS → bachelor");

const oLevel = normalizeEducation([{ degree: "O Level" }]);
assert(oLevel.level === "ssc" && oLevel.board === "equivalent", "education: O Level → ssc / equivalent");
const aLevel = normalizeEducation([{ degree: "A-Level" }]);
assert(aLevel.level === "hsc" && aLevel.board === "equivalent", "education: A-Level → hsc / equivalent");
const vocational = normalizeEducation([{ degree: "SSC (Vocational)", board: "Technical Education Board" }]);
assert(vocational.level === "ssc" && vocational.board === "vocational", "education: SSC Vocational → ssc / vocational");

const noEducation = normalizeEducation([]);
assert(noEducation.level === null && noEducation.board === null, "education: no records → null / null");
const junkEducation = normalizeEducation(null);
assert(junkEducation.level === null && junkEducation.board === null, "education: null input → null / null");

/* -------------------------------------------------------------- profession */

assert(normalizeProfession("Driver") === "driver", "profession: Driver → driver");
assert(normalizeProfession("Chauffeur") === "driver", "profession: Chauffeur → driver");
assert(normalizeProfession("ড্রাইভার") === "driver", "profession: ড্রাইভার → driver");
assert(normalizeProfession("Maid") === "housekeeper", "profession: Maid → housekeeper");
assert(normalizeProfession("Domestic Help") === "housekeeper", "profession: Domestic Help → housekeeper");
assert(normalizeProfession("Security Guard") === "security_guard", "profession: Security Guard → security_guard");
assert(normalizeProfession("Guard") === "security_guard", "profession: Guard → security_guard");
assert(normalizeProfession("Sweeper") === "cleaner", "profession: Sweeper → cleaner");
assert(normalizeProfession("Janitor") === "cleaner", "profession: Janitor → cleaner");
assert(normalizeProfession("Clerk") === "office_staff", "profession: Clerk → office_staff");
assert(normalizeProfession("Peon") === "office_staff", "profession: Peon → office_staff");
assert(normalizeProfession("Office Assistant") === "office_staff", "profession: Office Assistant → office_staff");
assert(normalizeProfession("Mechanic") === "technician", "profession: Mechanic → technician");
assert(normalizeProfession("Fitter") === "technician", "profession: Fitter → technician");
assert(normalizeProfession("Chef") === "cook", "profession: Chef → cook");
assert(normalizeProfession("Labourer") === "helper", "profession: Labourer → helper");
assert(normalizeProfession("Electrician") === "electrician", "profession: Electrician → electrician");
assert(normalizeProfession("Senior Welder") === "welder", "profession: Senior Welder → welder");
assert(normalizeProfession("Data Scientist") === "other", "profession: unknown designation → other");
assert(normalizeProfession("") === null, "profession: empty → null");
assert(normalizeProfession(undefined) === null, "profession: undefined → null");

/* -------------------------------------------------------------- experience */

assert(deriveExperienceYears([{ duration: "2016 - 2020" }]) === 4, "experience: 2016 - 2020 → 4");
assert(
  deriveExperienceYears([{ duration: "2016 - Present" }]) === CURRENT_YEAR - 2016,
  "experience: 2016 - Present → years to date"
);
assert(deriveExperienceYears([{ duration: "Jan 2016 to Dec 2019" }]) === 3, "experience: Jan 2016 to Dec 2019 → 3");
assert(
  deriveExperienceYears([{ duration: "2010 – 2014" }, { duration: "2015 - 2018" }]) === 7,
  "experience: multiple records are summed"
);
assert(
  deriveExperienceYears([{ startDate: "2016", endDate: "2020" }]) === 4,
  "experience: start/end dates when no duration string"
);
assert(
  deriveExperienceYears([{ startDate: "2016", endDate: "", isCurrent: true }]) === CURRENT_YEAR - 2016,
  "experience: current role runs to today"
);
assert(deriveExperienceYears([]) === null, "experience: no records → null");
assert(deriveExperienceYears([{ duration: "a few years" }]) === null, "experience: unparseable → null (not 0)");
assert(deriveExperienceYears(null) === null, "experience: null → null");
assert(deriveExperienceYears([{ duration: "2020 - 2020" }]) === null, "experience: zero-length → null (not 0)");

/* ---------------------------------------------------------------- location */

const comilla = matchDistrict("Village Ramchandrapur, Comilla, Bangladesh");
assert(comilla.district === "cumilla" && comilla.division === "chattogram", "location: Comilla → cumilla / chattogram");

const jessore = matchDistrict("Jessore Sadar");
assert(jessore.district === "jashore" && jessore.division === "khulna", "location: Jessore → jashore / khulna");

const coxs = matchDistrict("Ramu, Cox's Bazar");
assert(coxs.district === "coxs_bazar" && coxs.division === "chattogram", "location: Cox's Bazar → coxs_bazar");
assert(matchDistrict("coxs bazar sadar").district === "coxs_bazar", "location: coxs bazar alias");
assert(matchDistrict("Cox Bazar").district === "coxs_bazar", "location: Cox Bazar alias");
assert(matchDistrict("Chittagong").district === "chattogram", "location: Chittagong → chattogram");
assert(matchDistrict("Bogra").district === "bogura", "location: Bogra → bogura");
assert(matchDistrict("Chapai Nawabganj").district === "chapainawabganj", "location: longest alias wins over Nawabganj");

const noDistrict = matchDistrict("House 12, Road 5, Banani, Bangladesh");
assert(noDistrict.district === null && noDistrict.division === null, "location: address with no district → null / null");
assert(matchDistrict("").district === null, "location: empty → null");
assert(matchDistrict(null, undefined).district === null, "location: null inputs → null");
assert(matchDistrict("", "Sylhet").district === "sylhet", "location: falls through to the next text");
assert(matchDistrict("Rangpur", "Khulna").district === "rangpur", "location: first text wins");

/* ---------------------------------------------------------------- training */

const licence = detectTraining({ skills: [], drivingLicense: "DL-1234567" });
assert(
  licence.isTrained === true && licence.trainingTypes.join() === "driving",
  "training: driving licence → trained / driving"
);
assert(
  detectTraining({ skills: [], certifications: ["Driving Licence (Heavy)"] }).trainingTypes.join() === "driving",
  "training: driving licence certificate → driving"
);
assert(
  detectTraining({ skills: [], trainings: ["Fire Safety Training"] }).trainingTypes.join() === "safety",
  "training: fire safety → safety"
);
assert(
  detectTraining({ skills: [], trainings: ["Welding Level 2"] }).trainingTypes.join() === "technical",
  "training: welding → technical"
);
assert(detectTraining({ skills: ["MS Office"] }).trainingTypes.join() === "computer", "training: MS Office skill → computer");
assert(
  detectTraining({ skills: [], certifications: ["Flower Arrangement"] }).trainingTypes.join() === "other",
  "training: unclassified certificate → other"
);
assert(detectTraining({ skills: ["Cooking"] }).isTrained === false, "training: a plain skill is not a training");

const multi = detectTraining({ skills: ["Computer"], trainings: ["Driving Course", "First Aid"] });
assert(multi.trainingTypes.join() === "driving,safety,computer", "training: types are deduped and ordered");

const untrained = detectTraining({ skills: [] });
assert(untrained.isTrained === false && untrained.trainingTypes.length === 0, "training: nothing → untrained");
assert(detectTraining(null).isTrained === false, "training: null → untrained");

/* -------------------------------------------------------------- cv quality */

const cvDoc = [{ id: "d1", documentId: "CV-1", documentType: "original_cv" as const, originalFileName: "cv.pdf", fileUrl: "https://x/cv.pdf", fileSize: "1 MB", mimeType: "application/pdf", uploadDate: "2020-01-01", version: 1 }];

assert(
  assessCvQuality(makeProfile({ status: "review_required", attachedDocuments: cvDoc })) === "needs_review",
  "cv quality: review_required → needs_review"
);
assert(assessCvQuality(makeProfile({ attachedDocuments: [] })) === "not_available", "cv quality: no document → not_available");
assert(
  assessCvQuality(makeProfile({ attachedDocuments: [{ ...cvDoc[0], fileUrl: "", originalFileName: "" }] })) ===
    "not_available",
  "cv quality: document with neither url nor file name → not_available"
);
// Regression: profileFromEmployeeRow's legacy branch always sets fileUrl: "" and
// only emits the document when the row has a cv_file_name, so a file name alone
// must still count as an attached CV.
assert(
  assessCvQuality(
    makeProfile({
      attachedDocuments: [{ ...cvDoc[0], fileUrl: "" }],
      educationalQualifications: [{ id: "e1", degree: "SSC", major: "", institution: "X" }],
      workExperience: [{ id: "w1", organizationName: "X", jobTitle: "Driver", isCurrent: false }],
    })
  ) === "good",
  "cv quality: legacy document with a file name but no url is still an attached CV"
);
assert(
  assessCvQuality(
    makeProfile({
      attachedDocuments: cvDoc,
      educationalQualifications: [{ id: "e1", degree: "SSC", major: "", institution: "X" }],
      workExperience: [{ id: "w1", organizationName: "X", jobTitle: "Driver", isCurrent: false }],
    })
  ) === "good",
  "cv quality: name + phone + education + experience → good"
);
assert(
  assessCvQuality(
    makeProfile({
      attachedDocuments: cvDoc,
      educationalQualifications: [{ id: "e1", degree: "SSC", major: "", institution: "X" }],
    })
  ) === "needs_review",
  "cv quality: incomplete profile with a CV → needs_review"
);
assert(assessCvQuality(null) === "not_available", "cv quality: null profile → not_available");

/* ----------------------------------------------------------- normalizeProfile */

const full = normalizeProfile(
  makeProfile({
    designation: "Senior Driver",
    status: "active",
    attachedDocuments: cvDoc,
    personalInformation: {
      fullName: "Rahim Uddin",
      phone: "01711000000",
      email: "rahim@example.com",
      gender: "Male",
      dob: "15/01/1990",
      permanentAddress: "Village Ramchandrapur, Comilla",
      presentAddress: "Mirpur, Dhaka",
    },
    educationalQualifications: [
      { id: "e1", degree: "Dakhil", major: "", institution: "X", board: "Madrasah Education Board" },
      { id: "e2", degree: "Alim", major: "", institution: "X", board: "Madrasah Education Board" },
    ],
    workExperience: [{ id: "w1", organizationName: "X", jobTitle: "Driver", isCurrent: false, duration: "2016 - 2020" }],
    otherDetails: { skills: ["Driving"], drivingLicense: "DL-1234567" },
  })
);

assert(full.gender === "male", "profile: gender mapped");
assert(full.dateOfBirth === "1990-01-15", "profile: dob mapped");
assert(full.educationLevel === "hsc" && full.educationBoard === "madrasa", "profile: Alim beats Dakhil");
assert(full.profession === "driver", "profile: profession mapped");
assert(full.professionRaw === "Senior Driver", "profile: raw designation preserved");
assert(full.experienceYears === 4, "profile: experience mapped");
assert(full.district === "cumilla", "profile: permanent address wins over present address");
assert(full.division === "chattogram", "profile: division derived from district");
assert(full.isTrained === true && full.trainingTypes.join() === "driving", "profile: training mapped");
assert(full.cvQuality === "good", "profile: cv quality mapped");

const designationFallback = normalizeProfile(
  makeProfile({ designation: "", employmentDetails: { ...makeProfile().employmentDetails, currentDesignation: "Cook" } })
);
assert(designationFallback.profession === "cook", "profile: falls back to employmentDetails.currentDesignation");

const empty = normalizeProfile({} as FullEmployeeProfile);
assert(empty.gender === null, "empty profile: gender null");
assert(empty.dateOfBirth === null, "empty profile: dob null");
assert(empty.educationLevel === null && empty.educationBoard === null, "empty profile: education null");
assert(empty.profession === null && empty.professionRaw === null, "empty profile: profession null");
assert(empty.experienceYears === null, "empty profile: experience null");
assert(empty.district === null && empty.division === null, "empty profile: location null");
assert(empty.isTrained === false && empty.trainingTypes.length === 0, "empty profile: untrained");
assert(empty.cvQuality === "not_available", "empty profile: cv quality not_available");

let threw = false;
try {
  normalizeProfile(undefined as unknown as FullEmployeeProfile);
  normalizeProfile(null as unknown as FullEmployeeProfile);
  normalizeProfile("garbage" as unknown as FullEmployeeProfile);
  normalizeProfile(42 as unknown as FullEmployeeProfile);
  normalizeProfile({
    personalInformation: 5,
    educationalQualifications: "nope",
    workExperience: { a: 1 },
    otherDetails: 0,
    attachedDocuments: null,
  } as unknown as FullEmployeeProfile);
} catch {
  threw = true;
}
assert(threw === false, "normalizeProfile is total: garbage input never throws");

/* ------------------------------------------------------------ toSearchColumns */

const columns = toSearchColumns(full);
assert(columns.gender === "male", "columns: gender");
assert(columns.date_of_birth === "1990-01-15", "columns: date_of_birth");
assert(columns.education_level === "hsc", "columns: education_level");
assert(columns.education_board === "madrasa", "columns: education_board");
assert(columns.profession === "driver", "columns: profession");
assert(columns.profession_raw === "Senior Driver", "columns: profession_raw");
assert(columns.experience_years === 4, "columns: experience_years");
assert(columns.division === "chattogram", "columns: division");
assert(columns.district === "cumilla", "columns: district");
assert(columns.is_trained === true, "columns: is_trained");
assert(Array.isArray(columns.training_types), "columns: training_types is an array");
assert(columns.cv_quality === "good", "columns: cv_quality");
assert(typeof columns.search_indexed_at === "string", "columns: search_indexed_at stamped");

console.log(`${passed}/${total}`);
process.exit(passed === total ? 0 : 1);
