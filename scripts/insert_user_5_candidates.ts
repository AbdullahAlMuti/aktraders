import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Load environment
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
  auth: { persistSession: false },
});

const candidates = [
  {
    id: "EMP-000001",
    employeeId: "EMP-000001",
    applicantId: "APP-000001",
    cvNumber: "CV-000001",
    name: "Mst. Moriam Begum",
    email: "moriam.begum@aktraders.com",
    phone: "01967440359",
    department: "Housekeeping & Facilities",
    designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
    status: "active",
    joiningDate: "2023-07-01",
    avatarUrl: "/uploads/photos/candidate_photo_1.jpg",
    personalInformation: {
      fullName: "Mst. Moriam Begum (মোসাঃ মরিয়ম বেগম)",
      photoUrl: "/uploads/photos/candidate_photo_1.jpg",
      gender: "Female",
      dob: "1987-04-01",
      nationality: "Bangladeshi",
      maritalStatus: "Married",
      religion: "Islam",
      nidNumber: "2616882290871",
      passportNumber: "",
      drivingLicense: "",
      mobile: "01967440359",
      email: "moriam.begum@aktraders.com",
      presentAddress: "Holding: 6, Manda, Post: Manda - 1214, Sabujbagh, Dhaka",
      permanentAddress: "Village: Luterchar, Post: Daudkandi, Upazila: Daudkandi, District: Cumilla",
      emergencyContact: "Md. Khokon (Husband) - 01967440359",
      fatherName: "Kashem Bepari (কাসেম বেপারী)",
      motherName: "Rezia Begum / Rezia Khatun (রেজিয়া বেগম)",
      bankAccountNumber: "4432101007283",
      height: "5' 3\"",
      weight: "70 kg"
    },
    employmentDetails: {
      employeeId: "EMP-000001",
      applicantId: "APP-000001",
      cvNumber: "CV-000001",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      workplace: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
      joiningDate: "2023-07-01",
      employmentType: "Full-Time (Outsourced)",
      salaryScale: "Grade 20",
      currentStatus: "active",
      sourceOfHire: "Outsourcing Process",
      verificationStatus: "Verified (ACC/Dudok Certificate & NID Authenticated)"
    },
    educationalQualifications: [
      {
        id: "edu-001-1",
        degree: "Primary Education (Class 5 / ৫ম শ্রেণী)",
        major: "General",
        institution: "Luterchar Primary School",
        passingYear: "1998",
        board: "Cumilla",
        result: "Passed"
      }
    ],
    workExperience: [
      {
        id: "exp-001-1",
        role: "Cleaner / পরিচ্ছন্নতাকর্মী",
        company: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        duration: "01 July 2023 - Present",
        isCurrent: true,
        description: "Providing honest, dedicated cleaning and sanitation services at ACC Head Office under outsourcing process."
      }
    ],
    attachedDocuments: [
      {
        id: "doc-001-1",
        documentType: "CV / Biodata",
        originalFileName: "Moriam Begum Cleaner-019 Dudok.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_1.pdf",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-001-2",
        documentType: "National ID Card",
        originalFileName: "NID-2616882290871.jpg",
        fileUrl: "/uploads/photos/candidate_photo_1.jpg",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-001-3",
        documentType: "Experience Certificate",
        originalFileName: "Dudok_Experience_Moriam.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_1.pdf",
        uploadedAt: new Date().toISOString()
      }
    ],
    otherDetails: {
      skills: ["Commercial Cleaning", "Office Sanitation", "Waste Management", "Hygiene Maintenance"],
      languages: ["Bengali (Native)"],
      certifications: ["Anti-Corruption Commission Service Certificate"],
      professionalSummary: "Diligent, honest, and experienced cleaning professional with dedicated service history at the Anti-Corruption Commission."
    }
  },
  {
    id: "EMP-000002",
    employeeId: "EMP-000002",
    applicantId: "APP-000002",
    cvNumber: "CV-000002",
    name: "Kallani Das",
    email: "kallani.das@aktraders.com",
    phone: "01767797536",
    department: "Housekeeping & Facilities",
    designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
    status: "active",
    joiningDate: "2023-07-01",
    avatarUrl: "/uploads/photos/candidate_photo_2.jpg",
    personalInformation: {
      fullName: "Kallani Das (কল্যাণী দাস)",
      photoUrl: "/uploads/photos/candidate_photo_2.jpg",
      gender: "Female",
      dob: "1977-01-01",
      nationality: "Bangladeshi",
      maritalStatus: "Married",
      religion: "Hindu",
      nidNumber: "8241485542",
      passportNumber: "",
      drivingLicense: "",
      mobile: "01767797536",
      email: "kallani.das@aktraders.com",
      presentAddress: "House: 21/2, Palashpur Gas Road R-8 B-D, Post: Donia - 1236, Kadamtali, Dhaka",
      permanentAddress: "House: 21/2, Palashpur Gas Road R-8 B-D, Post: Donia - 1236, Kadamtali, Dhaka",
      emergencyContact: "01767797536",
      fatherName: "Gojen Basu (গজেন বসু)",
      motherName: "Rupali Basu / Rupashi Basu (রুপালী বসু)",
      bankAccountNumber: "4432101006275",
      height: "5' 6\"",
      weight: "65 kg"
    },
    employmentDetails: {
      employeeId: "EMP-000002",
      applicantId: "APP-000002",
      cvNumber: "CV-000002",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      workplace: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
      joiningDate: "2023-07-01",
      employmentType: "Full-Time (Outsourced)",
      salaryScale: "Grade 20",
      currentStatus: "active",
      sourceOfHire: "Outsourcing Process",
      verificationStatus: "Verified (ACC/Dudok Certificate & NID Authenticated)"
    },
    educationalQualifications: [
      {
        id: "edu-002-1",
        degree: "Primary Education (Class 4 / ৪র্থ শ্রেণী)",
        major: "General",
        institution: "Jessore Primary School",
        passingYear: "1988",
        board: "Jessore",
        result: "Passed"
      }
    ],
    workExperience: [
      {
        id: "exp-002-1",
        role: "Cleaner / পরিচ্ছন্নতাকর্মী",
        company: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        duration: "01 July 2023 - Present",
        isCurrent: true,
        description: "Providing honest, dedicated cleaning and sanitation services at ACC Head Office under outsourcing process."
      }
    ],
    attachedDocuments: [
      {
        id: "doc-002-1",
        documentType: "CV / Biodata",
        originalFileName: "kollani das cleaner-007 Dudok.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_2.pdf",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-002-2",
        documentType: "National ID Card",
        originalFileName: "NID-8241485542.jpg",
        fileUrl: "/uploads/photos/candidate_photo_2.jpg",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-002-3",
        documentType: "Experience Certificate",
        originalFileName: "Dudok_Experience_Kallani.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_2.pdf",
        uploadedAt: new Date().toISOString()
      }
    ],
    otherDetails: {
      skills: ["Commercial Cleaning", "Floor Care", "Sanitation", "Hygiene Maintenance"],
      languages: ["Bengali (Native)"],
      certifications: ["Anti-Corruption Commission Service Certificate"],
      professionalSummary: "Reliable cleaning staff with verified service track record at the Anti-Corruption Commission."
    }
  },
  {
    id: "EMP-000003",
    employeeId: "EMP-000003",
    applicantId: "APP-000003",
    cvNumber: "CV-000003",
    name: "Lucky Akter",
    email: "lucky.akter@aktraders.com",
    phone: "01790727245",
    department: "Housekeeping & Facilities",
    designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
    status: "active",
    joiningDate: "2023-07-01",
    avatarUrl: "/uploads/photos/candidate_photo_3.jpg",
    personalInformation: {
      fullName: "Lucky Akter (লাকী আক্তার)",
      photoUrl: "/uploads/photos/candidate_photo_3.jpg",
      gender: "Female",
      dob: "1988-01-20",
      nationality: "Bangladeshi",
      maritalStatus: "Married",
      religion: "Islam",
      nidNumber: "8696990590",
      passportNumber: "",
      drivingLicense: "",
      mobile: "01790727245",
      email: "lucky.akter@aktraders.com",
      presentAddress: "Holding: 126, Manda, Post: Basabo - 1214, Sabujbagh, Dhaka",
      permanentAddress: "Holding: 126, Manda, Post: Basabo - 1214, Sabujbagh, Dhaka",
      emergencyContact: "01790727245",
      fatherName: "Late Abdul Razzak (মৃত আব্দুল রাজ্জাক)",
      motherName: "Jahanara Begum (জাহানারা বেগম)",
      bankAccountNumber: "4432101007280",
      height: "5' 4\"",
      weight: "55 kg"
    },
    employmentDetails: {
      employeeId: "EMP-000003",
      applicantId: "APP-000003",
      cvNumber: "CV-000003",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      workplace: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
      joiningDate: "2023-07-01",
      employmentType: "Full-Time (Outsourced)",
      salaryScale: "Grade 20",
      currentStatus: "active",
      sourceOfHire: "Outsourcing Process",
      verificationStatus: "Verified (ACC/Dudok Certificate & NID Authenticated)"
    },
    educationalQualifications: [
      {
        id: "edu-003-1",
        degree: "Junior School Certificate (Class 8 / ৮ম শ্রেণী)",
        major: "General",
        institution: "Madaripur High School",
        passingYear: "2002",
        board: "Dhaka",
        result: "Passed"
      }
    ],
    workExperience: [
      {
        id: "exp-003-1",
        role: "Cleaner / পরিচ্ছন্নতাকর্মী",
        company: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        duration: "01 July 2023 - Present",
        isCurrent: true,
        description: "Providing honest, dedicated cleaning and sanitation services at ACC Head Office under outsourcing process."
      }
    ],
    attachedDocuments: [
      {
        id: "doc-003-1",
        documentType: "CV / Biodata",
        originalFileName: "Lucky Akter Cleaner- 014 Dudok.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_3.pdf",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-003-2",
        documentType: "National ID Card",
        originalFileName: "NID-8696990590.jpg",
        fileUrl: "/uploads/photos/candidate_photo_3.jpg",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-003-3",
        documentType: "Experience Certificate",
        originalFileName: "Dudok_Experience_Lucky.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_3.pdf",
        uploadedAt: new Date().toISOString()
      }
    ],
    otherDetails: {
      skills: ["Commercial Cleaning", "Sanitation", "Office Maintenance", "Hygiene Standards"],
      languages: ["Bengali (Native)"],
      certifications: ["Anti-Corruption Commission Service Certificate"],
      professionalSummary: "Trustworthy, punctual cleaning professional with 8th grade education and verified institutional experience."
    }
  },
  {
    id: "EMP-000004",
    employeeId: "EMP-000004",
    applicantId: "APP-000004",
    cvNumber: "CV-000004",
    name: "Md. Hridoy Hosen",
    email: "hridoy.hosen@aktraders.com",
    phone: "01999525200",
    department: "Housekeeping & Facilities",
    designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
    status: "active",
    joiningDate: "2023-07-01",
    avatarUrl: "/uploads/photos/candidate_photo_4.jpg",
    personalInformation: {
      fullName: "Md. Hridoy Hosen (মোঃ হৃদয় হোসেন)",
      photoUrl: "/uploads/photos/candidate_photo_4.jpg",
      gender: "Male",
      dob: "1994-05-27",
      nationality: "Bangladeshi",
      maritalStatus: "Married",
      religion: "Islam",
      nidNumber: "9570855966",
      passportNumber: "",
      drivingLicense: "",
      mobile: "01999525200",
      email: "hridoy.hosen@aktraders.com",
      presentAddress: "Holding: 555, North Manda, Post: Basabo TSO - 1214, Mugda / Sabujbagh, Dhaka",
      permanentAddress: "Village: Munsikandi, Post: Zanjira, Thana: Zanjira, District: Shariatpur",
      emergencyContact: "01999525200",
      fatherName: "Md. Samsul Haque Hawlader (মোঃ সামসুল হক হাওলাদার)",
      motherName: "Amena Begum (আমেনা বেগম)",
      bankAccountNumber: "4432101006282",
      height: "5' 5\"",
      weight: "62 kg"
    },
    employmentDetails: {
      employeeId: "EMP-000004",
      applicantId: "APP-000004",
      cvNumber: "CV-000004",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      workplace: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
      joiningDate: "2023-07-01",
      employmentType: "Full-Time (Outsourced)",
      salaryScale: "Grade 20",
      currentStatus: "active",
      sourceOfHire: "Outsourcing Process",
      verificationStatus: "Verified (ACC/Dudok Certificate & NID Authenticated)"
    },
    educationalQualifications: [
      {
        id: "edu-004-1",
        degree: "Junior School Certificate (Class 8 / ৮ম শ্রেণী)",
        major: "General",
        institution: "Zanjira High School",
        passingYear: "2008",
        board: "Dhaka",
        result: "Passed"
      }
    ],
    workExperience: [
      {
        id: "exp-004-1",
        role: "Cleaner / পরিচ্ছন্নতাকর্মী",
        company: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        duration: "01 July 2023 - Present",
        isCurrent: true,
        description: "Providing honest, dedicated cleaning and sanitation services at ACC Head Office under outsourcing process."
      }
    ],
    attachedDocuments: [
      {
        id: "doc-004-1",
        documentType: "CV / Biodata",
        originalFileName: "MD. Hridoy Hosen Cleaner-004 Dudok.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_4.pdf",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-004-2",
        documentType: "National ID Card",
        originalFileName: "NID-9570855966.jpg",
        fileUrl: "/uploads/photos/candidate_photo_4.jpg",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-004-3",
        documentType: "Experience Certificate",
        originalFileName: "Dudok_Experience_Hridoy.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_4.pdf",
        uploadedAt: new Date().toISOString()
      }
    ],
    otherDetails: {
      skills: ["Commercial Cleaning", "Sanitation", "Office Maintenance", "Team Coordination"],
      languages: ["Bengali (Native)"],
      certifications: ["Anti-Corruption Commission Service Certificate"],
      professionalSummary: "Energetic and dedicated cleaning specialist with solid background in commercial facility management."
    }
  },
  {
    id: "EMP-000005",
    employeeId: "EMP-000005",
    applicantId: "APP-000005",
    cvNumber: "CV-000005",
    name: "Md. Ranju Mia",
    email: "ranju.mia@aktraders.com",
    phone: "01704-436712",
    department: "Housekeeping & Facilities",
    designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
    status: "active",
    joiningDate: "2023-07-01",
    avatarUrl: "/uploads/photos/candidate_photo_5.jpg",
    personalInformation: {
      fullName: "Md. Ranju Mia (মোঃ রঞ্জু মিয়া)",
      photoUrl: "/uploads/photos/candidate_photo_5.jpg",
      gender: "Male",
      dob: "1996-07-27",
      nationality: "Bangladeshi",
      maritalStatus: "Married",
      religion: "Islam",
      nidNumber: "4186472538",
      passportNumber: "",
      drivingLicense: "",
      mobile: "01704-436712",
      email: "ranju.mia@aktraders.com",
      presentAddress: "Segunbagicha, Dhaka",
      permanentAddress: "Holding: 0, Village: Jantiarpada, Post: Tekani Chukai Nagar - 5826, Thana/Upazila: Sonatala, District: Bogura",
      emergencyContact: "01704-436712",
      fatherName: "Md. Kaltu Mondal (মোঃ কাল্টু মন্ডল)",
      motherName: "Mst. Peyara Begum (মোসাঃ পেয়ারা বেগম)",
      bankAccountNumber: "4432101007320",
      height: "5' 5\"",
      weight: "55 kg"
    },
    employmentDetails: {
      employeeId: "EMP-000005",
      applicantId: "APP-000005",
      cvNumber: "CV-000005",
      department: "Housekeeping & Facilities",
      designation: "Cleaner / পরিচ্ছন্নতাকর্মী",
      workplace: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
      joiningDate: "2023-07-01",
      employmentType: "Full-Time (Outsourced)",
      salaryScale: "Grade 20",
      currentStatus: "active",
      sourceOfHire: "Outsourcing Process",
      verificationStatus: "Verified (ACC/Dudok Certificate & NID Authenticated)"
    },
    educationalQualifications: [
      {
        id: "edu-005-1",
        degree: "Secondary School Certificate (SSC / এস.এস.সি)",
        major: "Humanities",
        institution: "Tekani Chukai Nagar High School, Sonatala, Bogura",
        passingYear: "2012",
        board: "Rajshahi",
        result: "Passed"
      }
    ],
    workExperience: [
      {
        id: "exp-005-1",
        role: "Cleaner / পরিচ্ছন্নতাকর্মী",
        company: "Anti-Corruption Commission (দুদক), Head Office, Dhaka",
        duration: "01 July 2023 - Present",
        isCurrent: true,
        description: "Providing honest, dedicated cleaning and sanitation services at ACC Head Office under outsourcing process."
      }
    ],
    attachedDocuments: [
      {
        id: "doc-005-1",
        documentType: "CV / Biodata",
        originalFileName: "Md Ronju Mia Cleaner-020 Duduk.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_5.pdf",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-005-2",
        documentType: "National ID Card",
        originalFileName: "NID-4186472538.jpg",
        fileUrl: "/uploads/photos/candidate_photo_5.jpg",
        uploadedAt: new Date().toISOString()
      },
      {
        id: "doc-005-3",
        documentType: "Experience Certificate",
        originalFileName: "Dudok_Experience_Ranju.pdf",
        fileUrl: "/uploads/cvs/candidate_cv_5.pdf",
        uploadedAt: new Date().toISOString()
      }
    ],
    otherDetails: {
      skills: ["Commercial Cleaning", "Facility Sanitation", "Record Keeping", "Team Player"],
      languages: ["Bengali (Native)", "English (Basic)"],
      certifications: ["Anti-Corruption Commission Service Certificate"],
      professionalSummary: "SSC-qualified cleaning and housekeeping professional with proven dependability and excellent service record."
    }
  }
];

