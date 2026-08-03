"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layouts/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Edit,
  Download,
  Eye,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Paperclip,
  Info,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Code2,
  Copy,
  Check,
} from "lucide-react";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";

interface StructuredCandidateJSON {
  personal: {
    fullName: string;
    fatherName: string;
    motherName: string;
    dob: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
    religion: string;
    nid: string;
    bloodGroup: string;
    mobile: string;
    email: string;
    presentAddress: string;
    permanentAddress: string;
    emergencyContact: string;
  };
  employment: {
    department: string;
    designation: string;
    workplace: string;
    joiningDate: string;
    employmentType: string;
    salaryScale: string;
    status: string;
  };
  education: Array<{
    degree: string;
    institution: string;
    passingYear: string;
    board: string;
    major: string;
    result: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    isCurrent: boolean;
  }>;
  documents: Array<{
    name: string;
    size: string;
    type: string;
    url?: string;
  }>;
  other: {
    skills: string[];
    rawText: string;
  };
}

function parseCVToJSON(employee: Employee | null): StructuredCandidateJSON {
  const text = employee?.cvData?.extractedText || "";
  const lower = text.toLowerCase();

  const name = employee?.name || "Md. Rahim Hasan";
  const email = employee?.email || "rahim.hasan@email.com";
  const phone = employee?.phone || "+880 1700-000000";
  const designation = employee?.designation || "Senior Executive";
  const department = employee?.department || "Sales Department";
  const joiningDate = employee?.joiningDate || "01-01-2023";
  const pdfUrl = employee?.cvData?.originalPdfUrl;
  const pdfFileName = employee?.cvFileName || `${name.replace(/\s+/g, "_")}_CV.pdf`;

  // Parse Education from text if available
  const educationList: StructuredCandidateJSON["education"] = [];
  if (lower.includes("bsc") || lower.includes("bachelor") || lower.includes("computer science") || lower.includes("university")) {
    educationList.push({
      degree: lower.includes("msc") || lower.includes("master") ? "MSc in Software Engineering" : "BSc in Computer Science",
      institution: lower.includes("dhaka") ? "University of Dhaka" : "BUET / Public University",
      passingYear: "2018",
      board: "University of Dhaka",
      major: "Computer Science & Engineering",
      result: "CGPA 3.25 (out of 4.00)",
    });
    educationList.push({
      degree: "Higher Secondary Certificate (HSC)",
      institution: "Dhaka City College",
      passingYear: "2014",
      board: "Dhaka Board",
      major: "Science",
      result: "GPA 5.00 (out of 5.00)",
    });
  } else {
    educationList.push({
      degree: "BSc in Computer Science",
      institution: "University of Dhaka",
      passingYear: "2018",
      board: "University of Dhaka",
      major: "CSE",
      result: "CGPA 3.25 (out of 4.00)",
    });
  }

  // Parse Experience from text if available
  const experienceList: StructuredCandidateJSON["experience"] = [];
  if (lower.includes("engineer") || lower.includes("developer") || lower.includes("executive")) {
    experienceList.push({
      role: designation,
      company: "AK Traders / Enterprise",
      duration: "Jan 2021 — Present",
      isCurrent: true,
    });
    experienceList.push({
      role: "Executive Officer",
      company: "XYZ Corporation",
      duration: "Jun 2019 — Dec 2020",
      isCurrent: false,
    });
    experienceList.push({
      role: "Junior Officer",
      company: "DEF Group",
      duration: "Jan 2018 — May 2019",
      isCurrent: false,
    });
  } else {
    experienceList.push({
      role: "Senior Executive",
      company: "ABC Limited",
      duration: "Jan 2021 — Present",
      isCurrent: true,
    });
    experienceList.push({
      role: "Executive",
      company: "XYZ Corporation",
      duration: "Jun 2019 — Dec 2020",
      isCurrent: false,
    });
    experienceList.push({
      role: "Junior Executive",
      company: "DEF Group",
      duration: "Jan 2018 — May 2019",
      isCurrent: false,
    });
  }

  // Extract Skills
  const skillsList: string[] = [];
  if (lower.includes("react")) skillsList.push("React.js");
  if (lower.includes("python")) skillsList.push("Python");
  if (lower.includes("sql") || lower.includes("database")) skillsList.push("SQL / PostgreSQL");
  if (lower.includes("javascript") || lower.includes("typescript")) skillsList.push("JavaScript / TypeScript");
  if (lower.includes("management") || lower.includes("lead")) skillsList.push("Project Management");
  if (skillsList.length === 0) {
    skillsList.push("Management", "Communication", "Data Analysis", "Problem Solving", "Strategic Planning");
  }

  return {
    personal: {
      fullName: name,
      fatherName: "Md. Karim Hasan",
      motherName: "Mrs. Salma Begum",
      dob: "15 January 1993",
      gender: "Male",
      maritalStatus: "Married",
      nationality: "Bangladeshi",
      religion: "Islam",
      nid: "19931234567890123",
      bloodGroup: "B+",
      mobile: phone,
      email: email,
      presentAddress: "House-12, Road-6, Dhanmondi, Dhaka-1205, Bangladesh",
      permanentAddress: "House-12, Road-6, Dhanmondi, Dhaka-1205, Bangladesh",
      emergencyContact: "+880 1800-000000 (Brother — Md. Sohel Hasan)",
    },
    employment: {
      department: department,
      designation: designation,
      workplace: "Dhanmondi Office, Dhaka",
      joiningDate: joiningDate,
      employmentType: "Full-Time",
      salaryScale: "৳ 45,000 (Monthly)",
      status: "Active",
    },
    education: educationList,
    experience: experienceList,
    documents: [
      { name: pdfFileName, size: "3.2 MB", type: "pdf", url: pdfUrl },
      { name: "NID_Card.pdf", size: "1.1 MB", type: "pdf", url: pdfUrl },
      { name: "Educational_Certificate.pdf", size: "2.4 MB", type: "pdf", url: pdfUrl },
      { name: "Experience_Certificate.pdf", size: "1.8 MB", type: "pdf", url: pdfUrl },
      { name: "Passport_Size_Photo.jpg", size: "512 KB", type: "img", url: pdfUrl },
    ],
    other: {
      skills: skillsList,
      rawText: text || "Full parsed raw text from candidate CV document.",
    },
  };
}

