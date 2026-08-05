"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Calendar, Download, Loader2, User, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cvService, MinimalCVRecord } from "@/services/cv.service";
import { usePdfBlobUrl } from "@/utils/pdf-preview";
import Link from "next/link";

export default function CVRecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [record, setRecord] = useState<MinimalCVRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const safePdfUrl = usePdfBlobUrl(record?.originalPdfUrl);

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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
      </div>

      {/* Side-by-Side Dual View: Left = Original PDF, Right = Extracted Clean Text */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original PDF Document View */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-[#0066ff]" />
              Original PDF Document
            </span>
          </div>
          <div className="h-[650px] w-full rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            {safePdfUrl ? (
              <iframe src={safePdfUrl} className="h-full w-full border-none" title="Original PDF Document" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-mono">
                Loading PDF document...
              </div>
            )}
          </div>
        </div>

        {/* Right: Extracted Clean Text View */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-emerald-500" />
              Extracted Clean Text
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
              Saved in Backend Database
            </span>
          </div>
          <div className="h-[650px] w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-y-auto">
            {record.extractedText}
          </div>
        </div>
      </div>
    </div>
  );
}
