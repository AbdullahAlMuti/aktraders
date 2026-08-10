import {
  DISTRICTS,
  DISTRICT_TO_DIVISION,
  EDUCATION_LEVEL_RANK,
  TRAINING_TYPES,
  type CvQuality,
  type Division,
  type EducationBoard,
  type EducationLevel,
  type Gender,
  type Profession,
  type TrainingType,
} from "@/constants/candidate-filters";
import type { CandidateSearchFields } from "@/types/candidate-search.types";
import type { EducationRecord, FullEmployeeProfile, OtherDetails } from "@/types/employee.types";

/**
 * Deterministic CV → search-column normalizer.
 *
 * `normalizeProfile` is a total function: it never throws, for any input,
 * including null, undefined and garbage. Anything that cannot be mapped with
 * confidence becomes `null` — nothing about a candidate is ever invented.
 *
 * Every helper is exported so the mapping rules can be unit-tested in isolation
 * (see `scripts/test-candidate-normalizer.ts`).
 */

/* ------------------------------------------------------------------- text */

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Folds free text into space-separated lowercase tokens. Abbreviation dots and
 * apostrophes are dropped first so "B.Sc" → "bsc" and "Cox's Bazar" →
 * "coxs bazar"; Bengali code points survive as their own tokens.
 */
