"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Loader2, Cpu, ArrowRight, FileText, Image as ImageIcon, Code2, Copy, CheckCircle2, ExternalLink, Briefcase, GraduationCap, User, Mail, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ExtractStepProps {
  file: File | null;
  onNext: (extractedData: any) => void;
  onBack: () => void;
}

export function ExtractStep({ file, onNext, onBack }: ExtractStepProps) {
  const [progress, setProgress] = useState(10);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "formatted" | "json">("formatted");

  // Object URL for live file preview
  const previewUrl = useMemo(() => {
    if (!file) return null;
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      return null;
    }
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Trigger actual file extraction API
  useEffect(() => {
    let isMounted = true;
    async function runExtraction() {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/cv/extract", {
          method: "POST",
          body: formData,
        });

        const jsonRes = await res.json();
        if (isMounted && jsonRes.success && jsonRes.data) {
          setExtractedData(jsonRes.data);
        }
      } catch (err) {
        console.error("Extraction API error:", err);
      }
    }

    runExtraction();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Progress animation simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + 18;
        if (next > 80) setActiveStepIndex(4);
        else if (next > 60) setActiveStepIndex(3);
        else if (next > 40) setActiveStepIndex(2);
        else if (next > 20) setActiveStepIndex(1);
        return next;
      });
    }, 350);

    return () => clearInterval(timer);
  }, []);

  const steps = [
    { title: "Document Scan", desc: `Scanning ${file?.name || "file"}` },
    { title: "OCR & Text Recognition", desc: "Recognizing layout, text lines & headings" },
    { title: "Gemini Vision AI Analysis", desc: "Extracting exact text fields same-to-same" },
    { title: "Data Structuring", desc: "Name, Email, Phone, Experience & Education" },
    { title: "JSON Schema Verification", desc: "Validation complete & ready for review" },
  ];

  const handleCopyJSON = () => {
    if (extractedData) {
      navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    }
  };

  const isImage = file?.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file?.name || "");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Extraction Steps & Progress */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-blue-600 animate-pulse" />
            <span>AI JSON Extraction Tracker</span>
          </h3>

          <div className="space-y-4">
            {steps.map((s, index) => {
              const isCompleted = index < activeStepIndex || progress === 100;
              const isActive = index === activeStepIndex && progress < 100;

              return (
                <div key={index} className="flex items-start space-x-3 text-xs">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : isActive ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white animate-spin">
                        <Loader2 className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-300 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-bold ${!isCompleted && !isActive ? "text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Status Card */}
          <div className="rounded-xl bg-blue-50/70 p-4 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>{progress === 100 ? "JSON Extracted Successfully!" : "Extracting Structured JSON..."}</span>
              </span>
              <span className="font-mono text-blue-700 dark:text-blue-300">{progress}%</span>
            </div>
            <ProgressBar value={progress} showLabel={false} />
          </div>
        </div>

        {/* Right Column: View Switcher (Formatted CV Card, Original Document, Raw JSON) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 gap-2">
            {/* View Switcher Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("formatted")}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 font-bold transition-all ${
                  activeTab === "formatted"
                    ? "bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Formatted CV Card</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 font-bold transition-all ${
                  activeTab === "preview"
                    ? "bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                <span>Original File View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 font-bold transition-all ${
                  activeTab === "json"
                    ? "bg-white text-blue-600 shadow dark:bg-slate-900 dark:text-blue-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Raw JSON</span>
              </button>
            </div>

            {activeTab === "json" && extractedData && (
              <button
                type="button"
                onClick={handleCopyJSON}
                className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {copiedJSON ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedJSON ? "Copied!" : "Copy JSON"}</span>
              </button>
            )}

            {activeTab === "preview" && previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open in New Window</span>
              </a>
            )}
          </div>

          {/* TAB 1: Formatted Document Card Preview */}
          {activeTab === "formatted" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/60 max-h-[420px] overflow-auto space-y-4 text-xs">
              {extractedData ? (
                <>
                  {/* Candidate Header Badge */}
                  <div className="flex items-start justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {extractedData.fullName || file?.name}
                      </h4>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold text-xs mt-0.5">
                        {extractedData.designation || "Senior Executive"} • {extractedData.department || "Operations"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-slate-600 dark:text-slate-400 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{extractedData.email || "N/A"}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{extractedData.phone || "N/A"}</span>
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-[10px]">
                      Extracted
                    </span>
                  </div>

                  {/* Work Experience Section */}
                  {extractedData.workExperience && Array.isArray(extractedData.workExperience) && extractedData.workExperience.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 text-xs border-b pb-1.5 border-slate-100 dark:border-slate-800">
                        <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                        <span>Work Experience ({extractedData.workExperience.length})</span>
                      </h5>
                      <div className="space-y-2 pt-1">
                        {extractedData.workExperience.map((exp: any, i: number) => (
                          <div key={i} className="flex justify-between items-start border-l-2 border-blue-500 pl-2.5 py-0.5">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{exp.role || exp.company || "Experience Item"}</p>
                              <p className="text-[11px] text-slate-500">{exp.company}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {exp.period || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  {extractedData.education && Array.isArray(extractedData.education) && extractedData.education.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 text-xs border-b pb-1.5 border-slate-100 dark:border-slate-800">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Education & Qualifications</span>
                      </h5>
                      <div className="space-y-2 pt-1">
                        {extractedData.education.map((edu: any, i: number) => (
                          <div key={i} className="flex justify-between items-start border-l-2 border-emerald-500 pl-2.5 py-0.5">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{edu.degree || edu.details || "Degree"}</p>
                              <p className="text-[11px] text-slate-500">{edu.institution}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              {edu.period || "N/A"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                  <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                  <p className="font-medium text-xs">Extracting structured CV cards...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Original File Live Preview */}
          {activeTab === "preview" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 max-h-[420px] overflow-auto flex flex-col items-center justify-center min-h-[360px]">
              {previewUrl && isImage && (
                <img
                  src={previewUrl}
                  alt={file?.name || "Uploaded Image"}
                  className="max-h-[380px] w-auto max-w-full rounded-lg object-contain border border-slate-200 dark:border-slate-800 shadow"
                />
              )}

              {previewUrl && !isImage && (
                <object
                  data={previewUrl}
                  type="application/pdf"
                  className="w-full h-[380px] rounded-lg border border-slate-200 dark:border-slate-800"
                >
                  <iframe
                    src={previewUrl}
                    title="Uploaded PDF Preview"
                    className="w-full h-[380px] rounded-lg"
                  />
                </object>
              )}

              {!previewUrl && (
                <div className="flex flex-col items-center justify-center text-center space-y-2 py-10">
                  <FileText className="h-10 w-10 text-slate-400" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">{file?.name}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Extracted JSON Code Viewer */}
          {activeTab === "json" && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 max-h-[420px] overflow-auto shadow-inner">
              {extractedData ? (
                <pre className="whitespace-pre-wrap break-words leading-relaxed">
                  {JSON.stringify(extractedData, null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center py-20 text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Generating raw JSON format...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between rounded-xl bg-blue-50/50 p-4 border border-blue-100 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          💡 The extracted JSON data will be pre-filled into the review form and saved directly to the database.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack}>Previous</Button>
          <Button
            onClick={() => extractedData && onNext(extractedData)}
            disabled={progress < 100 || !extractedData}
            className="bg-[#1657FF] hover:bg-blue-700 font-semibold"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {progress < 100 ? "Extracting..." : "Next Step: Review & Edit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
