"use client";

import { useState, useEffect } from "react";
import { Check, Copy, FileText, ArrowLeft, ArrowRight, Loader2, Code2, AlertTriangle, Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cvService, MinimalCVRecord } from "@/services/cv.service";

interface ExtractStepProps {
  file: File | null;
  onNext: (record: MinimalCVRecord) => void;
  onBack: () => void;
}

export function ExtractStep({ file, onNext, onBack }: ExtractStepProps) {
  const [extractedRecord, setExtractedRecord] = useState<MinimalCVRecord | null>(null);
  const [statusState, setStatusState] = useState<"Uploading" | "Extracting" | "Saving" | "Completed" | "Failed">("Uploading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "json" | "pdf">("text");
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [file]);

  useEffect(() => {
    let isMounted = true;
    async function processUpload() {
      if (!file) return;

      setStatusState("Extracting");
      setErrorMessage(null);

      const result = await cvService.uploadCV(file);

      if (isMounted) {
        if (result.success && result.record) {
          setExtractedRecord(result.record);
          setStatusState("Completed");
        } else {
          setStatusState("Failed");
          setErrorMessage(result.error || "Failed to process PDF CV.");
        }
      }
    }

    processUpload();

    return () => {
      isMounted = false;
    };
  }, [file]);

  const handleCopyJSON = () => {
    if (extractedRecord) {
      navigator.clipboard.writeText(JSON.stringify(extractedRecord, null, 2));
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            PDF Extraction & Database Storage
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            File: <span className="font-semibold text-slate-700 dark:text-slate-300">{file?.name || "Uploaded CV"}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {statusState !== "Completed" && statusState !== "Failed" && (
            <span className="flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold animate-pulse border border-blue-200 dark:border-blue-900">
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              State: {statusState}...
            </span>
          )}

          {statusState === "Completed" && (
            <span className="flex items-center px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900">
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Saved to Database
            </span>
          )}

          {statusState === "Failed" && (
            <span className="flex items-center px-3 py-1.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-semibold border border-red-200 dark:border-red-900">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Extraction Failed
            </span>
          )}
        </div>
      </div>

      {/* Error View */}
      {statusState === "Failed" && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-950/30 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
          <h4 className="text-sm font-bold text-red-900 dark:text-red-200">CV Extraction Failed</h4>
          <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">{errorMessage}</p>
          <div className="pt-2">
            <Button onClick={onBack} variant="outline" size="sm">
              Try Uploading Another PDF
            </Button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {statusState !== "Failed" && (
        <>
          {/* Tab Selection Navigation */}
          <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "text"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              Extracted Clean Text
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 ${
                activeTab === "json"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Minimal JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pdf")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "pdf"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              Original PDF File
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="min-h-[350px]">
            {activeTab === "text" && (
              <div className="space-y-4">
                {extractedRecord ? (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Candidate Name</span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{extractedRecord.candidateName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Database Record ID</span>
                        <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{extractedRecord.id}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                      {extractedRecord.extractedText}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                    <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                    <p className="text-xs font-medium">Extracting CV text with Gemini AI...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "json" && (
              <div className="relative">
                {extractedRecord ? (
                  <>
                    <div className="absolute right-3 top-3 z-10">
                      <button
                        type="button"
                        onClick={handleCopyJSON}
                        className="flex items-center space-x-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        {copiedJSON ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedJSON ? "Copied" : "Copy JSON"}</span>
                      </button>
                    </div>
                    <pre className="rounded-xl border border-slate-800 bg-slate-950 p-5 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[400px]">
                      {JSON.stringify(extractedRecord, null, 2)}
                    </pre>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-20 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Generating JSON record...</span>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="h-[450px] w-full rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
                {previewUrl ? (
                  <iframe src={previewUrl} className="h-full w-full border-none" title="Original PDF Viewer" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">No PDF preview available</div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button onClick={onBack} variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </Button>

        <Button
          onClick={() => extractedRecord && onNext(extractedRecord)}
          disabled={!extractedRecord || statusState !== "Completed"}
          className="bg-[#1657FF] hover:bg-blue-700 px-8 font-semibold text-sm"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          View Complete CV Record
        </Button>
      </div>
    </div>
  );
}
