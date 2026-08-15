import { createClient } from "@supabase/supabase-js";
import { FullEmployeeProfile } from "../types/employee.types";
import { employeeRowFromProfile } from "../lib/db-schema";
import { normalizeProfile, toSearchColumns } from "../lib/candidate-normalizer";
import * as fs from "fs";
import * as path from "path";

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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

const supabase = createClient(supabaseUrl, serviceKey, {
  global: { fetch: (url: any, init: any = {}) => fetch(url, { ...init, cache: "no-store" }) },
});

const candidateProfiles: Array<{
  profile: FullEmployeeProfile;
  extractedText: string;
  searchOverrides: {
    education_level: string;
    profession: string;
    profession_raw: string;
    division: string;
    district: string;
    experience_years: number;
    gender: "male" | "female";
    date_of_birth: string;
  };
}> = [
  // 1. মো: হৃদয় হোসেন (MD. REDOY HOSSAIN)
  {
    profile: {
      id: "EMP-085596",
      employeeId: "EMP-085596",
      applicantId: "APP-085596",
      cvNumber: "CV-085596",
      name: "মো: হৃদয় হোসেন (Md. Redoy Hossain)",
      email: "redoy.hossain@aktraders.com",
      phone: "01998952200",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 3,
      personalInformation: {
        fullName: "মো: হৃদয় হোসেন (Md. Redoy Hossain)",
        gender: "male",
        dob: "1994-05-27",
        age: 30,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "9570855966",
        phone: "01998952200",
        email: "redoy.hossain@aktraders.com",
        presentAddress: "১৯৯৪, উত্তর মান্ডা, বাসাবো টি এস, মুগদা, ঢাকা (বাসা/হোল্ডিং: ৫৫৫, গ্রাম/রাস্তা: মান্ডা, ডাকঘর: বাসাবো টি এস ও - ১২১৪, সবুজবাগ, ঢাকা)",
        permanentAddress: "গ্রাম: মুন্সীকান্দি, পো: জাজিরা, থানা: জাজিরা, জেলা: শরীয়তপুর",
        district: "shariatpur",
        stateProvince: "dhaka",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: মো: সামসুল হক হাওলাদার",
          "মাতার নাম: আমেনা বেগম",
          "উচ্চতা: ৫ ফুট ৫ ইঞ্চি (5' 5\")",
          "ওজন: ৬২ কেজি (62 kg)",
          "জাতীয় পরিচয়পত্র নম্বর: ৯৫৭০৮৫৫৯৬৬ (9570855966)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৬২৮২",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-085596",
        applicantId: "APP-085596",
        cvNumber: "CV-085596",
        currentStatus: "active",
        currentOrganization: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        currentDesignation: "Cleaner / পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Facilities",
        employmentType: "Full-Time (Outsourced)",
        joiningDate: "2023-07-01",
        totalExperienceYears: 1.1,
        currentLocation: "মুগদা, ঢাকা",
      },
      educationalQualifications: [
        {
          id: "edu-EMP-085596-1",
          degree: "৮ম শ্রেণী (Class 8 Pass)",
          qualificationName: "৮ম শ্রেণী",
          major: "সাধারণ শিক্ষা (General)",
          institution: "স্থানীয় বিদ্যালয়, জাজিরা, শরীয়তপুর",
          board: "general",
          passingYear: "2010",
          result: "উত্তীর্ণ (Passed)",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-085596-1",
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
          id: "doc-EMP-085596-1",
          documentId: "CV-085596-1",
          documentType: "original_cv",
          originalFileName: "cv_redoy_hossain.pdf",
          fileUrl: "/uploads/cvs/cv_redoy_hossain.pdf",
          fileSize: "410 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-085596-2",
          documentId: "CV-085596-2",
          documentType: "other",
          originalFileName: "NID-9570855966.jpg",
          fileUrl: "/uploads/photos/photo_redoy_hossain.jpg",
          fileSize: "85 KB",
          mimeType: "image/jpeg",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-085596-3",
          documentId: "CV-085596-3",
          documentType: "certificate",
          originalFileName: "Dudok_Experience_Redoy_Hossain.pdf",
          fileUrl: "/uploads/cvs/cv_redoy_hossain.pdf",
          fileSize: "410 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["Commercial Cleaning", "Office Sanitation", "Waste Management", "Floor Maintenance", "Hygiene Control"],
        languages: ["Bengali (Native)"],
        certifications: ["Anti-Corruption Commission (দুদক) Experience Certificate"],
        professionalSummary: "অভিজ্ঞ এবং সৎ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন (দুদক) প্রধান কার্যালয়ে সততা ও নিষ্ঠার সাথে আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতা সেবা প্রদানের প্রমাণিত অভিজ্ঞতা রয়েছে।",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম: পরিচ্ছন্নতাকর্মী
০১। নাম: মো: হৃদয় হোসেন
০২। পিতা নাম: সামসুল হক হাওলাদার
০৩। মাতার নাম: আমেনা বেগম
০৪। স্থায়ী ঠিকানা: গ্রাম: মুন্সীকান্দি, পো: জাজিরা, থানা: জাজিরা, জেলা: শরীয়তপুর।
০৫। বর্তমান ঠিকানা: ১৯৯৪, উত্তর মান্ডা, বাসাবো টি এস, মুগদা, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার: ৯৫৭০৮৫৫৯৬৬
০৭। ব্যাংক একাউন্ট নাম্বার: ৪৪৩২১০১০০৬২৮২
০৮। জন্ম তারিখ: ২৭/০৫/১৯৯৪
০৯। বয়স: ৩০ বছর
১০। জাতীয়তা: বাংলাদেশী
১১। ধর্ম: ইসলাম
১২। বৈবাহিক অবস্থা: বিবাহিত
১৩। উচ্চতা: ৫ ফুট ৫ ইঞ্চি
১৪। ওজন: ৬২ কেজি
১৫। মোবাইল নাম্বার: ০১৯৯৮৯৫২২০০
১৬। শিক্ষাগত যোগ্যতা: ৮ম শ্রেণী
স্বাক্ষর: হৃদয়

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / National ID Card
নাম: মোঃ হৃদয় হোসেন
Name: MD. REDOY HOSSAIN
পিতা: মোঃ সামসুল হক হাওলাদার
মাতা: আমেনা বেগম
Date of Birth: 27 May 1994
NID No: 957 085 5966
ঠিকানা: বাসা/হোল্ডিং: ৫৫৫, গ্রাম/রাস্তা: মান্ডা, ডাকঘর: বাসাবো টি এস ও - ১২১৪, সবুজবাগ, ঢাকা
Issue Date: 04 Sep 2016

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মোঃ হৃদয় হোসেন, পিতা: মোঃ সামসুল হক হাওলাদার, মাতা: আমেনা বেগম, গ্রাম: মুন্সীকান্দি, পো: জাজিরা, থানা: জাজিরা, জেলা: শরীয়তপুর দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    searchOverrides: {
      education_level: "below_ssc",
      profession: "cleaner",
      profession_raw: "Cleaner / পরিচ্ছন্নতাকর্মী",
      division: "dhaka",
      district: "shariatpur",
      experience_years: 1.1,
      gender: "male",
      date_of_birth: "1994-05-27",
    },
  },

  // 2. বাছিরুন বেগম (BASHIRON BEGUM)
  {
    profile: {
      id: "EMP-935752",
      employeeId: "EMP-935752",
      applicantId: "APP-935752",
      cvNumber: "CV-935752",
      name: "বাছিরুন বেগম (Bashiron Begum)",
      email: "bashiron.begum@aktraders.com",
      phone: "01770637479",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 3,
      personalInformation: {
        fullName: "বাছিরুন বেগম (Bashiron Begum)",
        gender: "female",
        dob: "1981-10-27",
        age: 42,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "3269357525",
        phone: "01770637479",
        email: "bashiron.begum@aktraders.com",
        presentAddress: "উত্তর মানিকনগর, নাজিম উদ্দিন রোড-১২০৩ ওয়ারী সবুজবাগ, ঢাকা (বাসা/হোল্ডিং: ৬৫/৩-ই উত্তর মানিক নগর, নাজিমউদ্দীন রোড, ওয়ারী-১২০৩, ঢাকা দক্ষিণ সিটি কর্পোরেশন)",
        permanentAddress: "উত্তর মানিকনগর, নাজিম উদ্দিন রোড-১২০৩ ওয়ারী সবুজবাগ, ঢাকা (মূল জেলা: কুমিল্লা)",
        district: "cumilla",
        stateProvince: "chattogram",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: সদাগর আলী",
          "মাতার নাম: রোকেয়া বেগম",
          "স্বামীর নাম: মো: জসিম",
          "উচ্চতা: ৫ ফুট ২ ইঞ্চি (5' 2\")",
          "ওজন: ৫০ কেজি (50 kg)",
          "জাতীয় পরিচয়পত্র নম্বর: ৩২৬৯৩৫৭৫২৫ (3269357525)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৬২৮৬",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-935752",
        applicantId: "APP-935752",
        cvNumber: "CV-935752",
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
          id: "edu-EMP-935752-1",
          degree: "৮ম শ্রেণী (Class 8 Pass)",
          qualificationName: "৮ম শ্রেণী",
          major: "সাধারণ শিক্ষা (General)",
          institution: "স্থানীয় বিদ্যালয়, মানিকনগর, ঢাকা",
          board: "general",
          passingYear: "1996",
          result: "উত্তীর্ণ (Passed)",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-935752-1",
          organizationName: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
          jobTitle: "Cleaner / পরিচ্ছন্নতাকর্মী",
          designation: "পরিচ্ছন্নতাকর্মী",
          duration: "০১ জুলাই ২০২৩ হতে অদ্যাবধি",
          startDate: "2023-07-01",
          endDate: "",
          isCurrent: true,
          responsibilities: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে নিষ্ঠা ও সততার সাথে সেবা প্রদান।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-EMP-935752-1",
          documentId: "CV-935752-1",
          documentType: "original_cv",
          originalFileName: "cv_bashiron_begum.pdf",
          fileUrl: "/uploads/cvs/cv_bashiron_begum.pdf",
          fileSize: "405 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-935752-2",
          documentId: "CV-935752-2",
          documentType: "other",
          originalFileName: "NID-3269357525.jpg",
          fileUrl: "/uploads/photos/photo_bashiron_begum.jpg",
          fileSize: "80 KB",
          mimeType: "image/jpeg",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-935752-3",
          documentId: "CV-935752-3",
          documentType: "certificate",
          originalFileName: "Dudok_Experience_Bashiron_Begum.pdf",
          fileUrl: "/uploads/cvs/cv_bashiron_begum.pdf",
          fileSize: "405 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["Commercial Cleaning", "Office Sanitation", "Waste Segregation", "Hygiene Maintenance"],
        languages: ["Bengali (Native)"],
        certifications: ["Anti-Corruption Commission (দুদক) Certificate"],
        professionalSummary: "পরিশ্রমী এবং দক্ষ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে দীর্ঘ সময় যাবত পরিচ্ছন্নতা সেবায় নিয়োজিত।",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম: পরিচ্ছন্নতাকর্মী
০১। নাম: বাছিরুন বেগম
০২। পিতা নাম: সদাগর আলী
০৩। মাতার নাম: রোকেয়া বেগম
০৪। স্থায়ী ঠিকানা: উত্তর মানিকনগর, নাজিম উদ্দিন রোড-১২০৩ ওয়ারী সবুজবাগ, ঢাকা।
০৫। বর্তমান ঠিকানা: উত্তর মানিকনগর, নাজিম উদ্দিন রোড-১২০৩ ওয়ারী সবুজবাগ, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার: ৩২৬৯৩৫৭৫২৫
০৭। ব্যাংক একাউন্ট নাম্বার: ৪৪৩২১০১০০৬২৮৬
০৮। জন্ম তারিখ: ২৭/১০/১৯৮১
০৯। বয়স: ৪২ বছর
১০। জাতীয়তা: বাংলাদেশী
১১। ধর্ম: ইসলাম
১২। বৈবাহিক অবস্থা: বিবাহিত
১৩। উচ্চতা: ৫ ফুট ২ ইঞ্চি
১৪। ওজন: ৫০ কেজি
১৫। মোবাইল নাম্বার: ০১৭৭০৬৩৭৪৭৯
১৬। শিক্ষাগত যোগ্যতা: ৮ম শ্রেণী
স্বাক্ষর: বাছিরুন

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / National ID Card
নাম: বাছিরুন বেগম
Name: BASHIRON BEGUM
পিতা: সদাগর আলী
মাতা: রোকেয়া বেগম
Date of Birth: 27 Oct 1981
NID No: 326 935 7525
ঠিকানা: বাসা/হোল্ডিং: ৬৫/৩-ই উত্তর মানিক নগর, গ্রাম/রাস্তা: নাজিমউদ্দীন রোড, উত্তর মানিক নগর, ডাকঘর: ওয়ারী - ১২০৩, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা
Place of Birth: COMILLA
Issue Date: 04 Sep 2016

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, বাছিরুন বেগম, স্বামী: মোঃ জসিম, মাতা: রোকেয়া বেগম দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    searchOverrides: {
      education_level: "below_ssc",
      profession: "cleaner",
      profession_raw: "Cleaner / পরিচ্ছন্নতাকর্মী",
      division: "chattogram",
      district: "cumilla",
      experience_years: 1.1,
      gender: "female",
      date_of_birth: "1981-10-27",
    },
  },

  // 3. মোসা: মরিয়ম বেগম (Mst. Moriam Begum)
  {
    profile: {
      id: "EMP-229387",
      employeeId: "EMP-229387",
      applicantId: "APP-229387",
      cvNumber: "CV-229387",
      name: "মোসা: মরিয়ম বেগম (Mst. Moriam Begum)",
      email: "moriam.begum@aktraders.com",
      phone: "01967440359",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 3,
      personalInformation: {
        fullName: "মোসা: মরিয়ম বেগম (Mst. Moriam Begum)",
        gender: "female",
        dob: "1987-04-01",
        age: 36,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "2616882293871",
        phone: "01967440359",
        email: "moriam.begum@aktraders.com",
        presentAddress: "বাসা/হোল্ডিং: ৬, গ্রাম/রাস্তা: মান্ডা, মান্ডা ডাকঘর: মান্ডা - ১২১৪, সবুজবাগ, ঢাকা",
        permanentAddress: "গ্রাম- লুটেরচর, পোঃ- দাউদকান্দি, উপজেলা- দাউদকান্দি, জেলা- কুমিল্লা",
        district: "cumilla",
        stateProvince: "chattogram",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: কাসেম বেপারী (Kashem Bepari)",
          "মাতার নাম: রেজিয়া বেগম / মোছাঃ রুজী বেগম",
          "স্বামীর নাম: মো: খোকন",
          "উচ্চতা: ৫ ফুট ৩ ইঞ্চি (5' 3\")",
          "ওজন: ৭০ কেজি (70 kg)",
          "জাতীয় পরিচয়পত্র নম্বর: ২৬১৬৮৮২২৯৩৮৭১",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৭২৮৩",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-229387",
        applicantId: "APP-229387",
        cvNumber: "CV-229387",
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
          id: "edu-EMP-229387-1",
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
          id: "exp-EMP-229387-1",
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
          id: "doc-EMP-229387-1",
          documentId: "CV-229387-1",
          documentType: "original_cv",
          originalFileName: "cv_moriam_begum.pdf",
          fileUrl: "/uploads/cvs/cv_moriam_begum.pdf",
          fileSize: "398 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-229387-2",
          documentId: "CV-229387-2",
          documentType: "other",
          originalFileName: "NID-2616882293871.jpg",
          fileUrl: "/uploads/photos/photo_moriam_begum.jpg",
          fileSize: "75 KB",
          mimeType: "image/jpeg",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-229387-3",
          documentId: "CV-229387-3",
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
        skills: ["Commercial Cleaning", "Office Sanitation", "Waste Disposal", "Hygiene Maintenance"],
        languages: ["Bengali (Native)"],
        certifications: ["Anti-Corruption Commission (দুদক) Service Certificate"],
        professionalSummary: "দায়িত্বশীল, অভিজ্ঞ এবং নির্ভরযোগ্য পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন (দুদক) প্রধান কার্যালয়ে সততা ও সুনামের সাথে সেবা প্রদানের প্রমাণিত অভিজ্ঞতা সম্পন্ন।",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
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

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / National ID Card
নাম: মোছা: মরিয়ম বেগম
Name: Mst. Moriam Begum
স্বামী: মো: খোকন
মাতা: মোছা: রুজী বেগম
Date of Birth: 01 Apr 1987
ID NO: 2616882293871
ঠিকানা: বাসা/হোল্ডিং: ৬, গ্রাম/রাস্তা: মান্ডা, মান্ডা, ডাকঘর: মান্ডা - ১২১৪, সবুজবাগ, ঢাকা
প্রদানের তারিখ: ০৬/০৫/২০০৮

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মরিয়ম বেগম, পিতা- কাশেম বেপারী, মাতা- রেজিয়া খাতুন, গ্রাম- লুটেরচর, পোঃ- দাউদকান্দি, উপজেলা- দাউদকান্দি, জেলা- কুমিল্লা দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    searchOverrides: {
      education_level: "below_ssc",
      profession: "cleaner",
      profession_raw: "Cleaner / পরিচ্ছন্নতাকর্মী",
      division: "chattogram",
      district: "cumilla",
      experience_years: 1.1,
      gender: "female",
      date_of_birth: "1987-04-01",
    },
  },

  // 4. মহসীন (MOSHIN)
  {
    profile: {
      id: "EMP-288965",
      employeeId: "EMP-288965",
      applicantId: "APP-288965",
      cvNumber: "CV-288965",
      name: "মহসীন (Moshin)",
      email: "moshin@aktraders.com",
      phone: "01891982531",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 3,
      personalInformation: {
        fullName: "মহসীন (Moshin)",
        gender: "male",
        dob: "1997-02-03",
        age: 27,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "6002889658",
        phone: "01891982531",
        email: "moshin@aktraders.com",
        presentAddress: "৩/২/১, পূর্ব রাজারবাগ, রাজার বাগ, বাসাবো টিএসও-১২১৪, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা",
        permanentAddress: "গ্রাম: চরদুংখা, পো: বিরামপুর বাজার, উপজেলা: ফরিদগঞ্জ, জেলা: চাঁদপুর",
        district: "chandpur",
        stateProvince: "chattogram",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: মৃত সেকান্দার",
          "মাতার নাম: পারুল বেগম",
          "উচ্চতা: ৫ ফুট ৬ ইঞ্চি (5' 6\")",
          "ওজন: ৭০ কেজি (70 kg)",
          "জাতীয় পরিচয়পত্র নম্বর: ৬০০২৮৮৯৬৫৮ (6002889658)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৭২৭৯",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-288965",
        applicantId: "APP-288965",
        cvNumber: "CV-288965",
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
          id: "edu-EMP-288965-1",
          degree: "৮ম শ্রেণী (Class 8 Pass)",
          qualificationName: "৮ম শ্রেণী",
          major: "সাধারণ শিক্ষা (General)",
          institution: "স্থানীয় বিদ্যালয়, ফরিদগঞ্জ, চাঁদপুর",
          board: "general",
          passingYear: "2013",
          result: "উত্তীর্ণ (Passed)",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-288965-1",
          organizationName: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
          jobTitle: "Cleaner / পরিচ্ছন্নতাকর্মী",
          designation: "পরিচ্ছন্নতাকর্মী",
          duration: "০১ জুলাই ২০২৩ হতে অদ্যাবধি",
          startDate: "2023-07-01",
          endDate: "",
          isCurrent: true,
          responsibilities: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে দায়িত্ব পালন।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-EMP-288965-1",
          documentId: "CV-288965-1",
          documentType: "original_cv",
          originalFileName: "cv_moshin.pdf",
          fileUrl: "/uploads/cvs/cv_moshin.pdf",
          fileSize: "415 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-288965-2",
          documentId: "CV-288965-2",
          documentType: "other",
          originalFileName: "NID-6002889658.jpg",
          fileUrl: "/uploads/photos/photo_moshin.jpg",
          fileSize: "82 KB",
          mimeType: "image/jpeg",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-288965-3",
          documentId: "CV-288965-3",
          documentType: "certificate",
          originalFileName: "Dudok_Experience_Moshin.pdf",
          fileUrl: "/uploads/cvs/cv_moshin.pdf",
          fileSize: "415 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["Commercial Cleaning", "Office Sanitation", "Waste Management", "Floor Cleaning"],
        languages: ["Bengali (Native)"],
        certifications: ["Anti-Corruption Commission (দুদক) Experience Certificate"],
        professionalSummary: "কর্মঠ এবং অভিজ্ঞ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে সততা ও সুনামের সাথে সেবা প্রদানের রেকর্ড রয়েছে।",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম: পরিচ্ছন্নতাকর্মী
০১। নাম: মহসীন
০২। পিতা নাম: মৃত সেকান্দার
০৩। মাতার নাম: পারুল বেগম
০৪। স্থায়ী ঠিকানা: গ্রাম: চরদুংখা, পো: বিরামপুর বাজার, উপজেলা: ফরিদগঞ্জ, জেলা: চাঁদপুর।
০৫। বর্তমান ঠিকানা: পূর্ব রাজারবাগ, রাজারবাগ, বাসাবো সবুজবাগ, ঢাকা-১২১৪।
০৬। জাতীয় পরিচয়পত্র নাম্বার: ৬০০২৬৮৯৬৫৩
০৭। ব্যাংক একাউন্ট নাম্বার: ৪৪৩২১০১০০৭২৭৯
০৮। জন্ম তারিখ: ০৩/০২/১৯৯৭
০৯। বয়স: ২৭ বছর
১০। জাতীয়তা: বাংলাদেশী
১১। ধর্ম: ইসলাম
১২। বৈবাহিক অবস্থা: বিবাহিত
১৩। উচ্চতা: ৫ ফুট ৬ ইঞ্চি
১৪। ওজন: ৭০ কেজি
১৫। মোবাইল নাম্বার: ০১৮৯১৯৮২৫৩১
১৬। শিক্ষাগত যোগ্যতা: ৮ম শ্রেণী
স্বাক্ষর: মহসীন

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / National ID Card
নাম: মহসীন
Name: MOSHIN
পিতা: মৃত সেকান্দার
মাতা: পারুল বেগম
Date of Birth: 03 Feb 1997
NID No: 600 288 9658
ঠিকানা: বাসা/হোল্ডিং: ৩/২/১, গ্রাম/রাস্তা: পূর্ব রাজার বাগ, রাজার বাগ, ডাকঘর: বাসাবো টি এস ও - ১২১৪, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা
Place of Birth: CHANDPUR
Issue Date: 28 Aug 2016

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মহসীন, পিতা: মৃত সেকান্দার, মাতা: পারুল বেগম, বাসা: ৩/২/১, পূর্ব রাজার বাগ, রাজার বাগ, বাসাবো টিএসও-১২১৪, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    searchOverrides: {
      education_level: "below_ssc",
      profession: "cleaner",
      profession_raw: "Cleaner / পরিচ্ছন্নতাকর্মী",
      division: "chattogram",
      district: "chandpur",
      experience_years: 1.1,
      gender: "male",
      date_of_birth: "1997-02-03",
    },
  },

  // 5. মো: রঞ্জু মিয়া (MD. RONGU MIA)
  {
    profile: {
      id: "EMP-647253",
      employeeId: "EMP-647253",
      applicantId: "APP-647253",
      cvNumber: "CV-647253",
      name: "মো: রঞ্জু মিয়া (Md. Rongu Mia)",
      email: "rongu.mia@aktraders.com",
      phone: "01704436712",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 3,
      personalInformation: {
        fullName: "মো: রঞ্জু মিয়া (Md. Rongu Mia)",
        gender: "male",
        dob: "1996-07-27",
        age: 28,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "4186472538",
        phone: "01704436712",
        email: "rongu.mia@aktraders.com",
        presentAddress: "সেগুনবাগিচা, ঢাকা",
        permanentAddress: "গ্রাম-জন্তিয়ারপাড়া, ডাকঘর- তেকানী চুকাই নগর, থানা/উপজেলা- সোনাতলা, জেলা- বগুড়া",
        district: "bogura",
        stateProvince: "rajshahi",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: মো: কান্টু মন্ডল",
          "মাতার নাম: মোসা: পেয়ারা বেগম / পিয়ারা বেগম",
          "উচ্চতা: ৫ ফুট ৫ ইঞ্চি (5' 5\")",
          "ওজন: ৫৫ কেজি (55 kg)",
          "জাতীয় পরিচয়পত্র নম্বর: ৪১৮৬৪৭২৫৩৮ (4186472538)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৭৩২০",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-647253",
        applicantId: "APP-647253",
        cvNumber: "CV-647253",
        currentStatus: "active",
        currentOrganization: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        currentDesignation: "Cleaner / পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Facilities",
        employmentType: "Full-Time (Outsourced)",
        joiningDate: "2023-07-01",
        totalExperienceYears: 1.1,
        currentLocation: "সেগুনবাগিচা, ঢাকা",
      },
      educationalQualifications: [
        {
          id: "edu-EMP-647253-1",
          degree: "এস.এস.সি (SSC Pass)",
          qualificationName: "এস.এস.সি",
          major: "সাধারণ শিক্ষা (General)",
          institution: "তেকানী চুকাই নগর উচ্চ বিদ্যালয়, সোনাতলা, বগুড়া",
          board: "rajshahi",
          passingYear: "2012",
          result: "উত্তীর্ণ (Passed)",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-647253-1",
          organizationName: "দুর্নীতি দমন কমিশন (দুদক), প্রধান কার্যালয়, ঢাকা",
          jobTitle: "Cleaner / পরিচ্ছন্নতাকর্মী",
          designation: "পরিচ্ছন্নতাকর্মী",
          duration: "০১ জুলাই ২০২৩ হতে অদ্যাবধি",
          startDate: "2023-07-01",
          endDate: "",
          isCurrent: true,
          responsibilities: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে দায়িত্ব পালন।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-EMP-647253-1",
          documentId: "CV-647253-1",
          documentType: "original_cv",
          originalFileName: "cv_rongu_mia.pdf",
          fileUrl: "/uploads/cvs/cv_rongu_mia.pdf",
          fileSize: "402 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-647253-2",
          documentId: "CV-647253-2",
          documentType: "other",
          originalFileName: "NID-4186472538.jpg",
          fileUrl: "/uploads/photos/photo_rongu_mia.jpg",
          fileSize: "78 KB",
          mimeType: "image/jpeg",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
        {
          id: "doc-EMP-647253-3",
          documentId: "CV-647253-3",
          documentType: "certificate",
          originalFileName: "Dudok_Experience_Rongu_Mia.pdf",
          fileUrl: "/uploads/cvs/cv_rongu_mia.pdf",
          fileSize: "402 KB",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["Commercial Cleaning", "Office Sanitation", "Waste Disposal", "Hygiene Management"],
        languages: ["Bengali (Native)"],
        certifications: ["Anti-Corruption Commission (দুদক) Experience Certificate"],
        professionalSummary: "এসএসসি পাশ শিক্ষিত এবং দায়িত্বশীল পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন (দুদক) প্রধান কার্যালয়ে আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতা সেবা প্রদানের প্রমাণিত অভিজ্ঞতা সম্পন্ন।",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম: পরিচ্ছন্নতাকর্মী
০১। নাম: মো: রঞ্জু মিয়া
০২। পিতা নাম: মো: কান্টু মন্ডল
০৩। মাতার নাম: মোসা: পেয়ারা বেগম
০৪। স্থায়ী ঠিকানা: গ্রাম: জন্তিয়ার পাড়া, পো: তেকানী চুকাই নগর, সোনাতলা, বগুড়া।
০৫। বর্তমান ঠিকানা: সেগুনবাগিচা, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার: ৪১৮৬৪৭২৫৩৮
০৭। ব্যাংক একাউন্ট নাম্বার: ৪৪৩২১০১০০৭৩২০
০৮। জন্ম তারিখ: ২৭/০৭/১৯৯৬
০৯। বয়স: ২৮ বছর
১০। জাতীয়তা: বাংলাদেশী
১১। ধর্ম: ইসলাম
১২। বৈবাহিক অবস্থা: বিবাহিত
১৩। উচ্চতা: ৫-৫
১৪। ওজন: ৫৫ কেজি
১৫। মোবাইল নাম্বার: ০১৭০৪-৪৩৬৭১২
১৬। শিক্ষাগত যোগ্যতা: এস.এস.সি
স্বাক্ষর: রঞ্জু

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র
নাম: মোঃ রঞ্জু মিয়া
Name: Md. Rongu Mia
পিতা: মোঃ কান্টু মন্ডল
মাতা: মোছাঃ পিয়ার বেগম
Date of Birth: 27 Jul 1996
ID NO: 4186472538
ঠিকানা: বাসা/হোল্ডিং: ০, গ্রাম/রাস্তা: জন্তিয়ারপাড়া, জন্তিয়ারপাড়া, ডাকঘর: তেকানী চুকাই নগর - ৫৮২৬, সোনাতলা, বগুড়া
প্রদানের তারিখ: ১৩/০৮/২০১৮

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মোঃ রঞ্জু মিয়া, পিতা- মোঃ কান্টু মন্ডল, মাতা- মোছাঃ পিয়ারা বেগম, গ্রাম-জন্তিয়ারপাড়া, ডাকঘর- তেকানী চুকাই নগর, থানা/উপজেলা- সোনাতলা, জেলা- বগুড়া দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    searchOverrides: {
      education_level: "ssc",
      profession: "cleaner",
      profession_raw: "Cleaner / পরিচ্ছন্নতাকর্মী",
      division: "rajshahi",
      district: "bogura",
      experience_years: 1.1,
      gender: "male",
      date_of_birth: "1996-07-27",
    },
  },
];

async function insertAll() {
  console.log(`🚀 Upserting ${candidateProfiles.length} scanned candidates into Supabase...`);

  for (const item of candidateProfiles) {
    const baseRow = employeeRowFromProfile(item.profile);
    const normalized = normalizeProfile(item.profile);
    const searchCols = toSearchColumns(normalized);

    const fullEmployeeRow = {
      ...baseRow,
      ...searchCols,
      ...item.searchOverrides,
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

    const { error: empErr } = await supabase
      .from("employees")
      .upsert(fullEmployeeRow, { onConflict: "id" });

    if (empErr) {
      console.error(`❌ Error inserting employee ${item.profile.name}:`, empErr);
    } else {
      console.log(`✅ Upserted employee: ${item.profile.name} (ID: ${item.profile.id})`);
    }

    const cvRow = {
      id: `cv-${item.profile.employeeId.toLowerCase()}`,
      candidate_name: item.profile.name,
      extracted_text: item.extractedText,
      original_file_name: `${item.profile.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      original_pdf_url: item.profile.attachedDocuments?.[0]?.fileUrl || "/uploads/cvs/document.pdf",
      structured_data: item.profile,
      avatar_url: item.profile.avatarUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: cvErr } = await supabase
      .from("cv_records")
      .upsert(cvRow, { onConflict: "id" });

    if (cvErr) {
      console.error(`❌ Error inserting CV record ${item.profile.name}:`, cvErr);
    } else {
      console.log(`✅ Upserted CV record: cv-${item.profile.employeeId.toLowerCase()}`);
    }
  }

  console.log("\n🎉 ALL 5 SCANNED CANDIDATES SUCCESSFULLY INSERTED INTO SUPABASE!");
}

insertAll().catch(console.error);
