"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, X, Cpu, ArrowRight, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UploadStepProps {
  onFileSelect: (file: File) => void;
  onBulkSelect?: (files: File[]) => void;
}

export function UploadStep({ onFileSelect, onBulkSelect }: UploadStepProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "application/zip"];
  const MAX_SIZE_MB = 50;

  const validateAndSetFiles = (files: File[]) => {
    setErrorMessage(null);
    if (!files || files.length === 0) return;

    // Check if zip or multiple files provided
    const isZip = files.some((f) => f.name.toLowerCase().endsWith(".zip"));
    if ((files.length > 1 || isZip) && onBulkSelect) {
      onBulkSelect(files);
      return;
    }

    const file = files[0];
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);

    if (!isPdf && !isImage && !isZip) {
      setErrorMessage("Unsupported file format. Please upload a PDF, DOCX, JPG, PNG, or ZIP file.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large. Maximum supported size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFiles(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleFileInputChange}
        className="hidden"
        id="cv-file-input"
      />

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload CV File"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-blue-500 ${
          dragActive
            ? "border-blue-500 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 scale-[1.01]"
            : "border-blue-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-950 dark:text-blue-400 mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Drag & Drop CV File Here
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          or <span className="font-semibold text-blue-600 dark:text-blue-400 underline decoration-blue-300 underline-offset-2">browse from your computer</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">Supported formats: PDF, JPG, PNG (Max 10MB)</p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected File Card */}
      {selectedFile && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Selected CV File</h4>
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/30 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                {selectedFile.type.startsWith("image/") ? (
                  <ImageIcon className="h-5 w-5" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || "Document"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              aria-label="Remove File"
              className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors"
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
          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">About AI Processing</h5>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            Your CV file will be parsed to automatically extract name, contact details, education, work history, and skills.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => selectedFile && onFileSelect(selectedFile)}
          disabled={!selectedFile}
          className="bg-[#1657FF] hover:bg-blue-700 h-11 px-8 font-semibold text-sm"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Next Step: Extract Info
        </Button>
      </div>
    </div>
  );
}
