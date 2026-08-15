/**
 * Canonical option lists for candidate search.
 *
 * Every filterable enum lives here so the normalizer, the query builder, the
 * API validator and the UI all agree on the exact same set of values. The
 * stored value is always the `value` slug; `label` is display-only.
 */

export interface FilterOption {
  value: string;
  label: string;
}

/* ------------------------------------------------------------------ gender */

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other / Not Specified" },
] as const satisfies readonly FilterOption[];

export type Gender = (typeof GENDERS)[number]["value"];

/* --------------------------------------------------------------- education */

/** Ordered lowest → highest. The normalizer keeps the highest match. */
export const EDUCATION_LEVELS = [
  { value: "below_ssc", label: "Below SSC" },
  { value: "ssc", label: "SSC" },
  { value: "hsc", label: "HSC" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelor", label: "Bachelor" },
  { value: "masters", label: "Masters" },
  { value: "other", label: "Other" },
] as const satisfies readonly FilterOption[];

export type EducationLevel = (typeof EDUCATION_LEVELS)[number]["value"];

/** Rank used to pick the highest qualification. `other` never wins. */
export const EDUCATION_LEVEL_RANK: Record<EducationLevel, number> = {
  other: 0,
  below_ssc: 1,
  ssc: 2,
  hsc: 3,
  diploma: 4,
  bachelor: 5,
  masters: 6,
};

export const EDUCATION_BOARDS = [
  { value: "general", label: "General" },
  { value: "vocational", label: "Vocational" },
  { value: "madrasa", label: "Madrasa" },
  { value: "technical", label: "Technical" },
  { value: "equivalent", label: "Equivalent" },
] as const satisfies readonly FilterOption[];

export type EducationBoard = (typeof EDUCATION_BOARDS)[number]["value"];

/* ------------------------------------------------------------ job category */

export const MANPOWER_CATEGORIES = [
  { value: "contractual", label: "Contractual" },
  { value: "regular", label: "Regular" },
  { value: "manpower", label: "Manpower" },
  { value: "young_manpower", label: "Young Manpower" },
  { value: "temporary", label: "Temporary" },
  { value: "part_time", label: "Part-time" },
  { value: "full_time", label: "Full-time" },
] as const satisfies readonly FilterOption[];

export type ManpowerCategory = (typeof MANPOWER_CATEGORIES)[number]["value"];

/* -------------------------------------------------------------- profession */

export const PROFESSIONS = [
  { value: "driver", label: "Driver" },
  { value: "housekeeper", label: "Housekeeper" },
  { value: "security_guard", label: "Security Guard" },
  { value: "cleaner", label: "Cleaner" },
  { value: "office_staff", label: "Office Staff" },
  { value: "technician", label: "Technician" },
  { value: "electrician", label: "Electrician" },
  { value: "welder", label: "Welder" },
  { value: "cook", label: "Cook" },
  { value: "mason", label: "Mason" },
  { value: "plumber", label: "Plumber" },
  { value: "carpenter", label: "Carpenter" },
  { value: "helper", label: "Helper" },
  { value: "supervisor", label: "Supervisor" },
  { value: "other", label: "Other" },
] as const satisfies readonly FilterOption[];

export type Profession = (typeof PROFESSIONS)[number]["value"];

/* -------------------------------------------------------------- department */

export const DEPARTMENTS = [
  { value: "hr", label: "HR" },
  { value: "admin", label: "Admin" },
  { value: "accounts", label: "Accounts" },
  { value: "sales", label: "Sales" },
  { value: "it", label: "IT" },
  { value: "operations", label: "Operations" },
  { value: "production", label: "Production" },
  { value: "security", label: "Security" },
  { value: "logistics", label: "Logistics" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
] as const satisfies readonly FilterOption[];

export type Department = (typeof DEPARTMENTS)[number]["value"];

/* --------------------------------------------------------------- work type */

export const WORK_TYPES = [
  { value: "physical", label: "Physical / On-site" },
  { value: "online", label: "Online / Remote" },
  { value: "hybrid", label: "Hybrid" },
] as const satisfies readonly FilterOption[];

export type WorkType = (typeof WORK_TYPES)[number]["value"];

/* ------------------------------------------------------------------- shift */

export const SHIFTS = [
  { value: "day", label: "Day Shift" },
  { value: "night", label: "Night Shift" },
  { value: "morning", label: "Morning" },
  { value: "evening", label: "Evening" },
  { value: "rotational", label: "Rotational" },
  { value: "flexible", label: "Flexible" },
] as const satisfies readonly FilterOption[];

export type Shift = (typeof SHIFTS)[number]["value"];

/* ---------------------------------------------------------------- training */

export const TRAINING_TYPES = [
  { value: "driving", label: "Driving Training" },
  { value: "safety", label: "Safety Training" },
  { value: "technical", label: "Technical Training" },
  { value: "computer", label: "Computer Training" },
  { value: "other", label: "Other Training" },
] as const satisfies readonly FilterOption[];

export type TrainingType = (typeof TRAINING_TYPES)[number]["value"];

/* -------------------------------------------------------------- cv quality */

export const CV_QUALITIES = [
  { value: "good", label: "Good CV" },
  { value: "verified", label: "Verified CV" },
  { value: "needs_review", label: "Needs Review" },
  { value: "not_available", label: "CV Not Available" },
] as const satisfies readonly FilterOption[];

export type CvQuality = (typeof CV_QUALITIES)[number]["value"];

/* ------------------------------------------------------------ availability */

export const AVAILABILITIES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "available", label: "Available for New Project" },
  { value: "assigned", label: "Currently Assigned" },
] as const satisfies readonly FilterOption[];

