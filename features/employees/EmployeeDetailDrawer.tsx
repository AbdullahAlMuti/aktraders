"use client";

import { useState } from "react";
import { Employee } from "@/types/employee.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  X,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Sparkles,
  FileText,
  Copy,
  CheckCircle2,
  Download,
  Building2,
  ExternalLink,
} from "lucide-react";

interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeDetailDrawer({ employee, isOpen, onClose }: EmployeeDetailDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "pdf" | "json">("details");

  if (!isOpen || !employee) return null;

  const cvData = employee.cvData || {};
  const workExperience = cvData.workExperience || [];
  const skills = cvData.skills || [];
  const pdfUrl = cvData.originalPdfUrl || cvData.original_pdf_url;

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(employee, null, 2));
    setCopied(true);
    toast.success("JSON Copied", "Employee record JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Content Drawer */}
      <div className="w-full max-w-xl bg-white dark:bg-[#071526] h-full shadow-2xl border-l border-neutral-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-slate-800 flex items-start justify-between bg-neutral-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <Avatar name={employee.name} size="lg" />
            <div>
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{employee.name}</span>
                <Badge variant={employee.status === "active" ? "success" : "secondary"}>
                  {employee.status}
                </Badge>
              </h3>
              <p className="text-xs text-[#533afd] dark:text-blue-400 font-medium mt-0.5">
                {employee.designation} • {employee.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-neutral-100 dark:border-slate-800 space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "details"
                ? "border-[#533afd] text-[#533afd] dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200"
            }`}
          >
            Profile & Overview
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "pdf"
                ? "border-[#533afd] text-[#533afd] dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200"
            }`}
          >
            Original PDF Preview
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`pb-2 border-b-2 transition-all ${
              activeTab === "json"
                ? "border-[#533afd] text-[#533afd] dark:text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-slate-200"
            }`}
          >
            Extracted JSON Payload
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs scrollbar-thin">
          {activeTab === "details" && (
            <>
              {/* Contact Info Card */}
              <div className="rounded-xl border border-neutral-200 dark:border-slate-800 bg-neutral-50/60 dark:bg-slate-900/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email:</span>
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{employee.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Phone:</span>
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{employee.phone || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Department:</span>
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{employee.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined:</span>
                  </span>
                  <span className="font-semibold font-mono text-neutral-900 dark:text-white">{employee.joiningDate || "N/A"}</span>
                </div>
              </div>

              {/* PDF Preview Link Card */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/40 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">Original Uploaded PDF</h5>
                    <p className="text-[11px] text-slate-500">{employee.cvFileName || "PDF Document"}</p>
                  </div>
                </div>
                <Link href={`/cv-upload/${employee.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                    Open Full Preview
                  </Button>
                </Link>
              </div>

              {/* Skills Badges */}
              {skills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#533afd]" />
                    <span>Extracted Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill: string, idx: number) => (
                      <span key={idx} className="rounded-full bg-[#533afd]/10 text-[#533afd] dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 font-semibold text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {workExperience.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-neutral-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                    <span>Work Experience Timeline</span>
                  </h4>
                  <div className="space-y-2.5 pl-2 border-l-2 border-neutral-200 dark:border-slate-800">
                    {workExperience.map((exp: any, idx: number) => (
                      <div key={idx} className="pl-3 relative">
                        <span className="absolute -left-[17px] top-1 h-2.5 w-2.5 rounded-full bg-[#533afd]" />
                        <p className="font-bold text-neutral-900 dark:text-slate-100">{exp.role || exp.company}</p>
                        <p className="text-neutral-500 dark:text-slate-400 text-[11px]">{exp.company}</p>
                        {exp.period && <p className="font-mono text-[10px] text-neutral-400 mt-0.5">{exp.period}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "pdf" && (
            <div className="h-[500px] w-full rounded-xl border border-neutral-200 overflow-hidden dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              {pdfUrl ? (
                <iframe src={pdfUrl} className="h-full w-full border-none" title="Original PDF Document Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText className="h-10 w-10 mb-2" />
                  <p>No PDF URL available for preview</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "json" && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-[11px] text-emerald-400 overflow-auto max-h-[500px]">
              <pre className="whitespace-pre-wrap break-words leading-relaxed">
                {JSON.stringify(employee, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between bg-neutral-50/50 dark:bg-slate-900/50">
          <Button variant="outline" onClick={handleCopyJSON} leftIcon={copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied!" : "Copy Record JSON"}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