function normalizeText(value: unknown): string {
  return asText(value)
    .toLowerCase()
    .replace(/[.'’`]/g, "")
    .replace(/[^a-z0-9ঀ-৿]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "B Sc" / "M A" are the same degree as "B.Sc" / "M.A" once the dots are gone. */
function joinDegreeInitials(normalized: string): string {
  return normalized.replace(/(^|\s)([bm])\s(sc|a|ba|ss|com|tech|ed|phil|bs)(?=\s|$)/g, "$1$2$3");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Whole-token containment. `\b` is ASCII-only, so it cannot delimit Bengali;
 * matching against the space-separated normalized form works for both scripts
 * and stops "BA" from matching inside "BANGLA".
 */
function hasPhrase(normalized: string, phrase: string): boolean {
  if (!normalized || !phrase) return false;
  if (/[^a-z0-9 ]/.test(phrase)) return normalized.includes(phrase);
  return new RegExp(`(?:^|\\s)${escapeRegExp(phrase)}(?=\\s|$)`).test(normalized);
}

function hasAnyPhrase(normalized: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => hasPhrase(normalized, phrase));
}

/* ----------------------------------------------------------------- gender */

const MALE_TOKENS = ["m", "male", "man", "পুরুষ"] as const;
const FEMALE_TOKENS = ["f", "female", "woman", "মহিলা", "নারী"] as const;

/** Empty → null; a recognised token → male/female; anything else stated → other. */
export function normalizeGender(value: unknown): Gender | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  // Female is tested first purely as belt-and-braces; token matching already
  // prevents "female" from being read as "male".
  if (hasAnyPhrase(normalized, FEMALE_TOKENS)) return "female";
  if (hasAnyPhrase(normalized, MALE_TOKENS)) return "male";
  return "other";
}

/* -------------------------------------------------------------------- dob */

const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, febr: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const MIN_PLAUSIBLE_AGE = 14;
const MAX_PLAUSIBLE_AGE = 75;

function isRealDate(year: number, month: number, day: number): boolean {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

function ageOn(year: number, month: number, day: number, today: Date): number {
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age -= 1;
  return age;
}

function isoOrNull(year: number, month: number, day: number, today: Date): string | null {
  if (!isRealDate(year, month, day)) return null;
  const age = ageOn(year, month, day, today);
  if (age < MIN_PLAUSIBLE_AGE || age > MAX_PLAUSIBLE_AGE) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Accepts DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, "15 Jan 1990", "January 15, 1990"
 * and a bare year. Ambiguous numeric dates are read day-first (Bangladeshi
 * convention) and only fall back to month-first when day-first is impossible.
 * Returns null when the date is invalid or the implied age is implausible.
 */
export function parseDateOfBirth(value: unknown, today: Date = new Date()): string | null {
  let text = asText(value);
  if (!text) return null;

  // Drop a leading label ("DOB: 15/01/1990") without touching ISO timestamps.
  const labelled = text.match(/^[^0-9:]*:\s*(.+)$/);
  if (labelled) text = labelled[1].trim();

  // YYYY-MM-DD (also YYYY/MM/DD), with or without a trailing time part.
  const iso = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?![\d])/);
  if (iso) return isoOrNull(Number(iso[1]), Number(iso[2]), Number(iso[3]), today);

  // DD/MM/YYYY — day-first, month-first only as a fallback.
  const numeric = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (numeric) {
    const a = Number(numeric[1]);
    const b = Number(numeric[2]);
    const year = Number(numeric[3]);
    return isoOrNull(year, b, a, today) ?? isoOrNull(year, a, b, today);
  }

  // 15 Jan 1990 / 15th January, 1990
  const dayFirst = text.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s.,-]+([a-z]+)[\s.,-]+(\d{4})$/i);
  if (dayFirst) {
    const month = MONTHS[dayFirst[2].toLowerCase()];
    if (month) return isoOrNull(Number(dayFirst[3]), month, Number(dayFirst[1]), today);
    return null;
  }

  // January 15, 1990 / Jan 15 1990
  const monthFirst = text.match(/^([a-z]+)[\s.,-]+(\d{1,2})(?:st|nd|rd|th)?[\s.,-]+(\d{4})$/i);
  if (monthFirst) {
    const month = MONTHS[monthFirst[1].toLowerCase()];
    if (month) return isoOrNull(Number(monthFirst[3]), month, Number(monthFirst[2]), today);
    return null;
  }

  // Bare year — anchored to 1 January, which is all the CV actually says.
  const yearOnly = text.match(/^(\d{4})$/);
  if (yearOnly) return isoOrNull(Number(yearOnly[1]), 1, 1, today);

  return null;
}

/* -------------------------------------------------------------- education */

/** Ordered highest → lowest, so the first rule that matches is the winner. */
const EDUCATION_RULES: ReadonlyArray<{ level: EducationLevel; phrases: readonly string[] }> = [
  {
    level: "masters",
    phrases: ["ma", "msc", "mba", "mss", "mcom", "ms", "mphil", "masters", "master", "kamil"],
  },
  {
    level: "bachelor",
    phrases: [
      "ba", "bsc", "bba", "bss", "bcom", "llb", "btech", "beng", "mbbs",
      "honours", "honors", "hons", "bachelors", "bachelor", "fazil",
    ],
  },
  { level: "diploma", phrases: ["diploma", "polytechnic"] },
  { level: "hsc", phrases: ["hsc", "higher secondary", "intermediate", "alim", "a level", "alevel"] },
  {
    level: "ssc",
    phrases: ["ssc", "secondary school certificate", "matric", "matriculation", "dakhil", "o level", "olevel"],
  },
  {
    level: "below_ssc",
    phrases: [
      "jsc", "jdc", "psc", "primary",
      "class 5", "class 6", "class 7", "class 8", "class 9",
      "eight pass", "five pass",
    ],
  },
];

/** "MS Office" in a major must not be read as a Master of Science. */
const MS_FALSE_FRIENDS = ["office", "word", "excel", "powerpoint", "access"] as const;

function educationText(record: unknown): string {
  const r = (record ?? {}) as Partial<EducationRecord>;
  return joinDegreeInitials(normalizeText(`${asText(r.degree)} ${asText(r.qualificationName)} ${asText(r.major)}`));
}

function levelOf(normalized: string): EducationLevel | null {
  if (!normalized) return null;
  for (const rule of EDUCATION_RULES) {
    const phrases =
      rule.level === "masters" && hasAnyPhrase(normalized, MS_FALSE_FRIENDS)
        ? rule.phrases.filter((p) => p !== "ms")
        : rule.phrases;
    if (hasAnyPhrase(normalized, phrases)) return rule.level;
  }
  // A qualification we cannot rank is still a qualification.
  return "other";
}

const MADRASA_PHRASES = ["dakhil", "alim", "fazil", "kamil", "madrasa", "madrasah", "madrasha", "madrassa"] as const;
const EQUIVALENT_PHRASES = ["o level", "olevel", "a level", "alevel", "ged", "equivalent"] as const;

function boardOf(normalized: string): EducationBoard {
  if (hasAnyPhrase(normalized, MADRASA_PHRASES)) return "madrasa";
  if (hasPhrase(normalized, "vocational")) return "vocational";
  if (hasAnyPhrase(normalized, ["technical", "polytechnic"])) return "technical";
  if (hasAnyPhrase(normalized, EQUIVALENT_PHRASES)) return "equivalent";
  return "general";
}

/**
 * Scans every education record and keeps the highest level by
 * `EDUCATION_LEVEL_RANK`; the board is read off the winning record only.
 * Dakhil → ssc/madrasa and Alim → hsc/madrasa fall out of these rules.
 */
export function normalizeEducation(records: unknown): {
  level: EducationLevel | null;
  board: EducationBoard | null;
} {
  let level: EducationLevel | null = null;
  let board: EducationBoard | null = null;
  let bestRank = -1;

  for (const record of asArray(records)) {
    const degreeText = educationText(record);
    const candidate = levelOf(degreeText);
    if (!candidate) continue;

    const rank = EDUCATION_LEVEL_RANK[candidate];
    if (rank <= bestRank) continue;

    const r = (record ?? {}) as Partial<EducationRecord>;
    bestRank = rank;
    level = candidate;
    board = boardOf(`${degreeText} ${normalizeText(r.board)}`.trim());
  }

  return { level, board };
}

/* ------------------------------------------------------------- profession */

/** Ordered: the first profession whose keywords appear wins. */
const PROFESSION_RULES: ReadonlyArray<{ profession: Profession; phrases: readonly string[] }> = [
  { profession: "driver", phrases: ["driver", "drivers", "driving", "chauffeur", "ড্রাইভার"] },
  { profession: "security_guard", phrases: ["security guard", "security", "guard", "watchman", "ansar"] },
  { profession: "housekeeper", phrases: ["housekeeper", "house keeper", "housekeeping", "house keeping", "maid", "housemaid", "house maid", "domestic help", "domestic worker"] },
  { profession: "cleaner", phrases: ["cleaner", "cleaning", "sweeper", "janitor"] },
  { profession: "electrician", phrases: ["electrician"] },
  { profession: "welder", phrases: ["welder", "welding"] },
  { profession: "technician", phrases: ["technician", "mechanic", "fitter"] },
  { profession: "cook", phrases: ["cook", "chef", "baburchi"] },
  { profession: "mason", phrases: ["mason", "rajmistri"] },
  { profession: "plumber", phrases: ["plumber", "plumbing"] },
  { profession: "carpenter", phrases: ["carpenter"] },
  { profession: "supervisor", phrases: ["supervisor", "foreman"] },
  { profession: "office_staff", phrases: ["office staff", "office assistant", "office boy", "clerk", "peon"] },
  { profession: "helper", phrases: ["helper", "labour", "labourer", "laborer", "labor"] },
];

/** Empty designation → null; a stated designation we cannot place → "other". */
export function normalizeProfession(value: unknown): Profession | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  for (const rule of PROFESSION_RULES) {
    if (hasAnyPhrase(normalized, rule.phrases)) return rule.profession;
  }
  return "other";
}

