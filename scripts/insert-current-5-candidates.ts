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
  // 1. সাথী (SHATHI)
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
          duration: "2023 - Present",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতাকর্মী হিসেবে সেবা প্রদান। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৫/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-231684",
          documentId: "CV-231684",
          documentType: "original_cv",
          originalFileName: "CV_Shathi_Cleaner_Dudok.pdf",
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
০৪। স্থায়ী ঠিকানা : গ্রাম: আশনাবাজ, পো: গোবিন্দপুর, থানা: মেঘনা, জেলা: কুমিল্লা।
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

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, সাথী, পিতা- মোঃ শাহজাহান, মাতা- জোসনা বেগম, গ্রাম- আশনাবাজ, ডাকঘর- গোবিন্দপুর, উপজেলা- মেঘনা, জেলা- কুমিল্লা, দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৫/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Shathi_Cleaner_Dudok.pdf",
  },

  // 2. রেক্সনা বেগম (Rexona Begum)
  {
    profile: {
      id: "EMP-438216",
      employeeId: "EMP-438216",
      applicantId: "APP-438216",
      cvNumber: "CV-438216",
      name: "রেক্সনা বেগম (Rexona Begum)",
      email: "rexona.begum@aktraders.com",
      phone: "01758395360",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "রেক্সনা বেগম (Rexona Begum)",
        gender: "female",
        dob: "1981-03-20",
        age: 42,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "4160438216",
        phone: "01758395360",
        email: "rexona.begum@aktraders.com",
        presentAddress: "খলপুর ৭/২এর ডি, ঢাকা",
        permanentAddress: "বাসা/হোল্ডিং: খলিফা বাড়ি, গ্রাম/রাস্তা: ফলাঘর, ডাকঘর: কালীগঞ্জ বাজার - ৮২৮০, উপজেলা: বাকেরগঞ্জ, জেলা: বরিশাল",
        district: "barishal",
        stateProvince: "barishal",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: সামছুল হাওলাদার",
          "স্বামীর নাম: মান্নান খলিফা",
          "মাতার নাম: রুনু বেগম",
          "উচ্চতা: ৫ ফুট ৫ ইঞ্চি (5' 5\")",
          "ওজন: ৭০ কেজি (70 kg)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৭২৮৬",
          "জাতীয় পরিচয়পত্র প্রদানের তারিখ: ১৫/০১/২০১৮",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-438216",
        applicantId: "APP-438216",
        cvNumber: "CV-438216",
        currentStatus: "active",
        currentOrganization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
        currentDesignation: "পরিচ্ছন্নতাকর্মী",
        department: "Housekeeping & Cleaning",
        employmentType: "Outsource / Contractual",
        currentLocation: "ঢাকা",
        joiningDate: "2023-07-01",
        careerLevel: "Entry Level",
        totalExperienceYears: 1,
      },
      educationalQualifications: [
        {
          id: "edu-EMP-438216-1",
          degree: "৫ম শ্রেণী (Class Five Pass)",
          qualificationName: "৫ম শ্রেণী",
          major: "প্রাথমিক শিক্ষা",
          institution: "স্থানীয় প্রাথমিক বিদ্যালয়, বাকেরগঞ্জ, বরিশাল",
          board: "general",
          passingYear: "1992",
          result: "উত্তীর্ণ (Passed)",
          description: "পঞ্চম শ্রেণী সমাপ্ত",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-438216-1",
          organizationName: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
          jobTitle: "পরিচ্ছন্নতাকর্মী (আউটসোর্সিং)",
          designation: "পরিচ্ছন্নতাকর্মী",
          department: "প্রশাসন ও সেবা",
          employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
          location: "ঢাকা",
          startDate: "2023-07-01",
          endDate: "Present",
          isCurrent: true,
          duration: "2023 - Present",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতা ও পরিষ্কার-পরিচ্ছন্নতা কার্যক্রম পরিচালনা করা। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৫/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-438216",
          documentId: "CV-438216",
          documentType: "original_cv",
          originalFileName: "CV_Rexona_Begum_Cleaner_Dudok.pdf",
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
        certifications: ["প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ০৫/০৫/২০২৪)"],
        professionalSummary: "পরিশ্রমী ও দায়িত্বশীল পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে আউটসোর্সিং প্রক্রিয়ায় ২০২৩ সাল হতে সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।",
        additionalNotes: "জাতীয় পরিচয়পত্র নং: ৪১৬০৪৩৮২১৬ | ব্যাংক একাউন্ট নং: ৪৪৩২১০১০০৭২৮৬",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম : পরিচ্ছন্নতাকর্মী
০১। নাম : রেক্সনা বেগম
০২। পিতা নাম : সামছুল হাওলাদার (স্বামী: মান্নান খলিফা)
০৩। মাতার নাম : রুনু বেগম
০৪। স্থায়ী ঠিকানা : ফলাঘর, ডাকঘর, কালীগঞ্জ বাজার, বাকেরগঞ্জ, বরিশাল
০৫। বর্তমান ঠিকানা : খলপুর ৭/২এর ডি
০৬। জাতীয় পরিচয়পত্র নাম্বার : ৪১৬০৪৩৮২১৬
০৭। ব্যাংক একাউন্ট নাম্বার : ৪৪৩২১০১০০৭২৮৬
০৮। জন্ম তারিখ : ২০/০৩/১৯৮১
০৯। বয়স : ৪২ বছর
১০। জাতীয়তা : বাংলাদেশী
১১। ধর্ম : ইসলাম
১২। বৈবাহিক অবস্থা : বিবাহিত
১৩। উচ্চতা : ৫ ফুট ৫ ইঞ্চি
১৪। ওজন : ৭০ কেজি
১৫। মোবাইল নাম্বার : ০১758395360
১৬। শিক্ষাগত যোগ্যতা : ৫ম শ্রেণী
স্বাক্ষর: রেক্সনা

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / NATIONAL ID CARD / জাতীয় পরিচয় পত্র
নাম: রেক্সনা বেগম
Name: Rexona Begum
স্বামী: মান্নান খলিফা
মাতা: রুনু বেগম
Date of Birth: 20 Mar 1981
ID NO: 4160438216
ঠিকানা: বাসা/হোল্ডিং: খলিফা বাড়ি, গ্রাম/রাস্তা: ফলাঘর, ডাকঘর: কালীগঞ্জ বাজার - ৮২৮০, বাকেরগঞ্জ, বরিশাল
প্রদানের তারিখ: ১৫/০১/২০১৮

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, রেক্সনা বেগম, স্বামী- মান্নান খলিফা, মাতা- রুনু বেগম, গ্রাম- ফলাঘর, ডাকঘর- কালীগঞ্জ বাজার, উপজেলা- বাকেরগঞ্জ, জেলা- বরিশাল দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৫/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Rexona_Begum_Cleaner_Dudok.pdf",
  },

  // 3. মুক্তা বেগম (Mukta Begum)
  {
    profile: {
      id: "EMP-439221",
      employeeId: "EMP-439221",
      applicantId: "APP-439221",
      cvNumber: "CV-439221",
      name: "মুক্তা বেগম (Mukta Begum)",
      email: "mukta.begum@aktraders.com",
      phone: "01954956596",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "মুক্তা বেগম (Mukta Begum)",
        gender: "female",
        dob: "1978-03-24",
        age: 47,
        nationality: "Bangladeshi",
        maritalStatus: "Married",
        religion: "Islam",
        nid: "2616882439221",
        phone: "01954956596",
        email: "mukta.begum@aktraders.com",
        presentAddress: "বাসা/হোল্ডিং: ৩, লালমিয়া রোড, মান্ডা, ডাকঘর: বাসাবো - ১২১৪, সবুজবাগ, মুগদা, ঢাকা",
        permanentAddress: "গ্রাম: রূপাকালি, ডাকঘর: বেগুনবাড়ি, উপজেলা: ময়মনসিংহ সদর, জেলা: ময়মনসিংহ",
        district: "mymensingh",
        stateProvince: "mymensingh",
        country: "Bangladesh",
        otherSocialLinks: [
          "পিতার নাম: নূরুল ইসলাম / নূর ইসলাম",
          "স্বামীর নাম: মোঃ আঃ রশিদ",
          "মাতার নাম: নূরজাহান",
          "উচ্চতা: ৫ ফুট ৩ ইঞ্চি (5' 3\")",
          "ওজন: ৬০ কেজি (60 kg)",
          "ব্যাংক একাউন্ট নম্বর: ৪৪৩২১০১০০৬২৮৯",
          "জাতীয় পরিচয়পত্র প্রদানের তারিখ: ০৬/০৫/২০০৮",
        ],
      },
      employmentDetails: {
        employeeId: "EMP-439221",
        applicantId: "APP-439221",
        cvNumber: "CV-439221",
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
          id: "edu-EMP-439221-1",
          degree: "৫ম শ্রেণী (Class Five Pass)",
          qualificationName: "৫ম শ্রেণী",
          major: "প্রাথমিক শিক্ষা",
          institution: "স্থানীয় প্রাথমিক বিদ্যালয়, ময়মনসিংহ সদর",
          board: "general",
          passingYear: "1990",
          result: "উত্তীর্ণ (Passed)",
          description: "পঞ্চম শ্রেণী সমাপ্ত",
        },
      ],
      workExperience: [
        {
          id: "exp-EMP-439221-1",
          organizationName: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
          jobTitle: "পরিচ্ছন্নতাকর্মী (আউটসোর্সিং)",
          designation: "পরিচ্ছন্নতাকর্মী",
          department: "প্রশাসন ও সেবা",
          employmentType: "আউটসোর্সিং / চুক্তিভিত্তিক",
          location: "ঢাকা",
          startDate: "2023-07-01",
          endDate: "Present",
          isCurrent: true,
          duration: "2023 - Present",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতা সেবা প্রদান। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৫/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-439221",
          documentId: "CV-439221",
          documentType: "original_cv",
          originalFileName: "CV_Mukta_Begum_Cleaner_Dudok.pdf",
          fileUrl: "",
          fileSize: "PDF Document (3 Pages)",
          mimeType: "application/pdf",
          uploadDate: new Date().toISOString(),
          version: 1,
        },
      ],
      otherDetails: {
        skills: ["পরিচ্ছন্নতা কাজ (Cleaning)", "অফিস পরিষ্কার-পরিচ্ছন্নতা", "স্যানিটেশন", "বর্জ্য অপসারণ"],
        languages: ["বাংলা (Bengali)"],
        certifications: ["প্রত্যয়ন পত্র - দুর্নীতি দমন কমিশন (দুদক প্রধান কার্যালয়, ০৫/০৫/২০২৪)"],
        professionalSummary: "অভিজ্ঞ পরিচ্ছন্নতাকর্মী। দুর্নীতি দমন কমিশন প্রধান কার্যালয়ে ২০২৩ সাল থেকে আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে অত্যন্ত নিষ্ঠার সাথে সেবা দিচ্ছেন।",
        additionalNotes: "জাতীয় পরিচয়পত্র নং: ২৬১৬৮৮২৪৩৯২২১ | ব্যাংক একাউন্ট নং: ৪৪৩২১০১০০৬২৮৯",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    extractedText: `জীবন-বৃত্তান্ত
পদের নাম : পরিচ্ছন্নতাকর্মী
০১। নাম : মুক্তা বেগম
০২। পিতা নাম : নূরুল ইসলাম (স্বামী: মোঃ আঃ রশিদ)
০৩। মাতার নাম : নূরজাহান
০৪। স্থায়ী ঠিকানা : লালমিয়া রোড, মান্ডা, বাসাবো, সবুজবাগ, মুগদা, ঢাকা। (প্রত্যয়নপত্রে: গ্রাম-রূপাকালি, পোঃ-বেগুনবাড়ি, উপজেলা-ময়মনসিংহ সদর, জেলা-ময়মনসিংহ)
০৫। বর্তমান ঠিকানা : লালমিয়া রোড, মান্ডা, বাসাবো, সবুজবাগ, মুগদা, ঢাকা।
০৬। জাতীয় পরিচয়পত্র নাম্বার : ২৬১৬৮৮২৪৩৯২২১
০৭। ব্যাংক একাউন্ট নাম্বার : ৪৪৩২১০১০০৬২৮৯
০৮। জন্ম তারিখ : ২৪/০৩/১৯৭৮
০৯। বয়স : ৪৭ বছর
১০। জাতীয়তা : বাংলাদেশী
১১। ধর্ম : ইসলাম
১২। বৈবাহিক অবস্থা : বিবাহিত
১৩। উচ্চতা : ৫ ফুট ৩ ইঞ্চি
১৪। ওজন : ৬০ কেজি
১৫। মোবাইল নাম্বার : ০১৯৫৪-৯৫৬৫৯৬
১৬। শিক্ষাগত যোগ্যতা : ৫ম শ্রেণী
স্বাক্ষর: মুক্তা

গণপ্রজাতন্ত্রী বাংলাদেশ সরকার / NATIONAL ID CARD / জাতীয় পরিচয় পত্র
নাম: মুক্তা বেগম
Name: Mukta Begum
স্বামী: মোঃ আঃ রশিদ
মাতা: নূরজাহান
Date of Birth: 24 Mar 1978
ID NO: 2616882439221
ঠিকানা: বাসা/হোল্ডিং: ৩, গ্রাম/রাস্তা: লাল মিয়া রোড, মান্ডা, ডাকঘর: বাসাবো - ১২১৪, সবুজবাগ, ঢাকা
প্রদানের তারিখ: ০৬/০৫/২০০৮

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মুক্তা বেগম, পিতা- নূর ইসলাম, মাতা- নূর জাহান, গ্রাম-রূপাকালি, পোঃ- বেগুনবাড়ি, উপজেলা- ময়মনসিংহ সদর, জেলা- ময়মনসিংহ দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৫/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Mukta_Begum_Cleaner_Dudok.pdf",
  },

  // 4. সেলিনা আক্তার (SALINA AKTER)
  {
    profile: {
      id: "EMP-890997",
      employeeId: "EMP-890997",
      applicantId: "APP-890997",
      cvNumber: "CV-890997",
      name: "সেলিনা আক্তার (SALINA AKTER)",
      email: "salina.akter@aktraders.com",
      phone: "01949439200",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "সেলিনা আক্তার (SALINA AKTER)",
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
        permanentAddress: "গ্রাম: দুধঘাটা, পো: মোগড়াপাড়া, থানা: সোনারগাঁও, জেলা: নারায়ণগঞ্জ",
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
          duration: "2023 - Present",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে পরিচ্ছন্নতা ও পরিষ্কার-পরিচ্ছন্নতা কার্যক্রম পরিচালনা করা। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৪/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-890997",
          documentId: "CV-890997",
          documentType: "original_cv",
          originalFileName: "CV_Salina_Akter_Cleaner_Dudok.pdf",
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
০৪। স্থায়ী ঠিকানা : গ্রাম: দুধঘাটা, পো: মোগড়াপাড়া, থানা: সোনারগাঁও, জেলা: নারায়ণগঞ্জ।
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
ঠিকানা: বাসা/হোল্ডিং: ৩২, গ্রাম/রাস্তা: উত্তর মান্ডা, মান্ডা, ডাকঘর: বাসাবো টি এস ও - ৮০১০, সবুজবাগ, ঢাকা দক্ষিণ সিটি কর্পোরেশন, ঢাকা
প্রদানের তারিখ: ১৪/০৮/২০১৮
মেয়াদ উত্তীর্ণের তারিখ: ১৪/০৮/২০২০

যাহার জন্য প্রযোজ্য
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, সেলিনা আক্তার, পিতা- সেলিম ভূঁইয়া, মাতা- চন্দনা বেগম, গ্রাম-দুধঘাটা, পো: মোগড়াপাড়া, থানা: সোনারগাঁও, জেলা: নারায়ণগঞ্জ, দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৪/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Salina_Akter_Cleaner_Dudok.pdf",
  },

  // 5. মোছাঃ সালমা বেগম (Mst. Salma Begum)
  {
    profile: {
      id: "EMP-799406",
      employeeId: "EMP-799406",
      applicantId: "APP-799406",
      cvNumber: "CV-799406",
      name: "মোছাঃ সালমা বেগম (Mst. Salma Begum)",
      email: "salma.begum@aktraders.com",
      phone: "01406188650",
      department: "Housekeeping & Cleaning",
      designation: "পরিচ্ছন্নতাকর্মী",
      organization: "দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা",
      status: "active",
      joiningDate: "2023-07-01",
      cvCount: 1,
      personalInformation: {
        fullName: "মোছাঃ সালমা বেগম (Mst. Salma Begum)",
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
          duration: "2023 - Present",
          responsibilities: "দুদক প্রধান কার্যালয়ে সততা ও সুনামের সাথে সেবা প্রদান ও পরিচ্ছন্নতা কার্যক্রম পরিচালনা। প্রত্যয়নপত্র প্রদানকারী: সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুদক (তারিখ: ০৫/০৫/২০২৪)।",
        },
      ],
      attachedDocuments: [
        {
          id: "doc-cv-EMP-799406",
          documentId: "CV-799406",
          documentType: "original_cv",
          originalFileName: "CV_Salma_Begum_Cleaner_Dudok.pdf",
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
এই মর্মে প্রত্যয়ন করা যাইতেছে যে, মোছাঃ সালমা বেগম, স্বামী: মোঃ রঞ্জু মিয়া, মাতা: মৃত আফিরুন বেগম, বাসা/হোল্ডিং: কমিশনার বাড়ি, গ্রাম-মান্ডা, ডাকঘর: বাসাবো-১২১৪, সবুজবাগ, ঢাকা , দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকায় আউটসোর্সিং প্রক্রিয়ায় পরিচ্ছন্নতাকর্মী হিসেবে ০১ জুলাই, ২০২৩ সাল হতে অদ্যাবধি সততা ও সুনামের সাথে সেবা দিয়ে যাচ্ছেন।
তারিখ: ০৫/০৫/২০২৪
সমীর বিশ্বাস, উপপরিচালক (প্রশাসন), দুর্নীতি দমন কমিশন, প্রধান কার্যালয়, ঢাকা।`,
    originalFileName: "CV_Salma_Begum_Cleaner_Dudok.pdf",
  },
];

async function run() {
  console.log("🚀 Starting insertion of 5 newly uploaded candidates into Supabase...");

  const storageExtractedDir = path.resolve(process.cwd(), "storage/extracted");
  if (!fs.existsSync(storageExtractedDir)) {
    fs.mkdirSync(storageExtractedDir, { recursive: true });
  }

  for (const item of candidates) {
    const profile = item.profile;
    const baseRow = employeeRowFromProfile(profile);
    const searchCols = toSearchColumns(normalizeProfile(profile));
    const fullRow = { ...baseRow, ...searchCols, search_indexed_at: new Date().toISOString() };

    console.log(`\n📄 Processing candidate: ${profile.name} (${profile.employeeId})`);
    console.log("Derived search columns:", searchCols);

    // Save JSON backup in storage/extracted/
    const jsonPath = path.join(storageExtractedDir, `${profile.employeeId}_${profile.personalInformation.nid || "cand"}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(profile, null, 2), "utf-8");
    console.log(`📁 Saved JSON snapshot to: ${jsonPath}`);

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

  console.log("\n🎉 ALL 5 CANDIDATES HAVE BEEN EXTRACTED AND SAVED INTO DATABASE SUCCESSFULLY!");
}

run().catch(console.error);