export type Availability = (typeof AVAILABILITIES)[number]["value"];

/* ------------------------------------------------------------------ sector */

export const SECTORS = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "ngo", label: "NGO" },
  { value: "other", label: "Other" },
] as const satisfies readonly FilterOption[];

export type Sector = (typeof SECTORS)[number]["value"];

/* -------------------------------------------------------------- experience */

/** Convenience presets; the panel also accepts a custom min/max. */
export const EXPERIENCE_PRESETS = [
  { value: "fresher", label: "Fresher", min: 0, max: 0 },
  { value: "1_2", label: "1–2 years", min: 1, max: 2 },
  { value: "3_5", label: "3–5 years", min: 3, max: 5 },
  { value: "5_plus", label: "5+ years", min: 5, max: undefined },
] as const;

/* ---------------------------------------------------------------- location */

export const DIVISIONS = [
  { value: "barishal", label: "Barishal" },
  { value: "chattogram", label: "Chattogram" },
  { value: "dhaka", label: "Dhaka" },
  { value: "khulna", label: "Khulna" },
  { value: "mymensingh", label: "Mymensingh" },
  { value: "rajshahi", label: "Rajshahi" },
  { value: "rangpur", label: "Rangpur" },
  { value: "sylhet", label: "Sylhet" },
] as const satisfies readonly FilterOption[];

export type Division = (typeof DIVISIONS)[number]["value"];

/**
 * All 64 districts keyed by slug. `aliases` carries the older/alternate English
 * spellings *and* the standard Bengali name that still appear in CVs, so address
 * matching finds them. Bengali aliases matter most in practice: CVs sourced from
 * scanned Bengali biodata forms (see docs/superpowers/specs/2026-08-12-scanned-pdf-ocr-design.md)
 * never contain the English district name at all.
 */