/* ------------------------------------------------------------- experience */

/**
 * Derives total experience in years from duration strings like "2016 - 2020",
 * "2021 - Present" and "Jan 2016 to Dec 2019". Returns null (never 0) when
 * nothing can be derived, so "unknown" stays distinguishable from "fresher".
 */
export function deriveExperienceYears(expArray: unknown): number | null {
  if (!Array.isArray(expArray) || expArray.length === 0) return null;

  let total = 0;
  const currentYear = new Date().getFullYear();

  for (const exp of expArray) {
    const record = (exp ?? {}) as Record<string, unknown>;
    const explicit = asText(record.duration);
    const end = asText(record.endDate) || (record.isCurrent === true ? "Present" : "");
    const duration = explicit || `${asText(record.startDate)} - ${end}`;

    const m = duration.match(
      /(\d{4})\s*(?:[-–—]|to|till|until)+\s*(?:[a-z]{3,9}\.?,?\s*)?(\d{4}|present|current|now|ongoing)/i
    );
    if (!m) continue;

    const start = parseInt(m[1], 10);
    const finish = /\d{4}/.test(m[2]) ? parseInt(m[2], 10) : currentYear;
    if (finish >= start && finish - start < 60) total += finish - start;
  }

  return total > 0 ? total : null;
}

