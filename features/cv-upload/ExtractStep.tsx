"use client";

import { useState, useEffect, useRef } from "react";
import { Check, FileText, ArrowLeft, ArrowRight, Loader2, AlertTriangle, Cpu, Sparkles, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cvService, MinimalCVRecord } from "@/services/cv.service";

interface ExtractStepProps {
  file: File | null;
  onNext: (record: MinimalCVRecord) => void;
  onBack: () => void;
}

export function ExtractStep({ file, onNext, onBack }: ExtractStepProps) {
  const [extractedRecord, setExtractedRecord] = useState<MinimalCVRecord | null>(null);
  const [statusState, setStatusState] = useState<"Extracting" | "Completed" | "Failed">("Extracting");
  const [progress, setProgress] = useState<number>(0);
  const [stageMessage, setStageMessage] = useState<string>("Reading PDF Document...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const uploadPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file]);

  // Smooth Percentage Progress Animation
  useEffect(() => {
    if (statusState !== "Extracting") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        const next = prev + Math.floor(Math.random() * 4) + 2;
        return next > 92 ? 92 : next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [statusState]);

  // Update Stage Messages based on progress percentage
  useEffect(() => {
    if (progress < 25) {
      setStageMessage("Reading PDF File & Parsing Text Streams...");
    } else if (progress < 55) {
      setStageMessage("Extracting Clean Text & Contact Info...");
    } else if (progress < 85) {
      setStageMessage("AI Structuring Candidate Experience & Skills...");
    } else if (progress < 100) {
      setStageMessage("Saving Candidate Record to Database...");
    } else {
      setStageMessage("CV Extraction & Storage Complete!");
    }
  }, [progress]);

  // Upload & Extraction API Call with Promise Cache to support React 18 Strict Mode cleanly
  useEffect(() => {
    if (!file) return;

    let active = true;
    setStatusState("Extracting");
    setErrorMessage(null);

    if (!uploadPromiseRef.current) {
      uploadPromiseRef.current = cvService.uploadCV(file);
    }

    uploadPromiseRef.current.then((result) => {
      if (!active) return;

      if (result.success && result.record) {
        setProgress(100);
        setTimeout(() => {
          if (active) {
            setExtractedRecord(result.record!);
            setStatusState("Completed");
          }
        }, 300);
      } else {
        setStatusState("Failed");
        setErrorMessage(result.error || "Failed to process PDF CV.");
      }
    });

    return () => {
      active = false;
    };
  }, [file]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111c38] space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0066ff]" />
            PDF Extraction & AI Processing
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            File: <span className="font-bold text-slate-800 dark:text-slate-200">{file?.name || "Uploaded CV"}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {statusState === "Extracting" && (
            <span className="flex items-center px-3.5 py-1.5 rounded-full bg-[#e8f1ff] text-[#0066ff] dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-900">
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              Extracting ({progress}%)
            </span>
          )}

          {statusState === "Completed" && (
            <span className="flex items-center px-3.5 py-1.5 rounded-full bg-[#e6f9f0] text-[#10b981] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900">
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Saved to Database
            </span>
          )}

          {statusState === "Failed" && (
            <span className="flex items-center px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Extraction Failed
            </span>
          )}
        </div>
      </div>

      {/* Progress & Percentage Animation View */}
      {statusState === "Extracting" && (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0066ff]/5 via-transparent to-purple-500/5 pointer-events-none" />

          <div className="relative">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <FileText className="h-10 w-10 text-[#0066ff] animate-pulse" />
              <div className="absolute inset-0 rounded-3xl border-2 border-[#0066ff]/30 animate-ping" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0066ff] text-white shadow-lg">
              <Cpu className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
              {progress}<span className="text-2xl text-[#0066ff]">%</span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0066ff] animate-spin" />
              <span>{stageMessage}</span>
            </p>
          </div>

          <div className="w-full max-w-md space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0066ff] via-blue-500 to-cyan-400 transition-all duration-300 ease-out shadow-sm shadow-[#0066ff]/50"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold px-1">
              <span>PDF Text Extraction</span>
              <span>Gemini AI Parsing</span>
              <span>Database Sync</span>
            </div>
          </div>
        </div>
      )}

      {/* Error View */}
      {statusState === "Failed" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 dark:border-rose-900/50 dark:bg-rose-950/30 text-center space-y-3">
          <AlertTriangle className="h-12 w-12 text-rose-600 mx-auto" />
          <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">CV Extraction Failed</h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">{errorMessage}</p>
          <div className="pt-2">
            <Button onClick={onBack} variant="outline" size="sm" className="font-bold">
              Try Uploading Another PDF
            </Button>
          </div>
        </div>
      )}

      {/* Side-by-Side View when Completed (Left: Original PDF, Right: Extracted Clean Text) */}
      {statusState === "Completed" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Original PDF Document View */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#0066ff]" />
                  Original PDF View
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {file?.name || "Uploaded PDF"}
                </span>
              </div>
              <div className="h-[520px] w-full rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-900">
                {previewUrl ? (
                  <iframe src={previewUrl} className="h-full w-full border-none" title="Original PDF Viewer" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs font-medium">
                    No PDF preview available
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Extracted Clean Text View */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-500" />
                  Extracted Clean Text
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                  Saved in Backend DB
                </span>
              </div>

              {extractedRecord && (
                <div className="flex flex-col h-[520px] space-y-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate Name</span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{extractedRecord.candidateName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Record ID</span>
                      <p className="text-xs font-mono font-bold text-[#0066ff] dark:text-blue-400">{extractedRecord.id}</p>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-y-auto shadow-inner">
                    {extractedRecord.extractedText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button onClick={onBack} variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} className="font-bold text-sm">
          Back
        </Button>

        <Button
          onClick={() => extractedRecord && onNext(extractedRecord)}
          disabled={!extractedRecord || statusState !== "Completed"}
          className="bg-[#0066ff] hover:bg-[#0052cc] px-8 font-bold text-sm text-white shadow-md shadow-[#0066ff]/20"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          View Complete CV Record
        </Button>
      </div>
    </div>
  );
}