export const DISTRICTS: ReadonlyArray<{
  value: string;
  label: string;
  division: Division;
  aliases?: readonly string[];
}> = [
  // Barishal (6)
  { value: "barguna", label: "Barguna", division: "barishal", aliases: ["বরগুনা"] },
  { value: "barishal", label: "Barishal", division: "barishal", aliases: ["barisal", "বরিশাল"] },
  { value: "bhola", label: "Bhola", division: "barishal", aliases: ["ভোলা"] },
  { value: "jhalokati", label: "Jhalokati", division: "barishal", aliases: ["jhalakati", "jhalokathi", "ঝালকাঠি"] },
  { value: "patuakhali", label: "Patuakhali", division: "barishal", aliases: ["পটুয়াখালী"] },
  { value: "pirojpur", label: "Pirojpur", division: "barishal", aliases: ["পিরোজপুর"] },

  // Chattogram (11)
  { value: "bandarban", label: "Bandarban", division: "chattogram", aliases: ["বান্দরবান"] },
  { value: "brahmanbaria", label: "Brahmanbaria", division: "chattogram", aliases: ["b baria", "b.baria", "ব্রাহ্মণবাড়িয়া"] },
  { value: "chandpur", label: "Chandpur", division: "chattogram", aliases: ["চাঁদপুর"] },
  { value: "chattogram", label: "Chattogram", division: "chattogram", aliases: ["chittagong", "ctg", "চট্টগ্রাম"] },
  { value: "cumilla", label: "Cumilla", division: "chattogram", aliases: ["comilla", "কুমিল্লা"] },
  { value: "coxs_bazar", label: "Cox's Bazar", division: "chattogram", aliases: ["cox's bazar", "coxs bazar", "cox bazar", "কক্সবাজার"] },
  { value: "feni", label: "Feni", division: "chattogram", aliases: ["ফেনী"] },
  { value: "khagrachhari", label: "Khagrachhari", division: "chattogram", aliases: ["khagrachari", "খাগড়াছড়ি"] },
  { value: "lakshmipur", label: "Lakshmipur", division: "chattogram", aliases: ["laxmipur", "lakshmipur", "লক্ষ্মীপুর"] },
  { value: "noakhali", label: "Noakhali", division: "chattogram", aliases: ["নোয়াখালী"] },
  { value: "rangamati", label: "Rangamati", division: "chattogram", aliases: ["রাঙ্গামাটি"] },

  // Dhaka (13)
  { value: "dhaka", label: "Dhaka", division: "dhaka", aliases: ["dacca", "ঢাকা"] },
  { value: "faridpur", label: "Faridpur", division: "dhaka", aliases: ["ফরিদপুর"] },
  { value: "gazipur", label: "Gazipur", division: "dhaka", aliases: ["গাজীপুর"] },
  { value: "gopalganj", label: "Gopalganj", division: "dhaka", aliases: ["গোপালগঞ্জ"] },
  { value: "kishoreganj", label: "Kishoreganj", division: "dhaka", aliases: ["kishorganj", "কিশোরগঞ্জ"] },
  { value: "madaripur", label: "Madaripur", division: "dhaka", aliases: ["মাদারীপুর"] },
  { value: "manikganj", label: "Manikganj", division: "dhaka", aliases: ["manikgonj", "মানিকগঞ্জ"] },
  { value: "munshiganj", label: "Munshiganj", division: "dhaka", aliases: ["munsiganj", "munshigonj", "মুন্সিগঞ্জ"] },
  { value: "narayanganj", label: "Narayanganj", division: "dhaka", aliases: ["narayangonj", "নারায়ণগঞ্জ"] },
  { value: "narsingdi", label: "Narsingdi", division: "dhaka", aliases: ["norsingdi", "নরসিংদী"] },
  { value: "rajbari", label: "Rajbari", division: "dhaka", aliases: ["রাজবাড়ী"] },
  { value: "shariatpur", label: "Shariatpur", division: "dhaka", aliases: ["shariyatpur", "শরীয়তপুর", "শরিয়তপুর"] },
  { value: "tangail", label: "Tangail", division: "dhaka", aliases: ["টাঙ্গাইল"] },

  // Khulna (10)
  { value: "bagerhat", label: "Bagerhat", division: "khulna", aliases: ["বাগেরহাট"] },
  { value: "chuadanga", label: "Chuadanga", division: "khulna", aliases: ["চুয়াডাঙ্গা"] },
  { value: "jashore", label: "Jashore", division: "khulna", aliases: ["jessore", "যশোর"] },
  { value: "jhenaidah", label: "Jhenaidah", division: "khulna", aliases: ["jhenidah", "jhinaidah", "ঝিনাইদহ"] },
  { value: "khulna", label: "Khulna", division: "khulna", aliases: ["খুলনা"] },
  { value: "kushtia", label: "Kushtia", division: "khulna", aliases: ["kustia", "কুষ্টিয়া"] },
  { value: "magura", label: "Magura", division: "khulna", aliases: ["মাগুরা"] },
  { value: "meherpur", label: "Meherpur", division: "khulna", aliases: ["মেহেরপুর"] },
  { value: "narail", label: "Narail", division: "khulna", aliases: ["নড়াইল"] },
  { value: "satkhira", label: "Satkhira", division: "khulna", aliases: ["shatkhira", "সাতক্ষীরা"] },

  // Mymensingh (4)
  { value: "jamalpur", label: "Jamalpur", division: "mymensingh", aliases: ["জামালপুর"] },
  { value: "mymensingh", label: "Mymensingh", division: "mymensingh", aliases: ["ময়মনসিংহ"] },
  { value: "netrokona", label: "Netrokona", division: "mymensingh", aliases: ["netrakona", "নেত্রকোণা"] },
  { value: "sherpur", label: "Sherpur", division: "mymensingh", aliases: ["শেরপুর"] },

  // Rajshahi (8)
  { value: "bogura", label: "Bogura", division: "rajshahi", aliases: ["bogra", "বগুড়া"] },
  { value: "chapainawabganj", label: "Chapainawabganj", division: "rajshahi", aliases: ["chapai nawabganj", "nawabganj", "চাঁপাইনবাবগঞ্জ"] },
  { value: "joypurhat", label: "Joypurhat", division: "rajshahi", aliases: ["jaipurhat", "জয়পুরহাট"] },
  { value: "naogaon", label: "Naogaon", division: "rajshahi", aliases: ["নওগাঁ"] },
  { value: "natore", label: "Natore", division: "rajshahi", aliases: ["নাটোর"] },
  { value: "pabna", label: "Pabna", division: "rajshahi", aliases: ["পাবনা"] },
  { value: "rajshahi", label: "Rajshahi", division: "rajshahi", aliases: ["রাজশাহী"] },
  { value: "sirajganj", label: "Sirajganj", division: "rajshahi", aliases: ["serajganj", "sirajgonj", "সিরাজগঞ্জ"] },

  // Rangpur (8)
  { value: "dinajpur", label: "Dinajpur", division: "rangpur", aliases: ["দিনাজপুর"] },
  { value: "gaibandha", label: "Gaibandha", division: "rangpur", aliases: ["গাইবান্ধা"] },
  { value: "kurigram", label: "Kurigram", division: "rangpur", aliases: ["কুড়িগ্রাম"] },
  { value: "lalmonirhat", label: "Lalmonirhat", division: "rangpur", aliases: ["লালমনিরহাট"] },
  { value: "nilphamari", label: "Nilphamari", division: "rangpur", aliases: ["নীলফামারী"] },
  { value: "panchagarh", label: "Panchagarh", division: "rangpur", aliases: ["panchagor", "পঞ্চগড়"] },
  { value: "rangpur", label: "Rangpur", division: "rangpur", aliases: ["রংপুর"] },
  { value: "thakurgaon", label: "Thakurgaon", division: "rangpur", aliases: ["ঠাকুরগাঁও"] },

  // Sylhet (4)
  { value: "habiganj", label: "Habiganj", division: "sylhet", aliases: ["hobiganj", "হবিগঞ্জ"] },
  { value: "moulvibazar", label: "Moulvibazar", division: "sylhet", aliases: ["maulvibazar", "moulavibazar", "মৌলভীবাজার"] },
  { value: "sunamganj", label: "Sunamganj", division: "sylhet", aliases: ["sunamgonj", "সুনামগঞ্জ"] },
  { value: "sylhet", label: "Sylhet", division: "sylhet", aliases: ["সিলেট"] },
];

