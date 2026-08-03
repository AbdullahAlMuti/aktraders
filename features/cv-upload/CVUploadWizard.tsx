"use client";

import { useState } from "react";
import { UploadStep } from "./UploadStep";
import { ExtractStep } from "./ExtractStep";
import { ReviewStep } from "./ReviewStep";
import { SaveStep } from "./SaveStep";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

export function CVUploadWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const steps = [
    { id: 1, label: "Upload CV" },
    { id: 2, label: "Extract Info" },
    { id: 3, label: "Review Data" },
    { id: 4, label: "Save Record" },
  ];

  return (
    <div className="space-y-6">
      {/* Step Indicator Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
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
          />
        )}

        {currentStep === 2 && (
          <ExtractStep
            file={uploadedFile}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <ReviewStep
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <SaveStep
            onReset={() => {
              setUploadedFile(null);
              setCurrentStep(1);
            }}
          />
        )}
      </div>
    </div>
  );
}
