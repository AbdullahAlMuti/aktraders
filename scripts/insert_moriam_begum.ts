import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { FullEmployeeProfile } from "../types/employee.types";
import { employeeRowFromProfile } from "../lib/db-schema";
import { normalizeProfile, toSearchColumns } from "../lib/candidate-normalizer";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kvddegdgvdzldlwslvre.supabase.co";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey!, {
  global: { fetch: (url: any, init: any = {}) => fetch(url, { ...init, cache: "no-store" }) },
});

const candidateProfile: FullEmployeeProfile = {
  id: "EMP-000006",
  employeeId: "EMP-000006",
  applicantId: "APP-000006",
  cvNumber: "CV-000006",
  name: "Mst. Moriam Begum (মোসাঃ মরিয়ম বেগম)",
  email: "moriam.begum@aktraders.com",
  phone: "01967440359",
  department: "Housekeeping & Facilities",
  designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
  organization: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
  status: "active",
  joiningDate: "2023-07-01",
  avatarUrl: "/uploads/photos/photo_moriam_begum.jpg",
  cvCount: 3,
  personalInformation: {
    fullName: "Mst. Moriam Begum (মোসাঃ মরিয়ম বেগম)",
    photoUrl: "/uploads/photos/photo_moriam_begum.jpg",
    gender: "female",
    dob: "1987-04-01",
    age: 36,
    nationality: "Bangladeshi",
    maritalStatus: "Married",
    religion: "Islam",
    nid: "2616882293871",
    phone: "01967440359",
    email: "moriam.begum@aktraders.com",
    presentAddress: "বাসা/হোল্ডিং: ৬, গ্রাম/রাস্তা: মান্ডা, মান্ডা ডাকঘর: মান্ডা - ১২১৪, সবুজবাগ, ঢাকা।",
    permanentAddress: "গ্রাম- লুটেরচর, পোঃ- দাউদকান্দি, উপজেলা- দাউদকান্দি, জেলা- কুমিল্লা।",
    district: "cumilla",
    stateProvince: "chattogram",
    country: "Bangladesh",
    otherSocialLinks: [
      "পিতার নাম: কাসেম বেপারী (Kashem Bepari)",
      "মাতার নাম: রেজিয়া বেগম / মোছাঃ রুজী বেগম (Rezia Begum)",
      "স্বামীর নাম: মো: খোকন (Md. Khokon)",
      "উচ্চতা: ৫ ফুট ৩ ইঞ্চি (5' 3\")",
      "ওজন: ৭০ কেজি (70 kg)",
      "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৭২৮৩",
      "জাতীয় পরিচয়পত্র নম্বর: ২৬১৬৮৮২২৯৩৮৭১",
      "এনআইডি প্রদানের তারিখ: ০৬/০৫/২০০৮",
    ],
  },
  employmentDetails: {
    employeeId: "EMP-000006",
    applicantId: "APP-000006",
    cvNumber: "CV-000006",
    currentStatus: "active",
    currentOrganization: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
    currentDesignation: "Cleaner / পরিচ্ছন্নতাকর্মী",
    department: "Housekeeping & Facilities",
    employmentType: "Full-Time (Outsourced)",
    joiningDate: "2023-07-01",
    totalExperienceYears: 1.1,
    currentLocation: "সবুজবাগ, ঢাকা",
  },
  educationalQualifications: [
    {
      id: "edu-EMP-000006-1",
      degree: "৫ম শ্রেণী (Class 5 Pass)",
      qualificationName: "৫ম শ্রেণী",
      major: "সাধারণ শিক্ষা (General)",
      institution: "স্থানীয় প্রাথমিক বিদ্যালয়, দাউদকান্দি, কুমিল্লা",
      board: "general",
      passingYear: "1998",
      result: "উত্তীর্ণ (Passed)",
    },
  ],
  workExperience: [
    {
      id: "exp-EMP-000006-1",
      organizationName: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
      jobTitle: "Cleaner / পরিচ্ছন্নতাকর্মী",
      designation: "পরিচ্ছন্নতাকর্মী",
      duration: "০১ জুলাই ২০২৩ হতে অদ্যাবধি",
      startDate: "2023-07-01",
      endDate: "",
      isCurrent: true,
      responsibilities: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় সততা ও সুনামের সাথে পরিচ্ছন্নতাকর্মী হিসেবে দায়িত্ব পালন।",
    },
  ],
  attachedDocuments: [
    {
      id: "doc-EMP-000006-1",
      documentId: "CV-000006-1",
      documentType: "original_cv",
      originalFileName: "cv_moriam_begum.pdf",
      fileUrl: "/uploads/cvs/cv_moriam_begum.pdf",
      fileSize: "398 KB",
      mimeType: "application/pdf",
      uploadDate: new Date().toISOString(),
      version: 1,
    },
    {
      id: "doc-EMP-000006-2",
      documentId: "CV-000006-2",
      documentType: "other",
      originalFileName: "NID-2616882293871.jpg",
      fileUrl: "/uploads/photos/photo_moriam_begum.jpg",
      fileSize: "75 KB",
      mimeType: "image/jpeg",
      uploadDate: new Date().toISOString(),
      version: 1,
    },
    {
      id: "doc-EMP-000006-3",
      documentId: "CV-000006-3",
      documentType: "certificate",
      originalFileName: "Dudok_Experience_Moriam_Begum.pdf",
      fileUrl: "/uploads/cvs/cv_moriam_begum.pdf",
      fileSize: "398 KB",
      mimeType: "application/pdf",
      uploadDate: new Date().toISOString(),
      version: 1,
    },
  ],
  otherDetails: {
    skills: [
      "Commercial Cleaning",
      "Office Sanitation",
      "Waste Disposal",
      "Hygiene Maintenance",
      "Facility Care",
      "Team Work",
    ],
    languages: ["Bengali (Native)"],
    certifications: [
      "Anti-Corruption Commission (দুদক) Service Certificate",
    ],
    professionalSummary:
      "দায়িত্বশীল, অভিজ্ঞ এবং নির্ভরযোগ্য পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন (দুদক) প্রধান কার্যালয়ে সততা ও সুনামের সাথে আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতা সেবা প্রদানের প্রমাণিত অভিজ্ঞতা সম্পন্ন।",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const extractedFullText = `জীবন-বৃত্তান্ত
পদের নাম: পরিচ্ছন্নতাকর্মী
০১। নাম: মোসা: মরিয়ম বেগম
০২। পিতা নাম: কাসেম বেপারী
০৩। মাতার নাম: রেজিয়া বেগম
০৪। স্থায়ী ঠিকানা: মান্ডা ডাকঘর, মান্ডা, সবুজবাগ, ঢাকা।
০৫। বর্তমান ঠিকানা: মান্ডা ডাকঘর, মান্ডা, সবুজবাগ, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার: ২৬১৬৮৮২২৯৩৮৭১
০৭। ব্যাংক একাউন্ট নাম্বার: ৪৪৩২১০১০০৭২৮৩
০৮। জন্ম তারিখ: ০১/০৪/১৯৮৭
০৯। বয়স: ৩৬ বছর
১০। জাতীয়তা: বাংলাদেশী
১১। ধর্ম: ইসলাম
১২। বৈবাহিক অবস্থা: বিবাহিত
১৩। উচ্চতা: ৫ ফুট ৩ ইঞ্চি
১৪। ওজন: ৭০ কেজি
১৫। মোবাইল নাম্বার: ০১৯৬৭৪৪০৩৫৯
১৬। শিক্ষাগত যোগ্যতা: ৫ম শ্রেণী
স্বাক্ষর: মরিয়ম

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / জাতীয় পরিচয় পত্র
নাম: মোছা: মরিয়ম বেগম
Name: Mst. Moriam Begum
স্বামী: মো: খোকন
মাতা: মোছা: রুজী বেগম
Date of Birth: 01 Apr 1987
ID NO: 2616882293871
ঠিকানা: বাসা/হোল্ডিং: ৬, গ্রাম/রাস্তা: মান্ডা, মান্ডা, ডাকঘর: মান্ডা - ১২১৪, সবুজবাগ, ঢাকা
প্রদানের তারিখ: ০৬/০৫/২০০৮

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মরিয়ম বেগম, পিতা- কাশেম বেপারী, মাতা- রেজিয়া খাতুন, গ্রাম- লুটেরচর, পোঃ- দাউদকান্দি, উপজেলা- দাউদকান্দি, জেলা- কুমিল্লা দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন। তিনি বাংলাদেশের নাগরিক। আমার জানামতে তিনি উত্তম ও নৈতিক চরিত্রের অধিকারী এবং সমাজ বা রাষ্ট্র বিরোধী কোন প্রকার কাজের সাথে জড়িত নন।
আমি তার সর্বাঙ্গীন উন্নতি ও সাফল্য কামনা করি।
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`;

async function insertCandidate() {
  console.log("=================================================");
  console.log("🚀 Saving Mst. Moriam Begum into Supabase DB");
  console.log("=================================================");

  const baseRow = employeeRowFromProfile(candidateProfile);
  const normalized = normalizeProfile(candidateProfile);
  const searchCols = toSearchColumns(normalized);

  const fullEmployeeRow = {
    ...baseRow,
    ...searchCols,
    gender: "female",
    date_of_birth: "1987-04-01",
    education_level: "below_ssc",
    education_board: "general",
    profession: "cleaner",
    profession_raw: "Cleaner / পরিচ্ছন্নতাকর্মী",
    experience_years: 1.1,
    division: "chattogram",
    district: "cumilla",
    is_trained: true,
    training_types: ["safety", "other"],
    cv_quality: "verified",
    manpower_category: "contractual",
    work_type: "physical",
    shift: "day",
    availability: "active",
    sector: "government",
    search_indexed_at: new Date().toISOString(),
  };

  console.log("Employee row to insert:", {
    id: fullEmployeeRow.id,
    name: fullEmployeeRow.name,
    phone: fullEmployeeRow.phone,
    designation: fullEmployeeRow.designation,
    district: fullEmployeeRow.district,
    division: fullEmployeeRow.division,
    education_level: fullEmployeeRow.education_level,
    profession: fullEmployeeRow.profession,
    experience_years: fullEmployeeRow.experience_years,
    avatar_url: fullEmployeeRow.avatar_url,
  });

  // 1. Upsert into employees table
  const { data: empData, error: empErr } = await supabase
    .from("employees")
    .upsert(fullEmployeeRow, { onConflict: "id" })
    .select();

  if (empErr) {
    console.error("❌ Error inserting into employees table:", empErr);
    throw empErr;
  }
  console.log("✅ Successfully upserted into 'employees' table:", empData);

  // 2. Upsert into cv_records table
  const cvRow = {
    id: `cv-${candidateProfile.employeeId.toLowerCase()}`,
    candidate_name: candidateProfile.name,
    extracted_text: extractedFullText,
    original_file_name: "cv_moriam_begum.pdf",
    original_pdf_url: "/uploads/cvs/cv_moriam_begum.pdf",
    structured_data: candidateProfile,
    avatar_url: candidateProfile.avatarUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: cvData, error: cvErr } = await supabase
    .from("cv_records")
    .upsert(cvRow, { onConflict: "id" })
    .select();

  if (cvErr) {
    console.error("❌ Error inserting into cv_records table:", cvErr);
    throw cvErr;
  }
  console.log("✅ Successfully upserted into 'cv_records' table:", cvData);

  // 3. Verification query
  console.log("\n=================================================");
  console.log("🔍 Verifying ALL Candidates in Supabase DB");
  console.log("=================================================");

  const { data: allEmps } = await supabase
    .from("employees")
    .select("id, name, phone, designation, gender, district, education_level, status, avatar_url")
    .order("id", { ascending: true });

  console.table(allEmps);

  const { data: allCvs } = await supabase
    .from("cv_records")
    .select("id, candidate_name, original_file_name")
    .order("id", { ascending: true });

  console.table(allCvs);

  console.log("\n🎉 Candidate Mst. Moriam Begum successfully extracted and stored in database!");
}

insertCandidate().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