export const DISTRICT_TO_DIVISION: Record<string, Division> = Object.fromEntries(
  DISTRICTS.map((d) => [d.value, d.division])
) as Record<string, Division>;

export function districtsInDivision(division?: string) {
  if (!division) return DISTRICTS;
  return DISTRICTS.filter((d) => d.division === division);
}

/* ------------------------------------------------------------- validation */

const valuesOf = (options: readonly FilterOption[]) => new Set(options.map((o) => o.value));

/** Allowed values per column, used to validate bulk-assign payloads server-side. */
export const ALLOWED_VALUES = {
  gender: valuesOf(GENDERS),
  education_level: valuesOf(EDUCATION_LEVELS),
  education_board: valuesOf(EDUCATION_BOARDS),
  manpower_category: valuesOf(MANPOWER_CATEGORIES),
  profession: valuesOf(PROFESSIONS),
  department: valuesOf(DEPARTMENTS),
  work_type: valuesOf(WORK_TYPES),
  shift: valuesOf(SHIFTS),
  training_types: valuesOf(TRAINING_TYPES),
  cv_quality: valuesOf(CV_QUALITIES),
  availability: valuesOf(AVAILABILITIES),
  sector: valuesOf(SECTORS),
  division: valuesOf(DIVISIONS),
  district: new Set(DISTRICTS.map((d) => d.value)),
} as const;

/** Operational columns an admin may set through bulk assign. */
export const BULK_ASSIGNABLE_FIELDS = [
  "manpower_category",
  "work_type",
  "shift",
  "availability",
  "sector",
  "project_id",
] as const;

export type BulkAssignableField = (typeof BULK_ASSIGNABLE_FIELDS)[number];
