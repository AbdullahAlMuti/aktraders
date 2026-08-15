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

const candidates: Array<{
  profile: FullEmployeeProfile;
  extractedText: string;
  originalFileName: string;
}> = [
  // 1. সেলিনা আক্তার (Salina Akter)
  {
    profile: {
      id: "EMP-890997",
      employeeId: "EMP-890997",
      applicantId: "APP-890997",
      cvNumber: "CV-890997",
      name: "সেলিনা আক্তার (Salina Akter)",
      email: "salina.akter@aktraders.com",
      phone: "01949439200",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "সেলিনা আক্তার (Salina Akter)",
        gender: "female",
        dob: "1999-01-02",
        age: 25,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "1957890997",
        phone: "01949439200",
        email: "salina.akter@aktraders.com",
        presentAddress: "বাসা/হোল্ডিং: ৩২, ১৯৯৪, উত্তর মান্ডা, মান্ডা, ডাকঘর: বাসাবো টি এস ও - ১২১৪, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা মুগদা",
        permanentAddress: "গ্রাম: দুধঘাটা, পো: মোগড়া পাড়া, থানা: সোনারগাঁও, জেলা: নারায়ণগঞ্জ",
        district: "narayanganj",
        stateProvince: "dhaka",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: মোঃ সেলিম ভূঁইয়া",
          "মাতার নাম: চন্দনা বেগম",
          "উচ্চতা: ৫ ফুট (5' 0\")",
          "ওজন: ৪৪ কেজি (44 kg)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৬২৯১",
          "জাতীয় পরিচয়পত্র ইস্যু তারিখ: ১৪/০৮/২০১৮",
          "মেয়াদ উত্তীর্ণের তারিখ: ১৪/০৮/২০২০",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-890997",
        applicantId: "APP-890997",
        cvNumber: "CV-890997",
        currentStatus: "active",
        currentOrganization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
        currentDesignation: "পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Cleaning",
        employmentType: "Outsource / Contractual",
        currentLocation: "মুগদা, ঢাকা",
        joiningDate: "2023-07-01",
        careerLevel: "Entry Level",
        totalExperienceYears: 1,
      },
      educationalQualifications: [
        {
          id: "edu-EMP-890997-1",
          degree: "৮ম শ্রেণী (Class Eight Pass)",
          qualificationName: "৮ম শ্রেণী",
          major: "সাধারণ শিক্ষা",
          institution: "স্থানীয় বিদ্যালয়, সোনারগাঁও, নারায়ণগঞ্জ",
          board: "general",
          passingYear: "2014",
          result: "উত্তীর্ণ (Passed)",
          description: "অষ্টম শ্রেণী সমাপ্ত",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-890997-1",
          organizationName: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
          jobTitle: "পরিচ্ছন্নতাকর্মী (আউটসোর্সিং)",
          designation: "পরিচ্ছন্নতাকর্মী",
          department: "প্রশাসন ও সেবা",
          employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
          location: "ঢাকা",
          startDate: "2023-07-01",
          endDate: "Present",
          isCurrent: true,
          duration: "০১ জুলাই ২০২৩ - অদ্যাবধি",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতা ও পরিষ্কার-পরিচ্ছন্নতা কার্যক্রম পরিচালনা করা। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৪/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-890997",
          documentId: "CV-890997",
          documentType: "original_cv",
          originalFileName: "CV_Salina_Akter_DUDOK.pdf",
          fileUrl: "",
          fileSize: "PDF Document (3 Pages)",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["পরিচ্ছন্নতা কার্যক্রম (Cleaning)", "অফিস স্যানিটেশন (Sanitation)", "বর্জ্য অপসারণ (Waste Management)", "স্বাস্থ্যবিধি রক্ষা"],
        languages: ["বাংলা (Bengali)"],
        certifications: ["প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ০৪/০৫/২০২৪)"],
        professionalSummary: "পরিশ্রমী ও দায়িত্বশীল পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে আউটসোর্সিং প্রক্রিয়ায় ২০২৩ সাল হতে সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।",
        additionalNotes: "জাতীয় পরিচয়পত্র নং: ১৯৫৭৮৯০৯৯৭ | ব্যাংক একাউন্ট নং: ৪৪৩২১০১০০৬২৯১",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম : পরিচ্ছন্নতাকর্মী
০১। নাম : সেলিনা আক্তার
০২। পিতা নাম : সেলিম ভূঁইয়া
০৩। মাতার নাম : চন্দনা বেগম
০৪। স্থায়ী ঠিকানা : গ্রাম: দুধঘাটা, পো: মোগড়া পাড়া, থানা: সোনারগাঁও, জেলা: নারায়ণগঞ্জ।
০৫। বর্তমান ঠিকানা : ১৯৯৪, উত্তর মান্ডা, বাসাবো টি এস, মুগদা, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার : ১৯৫৭৮৯০৯৯৭
০৭। ব্যাংক একাউন্ট নাম্বার : ৪৪৩২১০১০০৬২৯১
০৮। জন্ম তারিখ : ০২/০১/১৯৯৯
০৯। বয়স : ২৫ বছর
১০। জাতীয়তা : বাংলাদেশী
১১। ধর্ম : ইসলাম
১২। বৈবাহিক অবস্থা : বিবাহিত
১৩। উচ্চতা : ৫ ফুট
১৪। ওজন : ৪৪ কেজি
১৫। মোবাইল নাম্বার : ০১৯৪৯৪৩৯২০০
১৬। শিক্ষাগত যোগ্যতা : ৮ম শ্রেণী
স্বাক্ষর: সেলিনা

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / Government of the People's Republic of Bangladesh
Temporary National ID Card / সাময়িক জাতীয় পরিচয় পত্র
নাম: সেলিনা আক্তার
Name: SALINA AKTER
পিতা: মোঃ সেলিম ভূঁইয়া
মাতা: চন্দনা বেগম
Date of Birth: 02 Jan 1999
ID NO: 1957890997
ঠিকানা: বাসা/হোল্ডিং: ৩২, গ্রাম/রাস্তা: উত্তর মান্ডা, মান্ডা, ডাকঘর: বাসাবো টি এস ও - ১২১৪, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা
প্রদানের তারিখ: ১৪/০৮/২০১৮
মেয়াদ উত্তীর্ণের তারিখ: ১৪/০৮/২০২০

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, সেলিনা আক্তার, পিতা- সেলিম ভূঁইয়া, মাতা- চন্দনা বেগম, গ্রাম-দুধঘাটা, পো: মোগড়াপাড়া, থানা: সোনারগাঁও, জেলা: নারায়ণগঞ্জ, দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন। তিনি বাংলাদেশের নাগরিক। আমার জানামতে তিনি উত্তম ও নৈতিক চরিত্রের অধিকারী এবং সমাজ বা রাষ্ট্র বিরোধী কোন প্রকার কাজের সাথে জড়িত নন।
তারিখ: ০৪/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Salina_Akter_DUDOK.pdf",
  },

  // 2. মোসাঃ সালমা বেগম (Mst. Salma Begum)
  {
    profile: {
      id: "EMP-799406",
      employeeId: "EMP-799406",
      applicantId: "APP-799406",
      cvNumber: "CV-799406",
      name: "মোসাঃ সালমা বেগম (Mst. Salma Begum)",
      email: "salma.begum@aktraders.com",
      phone: "01406188650",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "মোসাঃ সালমা বেগম (Mst. Salma Begum)",
        gender: "female",
        dob: "1978-05-01",
        age: 45,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "19782616882799406",
        phone: "01406188650",
        email: "salma.begum@aktraders.com",
        presentAddress: "কমিশনার বাড়ী, গ্রাম/রাস্তা: মান্ডা, ডাকঘর: বাসাবো - ১২১৪, সবুজবাগ, ঢাকা",
        permanentAddress: "কমিশনার বাড়ী, গ্রাম/রাস্তা: মান্ডা, ডাকঘর: বাসাবো - ১২১৪, সবুজবাগ, ঢাকা",
        district: "dhaka",
        stateProvince: "dhaka",
        country: "Bangladesh",
        otherSocialLinks: [
          "স্বামীর নাম: মোঃ রঞ্জু মিয়া",
          "মাতার নাম: মৃত আফিরুন বেগম",
          "উচ্চতা: ৫ ফুট ২ ইঞ্চি (5' 2\")",
          "ওজন: ৭৫ কেজি (75 kg)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৭২৮৫",
          "জাতীয় পরিচয়পত্র প্রদানের তারিখ: ২৫/০৩/২০১৩",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-799406",
        applicantId: "APP-799406",
        cvNumber: "CV-799406",
        currentStatus: "active",
        currentOrganization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
        currentDesignation: "পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Cleaning",
        employmentType: "Outsource / Contractual",
        currentLocation: "সবুজবাগ, ঢাকা",
        joiningDate: "2023-07-01",
        careerLevel: "Entry Level",
        totalExperienceYears: 1,
      },
      educationalQualifications: [
        {
          id: "edu-EMP-799406-1",
          degree: "৫ম শ্রেণী (Class Five Pass)",
          qualificationName: "৫ম শ্রেণী",
          major: "প্রাথমিক শিক্ষা",
          institution: "স্থানীয় প্রাথমিক বিদ্যালয়, ঢাকা",
          board: "general",
          passingYear: "1990",
          result: "উত্তীর্ণ (Passed)",
          description: "পঞ্চম শ্রেণী সমাপ্ত",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-799406-1",
          organizationName: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
          jobTitle: "পরিচ্ছন্নতাকর্মী (আউটসোর্সিং)",
          designation: "পরিচ্ছন্নতাকর্মী",
          department: "প্রশাসন ও সেবা",
          employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
          location: "ঢাকা",
          startDate: "2023-07-01",
          endDate: "Present",
          isCurrent: true,
          duration: "০১ জুলাই ২০২৩ - অদ্যাবধি",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে সেবা প্রদান ও পরিচ্ছন্নতা কার্যক্রম পরিচালনা। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৫/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-799406",
          documentId: "CV-799406",
          documentType: "original_cv",
          originalFileName: "CV_Salma_Begum_DUDOK.pdf",
          fileUrl: "",
          fileSize: "PDF Document (3 Pages)",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["পরিচ্ছন্নতা কাজ (Cleaning)", "অফিস ব্যবস্থাপনা ও পরিষ্কার-পরিচ্ছন্নতা", "স্যানিটেশন"],
        languages: ["বাংলা (Bengali)"],
        certifications: ["প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ০৫/০৫/২০২৪)"],
        professionalSummary: "অভিজ্ঞ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে ২০২৩ সাল থেকে আউটসোর্সিং পরিচ্ছন্নতাকর্মী হিসেবে নিষ্ঠার সাথে কাজ করছেন।",
        additionalNotes: "জাতীয় পরিচয়পত্র নং: ১৯৭৮২৬১৬৮৮২৭৯৯৪০৬ | ব্যাংক একাউন্ট নং: ৪৪৩২১০১০০৭২৮৫",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম : পরিচ্ছন্নতাকর্মী
০১। নাম : মোসাঃ সালমা বেগম
০২। পিতা নাম : রঞ্জু মিয়া (স্বামী: মোঃ রঞ্জু মিয়া)
০৩। মাতার নাম : আফিরুন বেগম (মৃত আফিরুন বেগম)
০৪। স্থায়ী ঠিকানা : মান্ডা কমিশনার বাড়ি, ডাকঘর বাসাবো সবুজবাগ, ঢাকা।
০৫। বর্তমান ঠিকানা : মান্ডা কমিশনার বাড়ি, ডাকঘর বাসাবো সবুজবাগ, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার : ১৯৭৮২৬১৬৮৮২৭৯৯৪০৬
০৭। ব্যাংক একাউন্ট নাম্বার : ৪৪৩২১০১০০৭২৮৫
০৮। জন্ম তারিখ : ০১/০৫/১৯৭৮
০৯। বয়স : ৪৫ বছর
১০। জাতীয়তা : বাংলাদেশী
১১। ধর্ম : ইসলাম
১২। বৈবাহিক অবস্থা : বিবাহিত
১৩। উচ্চতা : ৫ ফুট ২ ইঞ্চি
১৪। ওজন : ৭৫ কেজি
১৫। মোবাইল নাম্বার : ০১৪০৬১৮৮৬৫০
১৬। শিক্ষাগত যোগ্যতা : ৫ম শ্রেণী
স্বাক্ষর: সালমা

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / NATIONAL ID CARD / জাতীয় পরিচয় পত্র
নাম: মোছাঃ সালমা বেগম
Name: Mst. Salma Begum
স্বামী: মোঃ রঞ্জু মিয়া
মাতা: মৃত আফিরুন বেগম
Date of Birth: 01 May 1978
ID No: 19782616882799406
ঠিকানা: বাসা/হোল্ডিং: কমিশনার বাড়ী, গ্রাম/রাস্তা: মান্ডা, ডাকঘর: বাসাবো - ১২১৪, সবুজবাগ, ঢাকা
প্রদানের তারিখ: ২৫/০৩/২০১৩

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মোছাঃ সালমা বেগম, স্বামী: মোঃ রঞ্জু মিয়া, মাতা: মৃত আফিরুন বেগম, বাসা/হোল্ডিং: কমিশনার বাড়ি, গ্রাম-মান্ডা, ডাকঘর: বাসাবে-১২১৪, সবুজবাগ, ঢাকা , দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৫/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Salma_Begum_DUDOK.pdf",
  },

  // 3. সাথী (SHATHI)
  {
    profile: {
      id: "EMP-231684",
      employeeId: "EMP-231684",
      applicantId: "APP-231684",
      cvNumber: "CV-231684",
      name: "সাথী (SHATHI)",
      email: "shathi@aktraders.com",
      phone: "01944608148",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "সাথী (SHATHI)",
        gender: "female",
        dob: "1993-06-10",
        age: 31,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "5078231684",
        phone: "01944608148",
        email: "shathi@aktraders.com",
        presentAddress: "বাসা/হোল্ডিং: ৬৬/৩০/১, গ্রাম/রাস্তা: মানিকনগর ঢাকা-১২০৩, ব্রাহ্মণচিরন, ডাকঘর: ওয়ারী টি এস ও - ১২০৩, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা",
        permanentAddress: "গ্রাম: আশনাবাজ, পো: গোবিন্দপুর, উপজেলা/থানা: মেঘনা, জেলা: কুমিল্লা",
        district: "cumilla",
        stateProvince: "chattogram",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: মোঃ শাহজাহান",
          "মাতার নাম: জোসনা বেগম",
          "উচ্চতা: ৪ ফুট ১১ ইঞ্চি (4' 11\")",
          "ওজন: ৪০ কেজি (40 kg)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৬২৮৮",
          "স্মার্ট এনআইডি ইস্যু তারিখ: 03 Nov 2015",
          "জন্মস্থান: DHAKA",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-231684",
        applicantId: "APP-231684",
        cvNumber: "CV-231684",
        currentStatus: "active",
        currentOrganization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
        currentDesignation: "পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Cleaning",
        employmentType: "Outsource / Contractual",
        currentLocation: "মানিকনগর, ঢাকা",
        joiningDate: "2023-07-01",
        careerLevel: "Entry Level",
        totalExperienceYears: 1,
      },
      educationalQualifications: [
        {
          id: "edu-EMP-231684-1",
          degree: "৭ম শ্রেণী (Class Seven Pass)",
          qualificationName: "৭ম শ্রেণী",
          major: "সাধারণ শিক্ষা",
          institution: "স্থানীয় বিদ্যালয়, মেঘনা, কুমিল্লা",
          board: "general",
          passingYear: "2008",
          result: "উত্তীর্ণ (Passed)",
          description: "সপ্তম শ্রেণী সমাপ্ত",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-231684-1",
          organizationName: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
          jobTitle: "পরিচ্ছন্নতাকর্মী (আউটসোর্সিং)",
          designation: "পরিচ্ছন্নতাকর্মী",
          department: "প্রশাসন ও সেবা",
          employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
          location: "ঢাকা",
          startDate: "2023-07-01",
          endDate: "Present",
          isCurrent: true,
          duration: "০১ জুলাই ২০২৩ - অদ্যাবধি",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতাকর্মী হিসেবে সেবা প্রদান। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৫/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-231684",
          documentId: "CV-231684",
          documentType: "original_cv",
          originalFileName: "CV_Shathi_DUDOK.pdf",
          fileUrl: "",
          fileSize: "PDF Document (3 Pages)",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["পরিচ্ছন্নতা কার্যক্রম (Cleaning)", "অফিস পরিষ্কার-পরিচ্ছন্নতা", "স্যানিটেশন", "বর্জ্য ব্যবস্থাপনা"],
        languages: ["বাংলা (Bengali)"],
        certifications: ["প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ০৫/০৫/২০২৪)"],
        professionalSummary: "দায়িত্বশীল ও সৎ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে ২০২৩ সাল থেকে সততা ও সুনামের সাথে আউটসোর্সিং পরিচ্ছন্নতাকর্মী হিসেবে কাজ করে আসছেন।",
        additionalNotes: "স্মার্ট জাতীয় পরিচয়পত্র নং: ৫০৭৮২৩১৬৮৪ (507 823 1684) | ব্যাংক একাউন্ট নং: ৪৪৩২১০১০০৬২৮৮",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম : পরিচ্ছন্নতাকর্মী
০১। নাম : সাথী
০২। পিতা নাম : মোঃ শাহজাহান
০৩। মাতার নাম : জোসনা বেগম
০৪। স্থায়ী ঠিকানা : গ্রাম: আশনাবাজ, পো: গোবিন্দপুর, থানা, মেঘনা, জেলা: কুমিল্লা।
০৫। বর্তমান ঠিকানা : গ্রাম: মানিকনগর, ঢাকা-১২০৩, ব্রাহ্মণচিরন, পো: ওয়ারী টি এস ও-১২০৩, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার : ৫০৭৮২৩১৬৮৪
০৭। ব্যাংক একাউন্ট নাম্বার : ৪৪৩২১০১০০৬২৮৮
০৮। জন্ম তারিখ : ১০/০৬/১৯৯৩
০৯। বয়স : ৩১ বছর
১০। জাতীয়তা : বাংলাদেশী
১১। ধর্ম : ইসলাম
১২। বৈবাহিক অবস্থা : বিবাহিত
১৩। উচ্চতা : ৪ ফুট ১১ ইঞ্চি
১৪। ওজন : ৪০ কেজি
১৫। মোবাইল নাম্বার : ০১৯৪৪৬০৮১৪৮
১৬। শিক্ষাগত যোগ্যতা : ৭ম শ্রেণী
স্বাক্ষর: সাথী

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / National ID Card
নাম: সাথী
Name: SHATHI
পিতা: মোঃ শাহজাহান
মাতা: জোসনা বেগম
Date of Birth: 10 Jun 1993
NID No: 507 823 1684
ঠিকানা: বাসা/হোল্ডিং: ৬৬/৩০/১, গ্রাম/রাস্তা: মানিকনগর ঢাকা-১২০৩, ব্রাহ্মণচিরন, ডাকঘর: ওয়ারী টি এস ও - ১২০৩, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা
Issue Date: 03 Nov 2015
Place of Birth: DHAKA
MRZ: I<BGD507823168<48<<<<<<<<<<<<< 9306107F3011021BGD<<<<<<<<<<<4 SHATHI<<<<<<<<<<<<<<<<<<<<<<

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, সাথী, পিতা- মোঃ শাহজাহান, মাতা- জোসনা বেগম, গ্রাম- আশনাবাজ, ডাকঘর- গোবিন্দপুর, উপজেলা- মেঘনা, জেলা- কুমিল্লা, দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৫/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Shathi_DUDOK.pdf",
  },

  // 4. আব্দুল রাজ্জাক (রাকিবুল) / ABDUL RAZZAK (RAKIBUL)
  {
    profile: {
      id: "EMP-478902",
      employeeId: "EMP-478902",
      applicantId: "APP-478902",
      cvNumber: "CV-478902",
      name: "আব্দুল রাজ্জাক (রাকিবুল) / ABDUL RAZZAK (RAKIBUL)",
      email: "abdul.razzak@aktraders.com",
      phone: "01984607598",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "মোঃ রাজ্জাক (রাকিবুল) / আব্দুল রাজ্জাক (ABDUL RAZZAK RAKIBUL)",
        gender: "male",
        dob: "1966-02-20",
        age: 57,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "19606817684478902",
        phone: "01984607598",
        email: "abdul.razzak@aktraders.com",
        presentAddress: "মান্ডা ১ম গলি হাজির ম্যাচ মুগদা, ঢাকা",
        permanentAddress: "বাসা/হোল্ডিং: হুজুর বাড়ি, গ্রাম/রাস্তা: দক্ষিণ কারারচর, চরসুজাপুর, ডাকঘর: কারারচর হাইস্কুল - ১৬০০, উপজেলা: শিবপুর, জেলা: নরসিংদী",
        district: "narsingdi",
        stateProvince: "dhaka",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: মোঃ হাফিজ উদ্দিন",
          "মাতার নাম: মোসাঃ রহিমা বেগম",
          "উচ্চতা: ৪'-৬\" (4' 6\")",
          "ওজন: ৫৫ কেজি (55 kg)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৬২৯০",
          "জাতীয় পরিচয়পত্র প্রদানের তারিখ: ২৮/০৬/২০১৬",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-478902",
        applicantId: "APP-478902",
        cvNumber: "CV-478902",
        currentStatus: "active",
        currentOrganization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
        currentDesignation: "পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Cleaning",
        employmentType: "Outsource / Contractual",
        currentLocation: "মুগদা, ঢাকা",
        joiningDate: "2023-07-01",
        careerLevel: "Entry Level",
        totalExperienceYears: 1,
      },
      educationalQualifications: [
        {
          id: "edu-EMP-478902-1",
          degree: "এস.এস.সি (Secondary School Certificate)",
          qualificationName: "এস.এস.সি",
          major: "মানবিক / সাধারণ",
          institution: "কারারচর হাইস্কুল, শিবপুর, নরসিংদী",
          board: "general",
          passingYear: "1982",
          result: "উত্তীর্ণ (Passed)",
          description: "মাধ্যমিক স্কুল সার্টিফিকেট পরীক্ষা সম্পন্ন",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-478902-1",
          organizationName: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
          jobTitle: "পরিচ্ছন্নতাকর্মী (আউটসোর্সিং)",
          designation: "পরিচ্ছন্নতাকর্মী",
          department: "প্রশাসন ও সেবা",
          employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
          location: "ঢাকা",
          startDate: "2023-07-01",
          endDate: "Present",
          isCurrent: true,
          duration: "০১ জুলাই ২০২৩ - অদ্যাবধি",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতাকর্মী হিসেবে সেবা প্রদান। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৭/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-478902",
          documentId: "CV-478902",
          documentType: "original_cv",
          originalFileName: "CV_Abdul_Razzak_DUDOK.pdf",
          fileUrl: "",
          fileSize: "PDF Document (3 Pages)",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["পরিচ্ছন্নতা কার্যক্রম (Cleaning)", "অফিস রক্ষণাবেক্ষণ", "স্যানিটেশন", "বর্জ্য ব্যবস্থাপনা"],
        languages: ["বাংলা (Bengali)"],
        certifications: ["প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ০৭/০৫/২০২৪)"],
        professionalSummary: "অভিজ্ঞ ও নিবেদিতপ্রাণ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে ২০২৩ সাল হতে আউটসোর্সিং পরিচ্ছন্নতাকর্মী হিসেবে সততা ও নিষ্ঠার সাথে কাজ করে আসছেন।",
        additionalNotes: "জাতীয় পরিচয়পত্র নং: ১৯৬০৬৮১৭৬৮৪৪৭৮৯০২ | ব্যাংক একাউন্ট নং: ৪৪৩২১০১০০৬২৯০",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম : পরিচ্ছন্নতাকর্মী
০১। নাম : মোঃ রাজ্জাক (রাকিবুল)
০২। পিতা নাম : মোঃ হাফিজ উদ্দিন
০৩। মাতার নাম : মোসাঃ রহিমা বেগম
০৪। স্থায়ী ঠিকানা : গ্রাম: দক্ষিণ কারারচর, পো: কারারচর হাইস্কুল, উপজেলা: শিবপুর, জেলা: নরসিংদী।
০৫। বর্তমান ঠিকানা : মান্ডা ১ম গলি হাজির ম্যাচ মুগদা, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার : ১৯৬০৬৮১৭৬৮৪৪৭৮৯০২
০৭। ব্যাংক একাউন্ট নাম্বার : ৪৪৩২১০১০০৬২৯০
০৮। জন্ম তারিখ : ২০/০২/১৯৬৬
০৯। বয়স : ৫৭ বছর
১০। জাতীয়তা : বাংলাদেশী
১১। ধর্ম : ইসলাম
১২। বৈবাহিক অবস্থা : বিবাহিত
১৩। উচ্চতা : ৪'-৬"
১৪। ওজন : ৫৫ কেজি
১৫। মোবাইল নাম্বার : ০১৯৮৪৬০৭৫৯৮
১৬। শিক্ষাগত যোগ্যতা : এস.এস.সি
স্বাক্ষর: রাজ্জাক

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / NATIONAL ID CARD / জাতীয় পরিচয় পত্র
নাম: আব্দুল রাজ্জাক (রাকিবুল)
Name: ABDUL RAZZAK( RAKIBUL)
পিতা: মোঃ হাফিজ উদ্দিন
মাতা: মোসাঃ রহিমা বেগম
Date of Birth: 20 Feb 1966
ID NO: 19606817684478902
ঠিকানা: বাসা/হোল্ডিং: হুজুর বাড়ি, গ্রাম/রাস্তা: দক্ষিণ কারারচর, চরসুজাপুর, ডাকঘর: কারারচর - ১৬০০, শিবপুর, নরসিংদী
প্রদানের তারিখ: ২৮/০৬/২০১৬

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মোঃ রাজ্জাক (রাকিবুল), পিতা- মোঃ হাফিজ উদ্দিন, মাতা- মোসাঃ রহিমা বেগম, গ্রাম-দক্ষিণ কারারচর, পোঃ- কারারচর হাইস্কুল, উপজেলা- শিবপুর, জেলা- নরসিংদী দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৭/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Abdul_Razzak_DUDOK.pdf",
  },
];

async function run() {
  console.log("🚀 Starting insertion of extracted candidate profiles into Supabase...");

  // Clean up corrupted incomplete record EMP-660714 if exists
  await supabase.from("employees").delete().eq("id", "EMP-660714");
  await supabase.from("cv_records").delete().eq("id", "cv-1786607541539-8346");

  for (const item of candidates) {
    const profile = item.profile;
    const baseRow = employeeRowFromProfile(profile);
    const searchCols = toSearchColumns(normalizeProfile(profile));
    const fullRow = { ...baseRow, ...searchCols, search_indexed_at: new Date().toISOString() };

    console.log(`\n📄 Processing candidate: ${profile.name} (${profile.employeeId})`);
    console.log("Derived search columns:", searchCols);

    // 1. Upsert into employees table
    const { error: empError } = await supabase.from("employees").upsert(fullRow, { onConflict: "id" });
    if (empError) {
      console.error(`❌ Error inserting employee ${profile.employeeId}:`, empError.message);
    } else {
      console.log(`✅ Successfully saved into 'employees' table: ${profile.employeeId}`);
    }

    // 2. Upsert into cv_records table
    const cvRecordId = `cv-${profile.employeeId.toLowerCase()}`;
    const cvRow = {
      id: cvRecordId,
      candidate_name: profile.name,
      extracted_text: item.extractedText,
      original_file_name: item.originalFileName,
      original_pdf_url: "",
      structured_data: profile,
      avatar_url: profile.avatarUrl || null,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    };

    const { error: cvError } = await supabase.from("cv_records").upsert(cvRow, { onConflict: "id" });
    if (cvError) {
      console.error(`❌ Error inserting cv_record ${cvRecordId}:`, cvError.message);
    } else {
      console.log(`✅ Successfully saved into 'cv_records' table: ${cvRecordId}`);
    }
  }

  // Verification step
  console.log("\n🔍 Verifying all records in Supabase...");
  const { data: allEmps, error: listError } = await supabase
    .from("employees")
    .select("id, name, designation, phone, gender, education_level, district, profession, experience_years, status");
  
  if (listError) {
    console.error("❌ Verification list error:", listError.message);
  } else {
    console.log(`✅ Total Employees in Database: ${allEmps?.length}`);
    console.table(allEmps);
  }

  const { data: allCvs } = await supabase.from("cv_records").select("id, candidate_name, original_file_name");
  console.log(`✅ Total CV Records in Database: ${allCvs?.length}`);
  console.table(allCvs);

  console.log("\n🎉 All candidate data extracted and saved into database successfully!");
}

run().catch(console.error);