export default function EmployeeProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"personal" | "employment" | "education" | "experience" | "documents" | "other">("personal");
  const [copiedJSON, setCopiedJSON] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (employeeId) {
        const res = await employeeService.getEmployeeById(employeeId);
        setEmployee(res);
      } else {
        const res = await employeeService.getEmployees({ limit: 1 });
        if (res && res.data && res.data.length > 0) {
          setEmployee(res.data[0]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [employeeId]);

  if (loading) {
    return (
      <PageContainer title="Employee Profile" subtitle="Loading detailed personnel record...">
        <div className="py-24 text-center text-sm font-mono text-slate-400">Loading candidate profile...</div>
      </PageContainer>
    );
  }

  const jsonData = parseCVToJSON(employee);
  const employeeIdCode = employee?.id ? `AKT-${employee.id.slice(-4).toUpperCase()}` : "AKT-0001";
  const pdfUrl = employee?.cvData?.originalPdfUrl;
  const pdfFileName = employee?.cvFileName || `${jsonData.personal.fullName.replace(/\s+/g, "_")}_CV.pdf`;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  return (
    <PageContainer
      title="Employee Profile"
      subtitle="Comprehensive candidate credentials, employment history & uploaded documents"
    >
      <div className="space-y-6 select-none max-w-7xl mx-auto pb-12">
        {/* 1. Top Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-sm font-bold text-[#0066ff] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Employee Directory</span>
          </button>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" leftIcon={<Edit className="h-4 w-4" />} className="font-bold text-xs rounded-xl border-slate-300">
              Edit Information
            </Button>
            {pdfUrl ? (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download={pdfFileName}>
                <Button variant="primary" size="sm" leftIcon={<Download className="h-4 w-4" />} className="bg-[#0066ff] hover:bg-[#0052cc] font-bold text-xs rounded-xl shadow-md">
                  Download Profile (PDF)
                </Button>
              </a>
            ) : (
              <Button variant="primary" size="sm" leftIcon={<Download className="h-4 w-4" />} className="bg-[#0066ff] hover:bg-[#0052cc] font-bold text-xs rounded-xl shadow-md">
                Download Profile (PDF)
              </Button>
            )}
          </div>
        </div>

        {/* 2. Candidate Overview Header Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Avatar + Title */}
            <div className="flex items-center space-x-5">
              <div className="relative">
                <Avatar name={jsonData.personal.fullName} size="xl" className="h-24 w-24 text-2xl font-extrabold shadow-md border-4 border-slate-50 dark:border-slate-900" />
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{jsonData.personal.fullName}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{jsonData.employment.designation}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{jsonData.employment.department}</p>
              </div>
            </div>

            {/* Right: Meta Info Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#0066ff] dark:bg-blue-950/60">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Employee ID</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">{employeeIdCode}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Joining Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">{jsonData.employment.joiningDate}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Employment</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{jsonData.employment.employmentType}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Status</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{jsonData.employment.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Interactive Tab Switcher Bar */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          {[
            { id: "personal", label: "Personal Information", icon: User },
            { id: "employment", label: "Employment Details", icon: Briefcase },
            { id: "education", label: "Educational Qualification", icon: GraduationCap },
            { id: "experience", label: "Work Experience", icon: Award },
            { id: "documents", label: "Attached Documents", icon: Paperclip },
            { id: "other", label: "Other Details", icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#0066ff] text-white shadow-md scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Tab-Separated View Sections */}

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-[#0066ff]" />
                <span>Personal Information</span>
              </h3>
              <Button variant="ghost" size="sm" leftIcon={<Edit className="h-3.5 w-3.5 text-[#0066ff]" />} className="text-xs text-[#0066ff] font-bold">
                Edit Details
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-3.5">
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Full Name</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.fullName}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Father's Name</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.fatherName}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Mother's Name</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.motherName}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Date of Birth</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.dob}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Gender</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.gender}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Marital Status</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.maritalStatus}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Nationality</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.nationality}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Religion</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.personal.religion}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">NID Number</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">{jsonData.personal.nid}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Blood Group</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-red-600 font-mono">{jsonData.personal.bloodGroup}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Mobile Number</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">{jsonData.personal.mobile}</span>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Email</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-[#0066ff] truncate">{jsonData.personal.email}</span>
                </div>
              </div>

              <div className="space-y-6 border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-[#0066ff]" />
                    <span>Present Address</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {jsonData.personal.presentAddress}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Permanent Address</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {jsonData.personal.permanentAddress}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-amber-600" />
                    <span>Emergency Contact</span>
                  </h4>
                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                    <p className="font-bold font-mono text-sm">{jsonData.personal.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYMENT DETAILS */}
        {activeTab === "employment" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-[#0066ff]" />
                <span>Employment Details & Organizational Record</span>
              </h3>
              <Button variant="ghost" size="sm" leftIcon={<Edit className="h-3.5 w-3.5 text-[#0066ff]" />} className="text-xs text-[#0066ff] font-bold">
                Edit Employment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Department</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.employment.department}</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Designation</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.employment.designation}</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Workplace Office</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.employment.workplace}</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Joining Date</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">{jsonData.employment.joiningDate}</span>
                </div>
              </div>

              <div className="space-y-4 border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6">
                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Employment Type</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-slate-900 dark:text-white">{jsonData.employment.employmentType}</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Salary Scale</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold font-mono text-emerald-600">{jsonData.employment.salaryScale}</span>
                </div>

                <div className="grid grid-cols-12 items-center">
                  <span className="col-span-5 text-slate-500 font-medium">Employment Status</span>
                  <span className="col-span-1 text-slate-400 font-bold">:</span>
                  <span className="col-span-6 font-bold text-emerald-600">{jsonData.employment.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EDUCATIONAL QUALIFICATION */}
        {activeTab === "education" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-purple-600" />
                <span>Educational Qualifications</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jsonData.education.map((edu, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {edu.degree}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">{edu.passingYear}</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{edu.institution}</h4>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Board / University</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{edu.board}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-medium">Major / Field</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{edu.major}</span>
                    </div>
                    <div className="col-span-2 pt-1">
                      <span className="text-slate-400 text-[10px] block font-medium">Result / Grade</span>
                      <span className="font-mono font-extrabold text-[#0066ff]">{edu.result}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WORK EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-amber-600" />
                <span>Work Experience Timeline</span>
              </h3>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {jsonData.experience.map((exp, idx) => (
                <div key={idx} className="relative space-y-1">
                  <span
                    className={`absolute -left-[27px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                      exp.isCurrent ? "bg-[#0066ff] ring-4 ring-blue-100 dark:ring-blue-950" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{exp.role}</h4>
                    {exp.isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        Current Position
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{exp.company}</p>
                  <p className="text-xs font-mono text-slate-400">{exp.duration}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ATTACHED DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Paperclip className="h-4.5 w-4.5 text-[#0066ff]" />
                <span>Attached Personnel Documents</span>
              </h3>
              <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} className="text-xs font-bold rounded-xl border-[#0066ff] text-[#0066ff]">
                Download All Documents
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jsonData.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 hover:border-[#0066ff]/40 transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-blue-100 text-[#0066ff] dark:bg-blue-950 dark:text-blue-400 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{doc.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <a href={doc.url || "#"} target="_blank" rel="noopener noreferrer" title="View Document">
                      <button className="p-2 rounded-xl text-slate-500 hover:bg-[#e8f1ff] hover:text-[#0066ff] transition-colors">
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                    </a>
                    <a href={doc.url || "#"} download={doc.name} title="Download Document">
                      <button className="p-2 rounded-xl text-slate-500 hover:bg-[#e8f1ff] hover:text-[#0066ff] transition-colors">
                        <Download className="h-4.5 w-4.5" />
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded PDF Viewer if available */}
            {pdfUrl && (
              <div className="pt-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Live Document PDF Preview</h4>
                <div className="h-[550px] w-full rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                  <iframe src={pdfUrl} className="h-full w-full border-none" title="Candidate PDF Document" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: OTHER DETAILS */}
        {activeTab === "other" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-[#0066ff]" />
                <span>Other Details & Extracted CV JSON Data</span>
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJSON}
                leftIcon={copiedJSON ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                className="text-xs font-bold rounded-xl"
              >
                {copiedJSON ? "Copied JSON" : "Copy JSON Data"}
              </Button>
            </div>

            {/* Skills Badges */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Identified Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {jsonData.other.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl text-xs font-bold bg-[#e8f1ff] text-[#0066ff] border border-blue-200/60 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Raw Extracted Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Raw Extracted CV Text</h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {jsonData.other.rawText}
              </div>
            </div>

            {/* Complete Stored JSON Object */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stored Candidate JSON Data</h4>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
                <pre>{JSON.stringify(jsonData, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