/* --------------------------------------------------------------- location */

/**
 * Every searchable district name — canonical label, slug and known alternate
 * spellings — longest first, so "Cox's Bazar" is never shadowed by a shorter
 * name that happens to overlap.
 */
const DISTRICT_NAMES: ReadonlyArray<{ name: string; district: string }> = (() => {
  const seen = new Map<string, string>();
  for (const district of DISTRICTS) {
    for (const raw of [district.label, district.value, ...(district.aliases ?? [])]) {
      const name = normalizeText(raw);
      if (name && !seen.has(name)) seen.set(name, district.value);
    }
  }
  return Array.from(seen, ([name, district]) => ({ name, district })).sort((a, b) => b.name.length - a.name.length);
})();

/**
 * Searches each text in the order given and returns the first district found,
 * with its division looked up from `DISTRICT_TO_DIVISION`. Both are null when
 * no district name appears.
 */
export function matchDistrict(...texts: unknown[]): { district: string | null; division: Division | null } {
  for (const text of texts) {
    const normalized = normalizeText(text);
    if (!normalized) continue;
    for (const entry of DISTRICT_NAMES) {
      if (hasPhrase(normalized, entry.name)) {
        return { district: entry.district, division: DISTRICT_TO_DIVISION[entry.district] ?? null };
      }
    }
  }
  return { district: null, division: null };
}

/* --------------------------------------------------------------- training */

const TRAINING_RULES: ReadonlyArray<{ type: TrainingType; phrases: readonly string[] }> = [
  { type: "driving", phrases: ["driving", "drivers licence", "drivers license", "driving licence", "driving license"] },
  { type: "safety", phrases: ["safety", "fire", "firefighting", "fire fighting", "first aid", "osha", "hse"] },
  { type: "technical", phrases: ["technical", "electrical", "welding", "mechanical", "plumbing"] },
  { type: "computer", phrases: ["computer", "ms office", "microsoft office", "it", "ict", "typing", "database"] },
];

function classifyTraining(entry: string): TrainingType | null {
  const normalized = normalizeText(entry);
  if (!normalized) return null;
  for (const rule of TRAINING_RULES) {
    if (hasAnyPhrase(normalized, rule.phrases)) return rule.type;
  }
  return null;
}

/**
 * Scans trainings, certifications, skills and the driving-licence field.
 * A stated training or certification we cannot classify still counts as
 * "other"; a bare skill does not, or every candidate would look trained.
 */
export function detectTraining(other: unknown): { isTrained: boolean; trainingTypes: TrainingType[] } {
  const o = (other ?? {}) as Partial<OtherDetails>;
  const found = new Set<TrainingType>();

  for (const entry of [...asArray(o.trainings), ...asArray(o.certifications)]) {
    const text = asText(entry);
    if (!text) continue;
    found.add(classifyTraining(text) ?? "other");
  }

  for (const entry of asArray(o.skills)) {
    const type = classifyTraining(asText(entry));
    if (type) found.add(type);
  }

  if (asText(o.drivingLicense)) found.add("driving");

  const trainingTypes = TRAINING_TYPES.filter((t) => found.has(t.value)).map((t) => t.value);
  return { isTrained: trainingTypes.length > 0, trainingTypes };
}

