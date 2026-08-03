"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Calendar, Download, ExternalLink, Loader2, User, Database, Code2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cvService, MinimalCVRecord } from "@/services/cv.service";
import Link from "next/link";

export default function CVRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<MinimalCVRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "json" | "pdf">("text");
  const [copiedJSON, setCopiedJSON] = useState(false);

  useEffect(() => {
    async function loadRecord() {
      if (!id) return;
      setLoading(true);
      const data = await cvService.getCVById(id);
      if (data) {
        setRecord(data);
      } else {
        setError("CV Record not found in database.");
      }
      setLoading(false);
    }

    loadRecord();
  }, [id]);

  const handleCopyJSON = () => {
    if (record) {
      navigator.clipboard.writeText(JSON.stringify(record, null, 2));
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading saved CV record from database...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/40 space-y-4">
        <h3 className="text-lg font-bold text-red-900 dark:text-red-200">{error || "CV Record Not Found"}</h3>
        <p className="text-xs text-red-600 dark:text-red-400">The requested CV record ID does not exist in the database.</p>
        <div className="pt-2">
          <Link href="/cv-upload">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to CV Upload
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Search / Upload</span>
        </button>

        <div className="flex items-center space-x-2">
          <a href={record.originalPdfUrl} target="_blank" rel="noopener noreferrer" download={record.originalFileName}>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Download PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Candidate Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold text-xl shadow-inner">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{record.candidateName}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  {record.originalFileName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Uploaded {new Date(record.uploadedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end text-xs text-slate-500 font-mono">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Database ID</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{record.id}</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "text"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            Complete Extracted CV Text
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("json")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === "json"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Stored Minimal JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "pdf"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            Original PDF Document
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "text" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 dark:border-slate-800">
            Complete Extracted CV Text
          </h3>
          <div className="font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {record.extractedText}
          </div>
        </div>
      )}

      {activeTab === "json" && (
        <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-sm">
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={handleCopyJSON}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copiedJSON ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedJSON ? "Copied" : "Copy JSON"}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-emerald-400 overflow-x-auto">
            {JSON.stringify(record, null, 2)}
          </pre>
        </div>
      )}

      {activeTab === "pdf" && (
        <div className="h-[650px] w-full rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <iframe src={record.originalPdfUrl} className="h-full w-full border-none" title="Original PDF Viewer" />
        </div>
      )}
    </div>
  );
}
