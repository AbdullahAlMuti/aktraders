"use client";

import { useState } from "react";
import { UploadStep } from "./UploadStep";
import { ExtractStep } from "./ExtractStep";
import { SaveStep } from "./SaveStep";
import { BulkUploadTab } from "./BulkUploadTab";
import { Check, FileText, Layers } from "lucide-react";
import { cn } from "@/utils/cn";
import { MinimalCVRecord } from "@/services/cv.service";

export function CVUploadWizard() {
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [savedRecord, setSavedRecord] = useState<MinimalCVRecord | null>(null);

  const steps = [
    { id: 1, label: "Upload PDF CV" },
    { id: 2, label: "Gemini AI Extract & Save" },
    { id: 3, label: "Complete Record" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Level Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap",
              activeTab === "single"
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span>Single CV AI Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bulk")}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap",
              activeTab === "bulk"
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span>Bulk CV Upload & ZIP Ingestion</span>
            <span className="ml-1.5 shrink-0 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              New / Batch
            </span>
          </button>
        </div>
      </div>

      {activeTab === "single" ? (
        <>
          {/* Step Indicator Header */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm transition-all",
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-lg"
                            : "border-2 border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-800"
                        )}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-xs font-semibold text-center",
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "h-1 flex-1 mx-4 rounded-full transition-colors",
                          currentStep > step.id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[450px]">
            {currentStep === 1 && (
              <UploadStep
                onFileSelect={(file) => {
                  setUploadedFile(file);
                  setCurrentStep(2);
                }}
                onBulkSelect={(files) => {
                  setBulkFiles(files);
                  setActiveTab("bulk");
                }}
              />
            )}

            {currentStep === 2 && (
              <ExtractStep
                file={uploadedFile}
                onNext={(record) => {
                  setSavedRecord(record);
                  setCurrentStep(3);
                }}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <SaveStep
                record={savedRecord}
                onReset={() => {
                  setUploadedFile(null);
                  setSavedRecord(null);
                  setCurrentStep(1);
                }}
              />
            )}
          </div>
        </>
      ) : (
        <BulkUploadTab initialFiles={bulkFiles} />
      )}
    </div>
  );
}