/* ------------------------------------------------------------- cv quality */

/**
 * A document counts as an attached CV when it carries a link *or* a file name.
 * `profileFromEmployeeRow` only emits a document at all when the row has a
 * `cv_file_name`, and on the legacy branch it hard-codes `fileUrl: ""` — keying
 * on the URL alone would report "CV not available" for every seed row that
 * plainly has one.
 */
function isAttachedFile(doc: unknown): boolean {
  const d = (doc ?? {}) as { fileUrl?: unknown; originalFileName?: unknown };
  return asText(d.fileUrl) !== "" || asText(d.originalFileName) !== "";
}

/** Never returns "verified" — that is a human judgement, set by an admin. */
export function assessCvQuality(profile: unknown): CvQuality {
  const p = (profile ?? {}) as Partial<FullEmployeeProfile>;

  if (p.status === "review_required") return "needs_review";

  if (!asArray(p.attachedDocuments).some(isAttachedFile)) return "not_available";

  const complete =
    asText(p.name) !== "" &&
    asText(p.phone) !== "" &&
    asArray(p.educationalQualifications).length > 0 &&
    asArray(p.workExperience).length > 0;

  return complete ? "good" : "needs_review";
}

/* ---------------------------------------------------------------- profile */

const EMPTY_FIELDS: CandidateSearchFields = {
  gender: null,
  dateOfBirth: null,
  educationLevel: null,
  educationBoard: null,
  profession: null,
  professionRaw: null,
  experienceYears: null,
  division: null,
  district: null,
  isTrained: false,
  trainingTypes: [],
  cvQuality: null,
};

/**
 * Turns a profile into the flat, filterable columns. Total by construction:
 * every helper tolerates missing data, and the outer guard turns any
 * unexpected failure into an all-null row rather than a broken save.
 */
export function normalizeProfile(profile: FullEmployeeProfile): CandidateSearchFields {
  try {
    const p = (profile ?? {}) as Partial<FullEmployeeProfile>;
    const personal = (p.personalInformation ?? {}) as Partial<FullEmployeeProfile["personalInformation"]>;
    const employment = (p.employmentDetails ?? {}) as Partial<FullEmployeeProfile["employmentDetails"]>;

    const designation = asText(p.designation) || asText(employment.currentDesignation);
    const education = normalizeEducation(p.educationalQualifications);
    const location = matchDistrict(
      personal.permanentAddress,
      personal.presentAddress,
      personal.district,
      personal.city
    );
    const training = detectTraining(p.otherDetails);

    return {
      gender: normalizeGender(personal.gender),
      dateOfBirth: parseDateOfBirth(personal.dob),
      educationLevel: education.level,
      educationBoard: education.board,
      profession: normalizeProfession(designation),
      professionRaw: designation || null,
      experienceYears: deriveExperienceYears(p.workExperience),
      division: location.division,
      district: location.district,
      isTrained: training.isTrained,
      trainingTypes: training.trainingTypes,
      cvQuality: assessCvQuality(p),
    };
  } catch (e: any) {
    // Reaching here is a bug in the normalizer, not an unmappable CV, so it is
    // reported rather than swallowed — the row still degrades to all-null.
    console.warn("candidate-normalizer notice:", e?.message || e);
    return { ...EMPTY_FIELDS, trainingTypes: [] };
  }
}

/** snake_case patch for the `employees` row, ready to hand to `.upsert()`. */
export function toSearchColumns(fields: CandidateSearchFields): Record<string, unknown> {
  return {
    gender: fields.gender,
    date_of_birth: fields.dateOfBirth,
    education_level: fields.educationLevel,
    education_board: fields.educationBoard,
    profession: fields.profession,
    profession_raw: fields.professionRaw,
    experience_years: fields.experienceYears,
    division: fields.division,
    district: fields.district,
    is_trained: fields.isTrained,
    training_types: fields.trainingTypes,
    cv_quality: fields.cvQuality,
    search_indexed_at: new Date().toISOString(),
  };
}