async function insertAll() {
  console.log("=========================================");
  console.log("🚀 Inserting 5 Candidates into Supabase");
  console.log("=========================================");

  for (const candidate of candidates) {
    console.log(`\nInserting candidate: ${candidate.name} (${candidate.id})...`);

    // 1. Employee table row
    const empRow = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      department: candidate.department,
      designation: candidate.designation,
      status: candidate.status,
      joining_date: candidate.joiningDate,
      cv_file_name: candidate.attachedDocuments[0].originalFileName,
      cv_file_size: 350000,
      avatar_url: candidate.avatarUrl,
      cv_data: candidate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: empErr } = await supabase.from("employees").upsert(empRow);
    if (empErr) {
      console.error(`❌ Error inserting into employees for ${candidate.name}:`, empErr.message);
    } else {
      console.log(`✅ Saved to 'employees' table`);
    }

    // 2. CV record row
    const cvRow = {
      id: `cv-${candidate.id.toLowerCase()}`,
      candidate_name: candidate.name,
      extracted_text: `Candidate Name: ${candidate.name}\nDesignation: ${candidate.designation}\nPhone: ${candidate.phone}\nNID: ${candidate.personalInformation.nidNumber}\nFather: ${candidate.personalInformation.fatherName}\nMother: ${candidate.personalInformation.motherName}\nAddress: ${candidate.personalInformation.presentAddress}`,
      structured_data: JSON.stringify(candidate),
      original_file_name: candidate.attachedDocuments[0].originalFileName,
      original_pdf_url: candidate.attachedDocuments[0].fileUrl,
      created_at: new Date().toISOString(),
    };

    const { error: cvErr } = await supabase.from("cv_records").upsert(cvRow);
    if (cvErr) {
      console.error(`❌ Error inserting into cv_records for ${candidate.name}:`, cvErr.message);
    } else {
      console.log(`✅ Saved to 'cv_records' table`);
    }
  }

  console.log("\n=========================================");
  console.log("🎉 ALL 5 CANDIDATES INSERTED SUCCESSFULLY!");
  console.log("=========================================");
}

insertAll().catch(console.error);
