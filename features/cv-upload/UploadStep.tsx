"use client";

import { useState } from "react";
import { UploadCloud, FileText, X, Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UploadStep({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(
    new File(["dummy content"], "Rahim_Hasan_CV.pdf", { type: "application/pdf" })
  );
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
            : "border-blue-200 bg-slate-50/50 hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900/50"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          সিডি ফাইল এখানে ড্র্যাগ করুন (Drag CV File Here)
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          অথবা <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">ব্রাউজ করুন (Browse)</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">PDF, JPG, PNG ফাইল (সর্বোচ্চ 10MB)</p>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
          className="hidden"
          id="cv-file-input"
        />
      </div>

      {/* Selected File Card */}
      {selectedFile && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">আপলোডকৃত ফাইল সমূহ</h4>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">3.2 MB</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* AI Processing Info Banner */}
      <div className="flex items-start space-x-3 rounded-xl bg-blue-50/70 p-4 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
        <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">AI প্রসেসিং সম্পর্কে</h5>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            আপনার সিডি থেকে তথ্য স্বয়ংক্রিয়ভাবে পড়া ও বিশ্লেষণ করা হবে। এতে কয়েক মিনিট সময় লাগতে পারে।
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => selectedFile && onFileSelect(selectedFile)}
          disabled={!selectedFile}
          className="bg-[#1657FF] hover:bg-blue-700 h-11 px-8"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          পরবর্তী ধাপ (Next Step)
        </Button>
      </div>
    </div>
  );
}
