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
} from "lucide-react";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";

export default function EmployeeProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"personal" | "employment" | "education" | "experience" | "documents" | "other">("personal");

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

  // Fallback defaults matching exact fields from screenshot
  const name = employee?.name || "Md. Rahim Hasan";
  const designation = employee?.designation || "Senior Executive";
  const department = employee?.department || "Sales Department";
  const joiningDate = employee?.joiningDate || "01-01-2023";
  const employeeIdCode = employee?.id ? `AKT-${employee.id.slice(-4).toUpperCase()}` : "AKT-0001";
  const email = employee?.email || "rahim.hasan@email.com";
  const phone = employee?.phone || "+880 1700-000000";
  const pdfUrl = employee?.cvData?.originalPdfUrl;
  const pdfFileName = employee?.cvFileName || `${name.replace(/\s+/g, "_")}_CV.pdf`;

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
                <Avatar name={name} size="xl" className="h-24 w-24 text-2xl font-extrabold shadow-md border-4 border-slate-50 dark:border-slate-900" />
                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{designation}</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{department}</p>
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
                  <span className="font-extrabold text-slate-900 dark:text-white font-mono">{joiningDate}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Employment</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">Full-Time</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Status</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Navigation Tabs Bar */}
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
                    ? "bg-[#0066ff] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Main Body Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Left Card (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-6">
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
                {/* Personal Key-Values */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Full Name</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">{name}</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Father's Name</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">Md. Karim Hasan</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Mother's Name</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">Mrs. Salma Begum</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Date of Birth</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">15 January 1993</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Gender</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">Male</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Marital Status</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">Married</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Nationality</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">Bangladeshi</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Religion</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-slate-900 dark:text-white">Islam</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">NID Number</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">19931234567890123</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Blood Group</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-red-600 font-mono">B+</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Mobile Number</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">{phone}</span>
                  </div>

                  <div className="grid grid-cols-12 items-center">
                    <span className="col-span-5 text-slate-500 font-medium">Email</span>
                    <span className="col-span-1 text-slate-400 font-bold">:</span>
                    <span className="col-span-6 font-bold text-[#0066ff] truncate">{email}</span>
                  </div>
                </div>

                {/* Right: Address & Emergency Contact */}
                <div className="space-y-6 border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#0066ff]" />
                      <span>Present Address</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      House-12, Road-6, Dhanmondi, Dhaka-1205, Bangladesh
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span>Permanent Address</span>
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      House-12, Road-6, Dhanmondi, Dhaka-1205, Bangladesh
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-amber-600" />
                      <span>Emergency Contact</span>
                    </h4>
                    <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                      <p className="font-bold font-mono text-sm">+880 1800-000000</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">(Brother — Md. Sohel Hasan)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Attached Documents Card (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <Paperclip className="h-4.5 w-4.5 text-[#0066ff]" />
                <span>Attached Documents</span>
              </h3>

              <div className="space-y-3">
                {[
                  { name: pdfFileName, size: "3.2 MB", type: "pdf", url: pdfUrl },
                  { name: "NID_Card.pdf", size: "1.1 MB", type: "pdf", url: pdfUrl },
                  { name: "Educational_Certificate.pdf", size: "2.4 MB", type: "pdf", url: pdfUrl },
                  { name: "Experience_Certificate.pdf", size: "1.8 MB", type: "pdf", url: pdfUrl },
                  { name: "Passport_Size_Photo.jpg", size: "512 KB", type: "img", url: pdfUrl },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 hover:border-[#0066ff]/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="p-2 rounded-lg bg-blue-100 text-[#0066ff] dark:bg-blue-950 dark:text-blue-400 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{doc.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 ml-2">
                      <a href={doc.url || "#"} target="_blank" rel="noopener noreferrer" title="View Document">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-[#e8f1ff] hover:text-[#0066ff] transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </a>
                      <a href={doc.url || "#"} download={doc.name} title="Download Document">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-[#e8f1ff] hover:text-[#0066ff] transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full justify-center text-xs font-bold rounded-xl border-[#0066ff] text-[#0066ff] hover:bg-[#e8f1ff]/50" leftIcon={<Download className="h-4 w-4" />}>
                  Download All Documents
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Bottom 3 Cards Row (Employment, Education, Experience Timeline) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Employment Details */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-4.5 w-4.5 text-[#0066ff]" />
                <span>Employment Details</span>
              </h3>
              <button className="text-slate-400 hover:text-[#0066ff]">
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Department</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">{department}</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Designation</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">{designation}</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Workplace</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">Dhanmondi Office, Dhaka</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Joining Date</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">{joiningDate}</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Employment Type</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">Full-Time</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Salary Scale</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold font-mono text-emerald-600">৳ 45,000 (Monthly)</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Employment Status</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-emerald-600">Active</span>
              </div>
            </div>
          </div>

          {/* Card B: Educational Qualification */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-purple-600" />
                <span>Educational Qualification</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Highest Degree</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">BSc in Computer Science</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Institution</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">University of Dhaka</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Passing Year</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold font-mono text-slate-900 dark:text-white">2018</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Board / University</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">University of Dhaka</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Field / Major</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold text-slate-900 dark:text-white">CSE</span>
              </div>

              <div className="grid grid-cols-12">
                <span className="col-span-5 text-slate-500 font-medium">Result</span>
                <span className="col-span-1 text-slate-400 font-bold">:</span>
                <span className="col-span-6 font-bold font-mono text-[#0066ff]">CGPA 3.25 (out of 4.00)</span>
              </div>
            </div>
          </div>

          {/* Card C: Work Experience Timeline */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-[#111c38] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-amber-600" />
                <span>Experience Summary</span>
              </h3>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Item 1 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-[#0066ff] ring-4 ring-blue-100 dark:ring-blue-950" />
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">Senior Executive</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    Current
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">ABC Limited</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Jan 2021 — Present</p>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Executive</h4>
                <p className="text-[11px] font-semibold text-slate-500">XYZ Corporation</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Jun 2019 — Dec 2020</p>
              </div>

              {/* Item 3 */}
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Junior Executive</h4>
                <p className="text-[11px] font-semibold text-slate-500">DEF Group</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">Jan 2018 — May 2019</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
