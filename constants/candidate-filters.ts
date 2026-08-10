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
 * spellings that still appear in CVs, so address matching finds them.
 */
export const DISTRICTS: ReadonlyArray<{
  value: string;
  label: string;
  division: Division;
  aliases?: readonly string[];
}> = [
  // Barishal (6)
  { value: "barguna", label: "Barguna", division: "barishal" },
  { value: "barishal", label: "Barishal", division: "barishal", aliases: ["barisal"] },
  { value: "bhola", label: "Bhola", division: "barishal" },
  { value: "jhalokati", label: "Jhalokati", division: "barishal", aliases: ["jhalakati", "jhalokathi"] },
  { value: "patuakhali", label: "Patuakhali", division: "barishal" },
  { value: "pirojpur", label: "Pirojpur", division: "barishal" },

  // Chattogram (11)
  { value: "bandarban", label: "Bandarban", division: "chattogram" },
  { value: "brahmanbaria", label: "Brahmanbaria", division: "chattogram", aliases: ["b baria", "b.baria"] },
  { value: "chandpur", label: "Chandpur", division: "chattogram" },
  { value: "chattogram", label: "Chattogram", division: "chattogram", aliases: ["chittagong", "ctg"] },
  { value: "cumilla", label: "Cumilla", division: "chattogram", aliases: ["comilla"] },
  { value: "coxs_bazar", label: "Cox's Bazar", division: "chattogram", aliases: ["cox's bazar", "coxs bazar", "cox bazar"] },
  { value: "feni", label: "Feni", division: "chattogram" },
  { value: "khagrachhari", label: "Khagrachhari", division: "chattogram", aliases: ["khagrachari"] },
  { value: "lakshmipur", label: "Lakshmipur", division: "chattogram", aliases: ["laxmipur", "lakshmipur"] },
  { value: "noakhali", label: "Noakhali", division: "chattogram" },
  { value: "rangamati", label: "Rangamati", division: "chattogram" },

  // Dhaka (13)
  { value: "dhaka", label: "Dhaka", division: "dhaka", aliases: ["dacca"] },
  { value: "faridpur", label: "Faridpur", division: "dhaka" },
  { value: "gazipur", label: "Gazipur", division: "dhaka" },
  { value: "gopalganj", label: "Gopalganj", division: "dhaka" },
  { value: "kishoreganj", label: "Kishoreganj", division: "dhaka", aliases: ["kishorganj"] },
  { value: "madaripur", label: "Madaripur", division: "dhaka" },
  { value: "manikganj", label: "Manikganj", division: "dhaka", aliases: ["manikgonj"] },
  { value: "munshiganj", label: "Munshiganj", division: "dhaka", aliases: ["munsiganj", "munshigonj"] },
  { value: "narayanganj", label: "Narayanganj", division: "dhaka", aliases: ["narayangonj"] },
  { value: "narsingdi", label: "Narsingdi", division: "dhaka", aliases: ["norsingdi"] },
  { value: "rajbari", label: "Rajbari", division: "dhaka" },
  { value: "shariatpur", label: "Shariatpur", division: "dhaka", aliases: ["shariyatpur"] },
  { value: "tangail", label: "Tangail", division: "dhaka" },

  // Khulna (10)
  { value: "bagerhat", label: "Bagerhat", division: "khulna" },
  { value: "chuadanga", label: "Chuadanga", division: "khulna" },
  { value: "jashore", label: "Jashore", division: "khulna", aliases: ["jessore"] },
  { value: "jhenaidah", label: "Jhenaidah", division: "khulna", aliases: ["jhenidah", "jhinaidah"] },
  { value: "khulna", label: "Khulna", division: "khulna" },
  { value: "kushtia", label: "Kushtia", division: "khulna", aliases: ["kustia"] },
  { value: "magura", label: "Magura", division: "khulna" },
  { value: "meherpur", label: "Meherpur", division: "khulna" },
  { value: "narail", label: "Narail", division: "khulna" },
  { value: "satkhira", label: "Satkhira", division: "khulna", aliases: ["shatkhira"] },

  // Mymensingh (4)
  { value: "jamalpur", label: "Jamalpur", division: "mymensingh" },
  { value: "mymensingh", label: "Mymensingh", division: "mymensingh" },
  { value: "netrokona", label: "Netrokona", division: "mymensingh", aliases: ["netrakona"] },
  { value: "sherpur", label: "Sherpur", division: "mymensingh" },

  // Rajshahi (8)
  { value: "bogura", label: "Bogura", division: "rajshahi", aliases: ["bogra"] },
  { value: "chapainawabganj", label: "Chapainawabganj", division: "rajshahi", aliases: ["chapai nawabganj", "nawabganj"] },
  { value: "joypurhat", label: "Joypurhat", division: "rajshahi", aliases: ["jaipurhat"] },
  { value: "naogaon", label: "Naogaon", division: "rajshahi" },
  { value: "natore", label: "Natore", division: "rajshahi" },
  { value: "pabna", label: "Pabna", division: "rajshahi" },
  { value: "rajshahi", label: "Rajshahi", division: "rajshahi" },
  { value: "sirajganj", label: "Sirajganj", division: "rajshahi", aliases: ["serajganj", "sirajgonj"] },

  // Rangpur (8)
  { value: "dinajpur", label: "Dinajpur", division: "rangpur" },
  { value: "gaibandha", label: "Gaibandha", division: "rangpur" },
  { value: "kurigram", label: "Kurigram", division: "rangpur" },
  { value: "lalmonirhat", label: "Lalmonirhat", division: "rangpur" },
  { value: "nilphamari", label: "Nilphamari", division: "rangpur" },
  { value: "panchagarh", label: "Panchagarh", division: "rangpur", aliases: ["panchagor"] },
  { value: "rangpur", label: "Rangpur", division: "rangpur" },
  { value: "thakurgaon", label: "Thakurgaon", division: "rangpur" },

  // Sylhet (4)
  { value: "habiganj", label: "Habiganj", division: "sylhet", aliases: ["hobiganj"] },
  { value: "moulvibazar", label: "Moulvibazar", division: "sylhet", aliases: ["maulvibazar", "moulavibazar"] },
  { value: "sunamganj", label: "Sunamganj", division: "sylhet", aliases: ["sunamgonj"] },
  { value: "sylhet", label: "Sylhet", division: "sylhet" },
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
