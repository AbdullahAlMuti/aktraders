"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  FileArchive,
  Image as ImageIcon,
  X,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
  RefreshCw,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { BatchJob, BatchItemStatus } from "@/lib/cv-batch-processor";
import { ParseSuccessModal } from "./ParseSuccessModal";

interface BulkUploadTabProps {
  initialFiles?: File[];
}

export function BulkUploadTab({ initialFiles }: BulkUploadTabProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles || []);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoStartedRef = useRef(false);

  const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".zip"];

  const isFileAllowed = (file: File): boolean => {
    const name = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setErrorMessage(null);
    const validFiles: File[] = [];
    let invalidCount = 0;

    Array.from(incomingFiles).forEach((file) => {
      if (isFileAllowed(file)) {
        // Prevent duplicate entries by name & size
        const isDuplicate = selectedFiles.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push(file);
        }
      } else {
        invalidCount++;
      }
    });

    if (invalidCount > 0) {
      setErrorMessage(
        `${invalidCount} file(s) skipped. Supported formats: .pdf, .docx, .png, .jpg, .jpeg, .zip.`
      );
    }

    if (validFiles.length > 0) {
      const combined = [...selectedFiles, ...validFiles];
      setSelectedFiles(combined);
      processFilesBatch(combined);
    }
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".zip")) {
      return <FileArchive className="h-5 w-5 text-amber-500" />;
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    }
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Status Polling Handler
  const startPollingBatchStatus = (batchId: string) => {
    // Clear existing timer if any
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/cv/batch-status?batchId=${encodeURIComponent(batchId)}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.batch) {
          setBatchJob(data.batch);

          // Stop polling if completed or failed
          if (data.batch.status === "completed" || data.batch.status === "failed") {
            if (pollingTimerRef.current) {
              clearInterval(pollingTimerRef.current);
              pollingTimerRef.current = null;
            }
            if (data.batch.status === "completed") {
              setShowSuccessModal(true);
            }
          }
        }
      } catch (err) {
        console.error("Error polling batch status:", err);
      }
    };

    // Immediate initial poll
    poll();

    // Poll every 1.5 seconds
    pollingTimerRef.current = setInterval(poll, 1500);
  };

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  const processFilesBatch = async (filesToUpload: File[]) => {
    if (!filesToUpload || filesToUpload.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/cv/upload-bulk", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start bulk upload batch.");
      }

      setActiveBatchId(data.batchId);
      if (data.batch) {
        setBatchJob(data.batch);
      }
      setIsUploading(false);

      // Start polling status
      startPollingBatchStatus(data.batchId);
    } catch (err: any) {
      setIsUploading(false);
      setErrorMessage(err.message || "An error occurred while uploading files.");
    }
  };

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0 && !hasAutoStartedRef.current && !activeBatchId) {
      hasAutoStartedRef.current = true;
      processFilesBatch(initialFiles);
    }
  }, [initialFiles]);

  const handleSubmitBatch = () => {
    processFilesBatch(selectedFiles);
  };

  const handleUploadNewBatch = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setSelectedFiles([]);
    setActiveBatchId(null);
    setBatchJob(null);
    setErrorMessage(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Render Dashboard if batch active
  if (activeBatchId || batchJob) {
    const isCompleted = batchJob?.status === "completed";
    const isFailed = batchJob?.status === "failed";
    const isProcessing = !isCompleted && !isFailed;

    const totalFiles = batchJob?.totalFiles || selectedFiles.length;
    const processedFiles = batchJob?.processedFiles || 0;
    const successFiles = batchJob?.successFiles || 0;
    const failedFiles = batchJob?.failedFiles || 0;

    const progressPercentage =
      totalFiles > 0 ? Math.min(100, Math.round((processedFiles / totalFiles) * 100)) : 0;

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Bulk Processing Dashboard
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Batch ID: {batchJob?.batchId || activeBatchId}
            </p>
          </div>

          {/* Batch Status Badge */}
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                isProcessing && "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
                isCompleted && "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
                isFailed && "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800"
              )}
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              {isCompleted && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {isFailed && <XCircle className="h-4 w-4 text-red-600" />}
              <span>
                {isProcessing && "Processing Batch..."}
                {isCompleted && "Batch Completed"}
                {isFailed && "Batch Failed"}
              </span>
            </div>

            {(isCompleted || isFailed) && (
              <Button
                onClick={handleUploadNewBatch}
                size="sm"
                variant="outline"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Upload New Batch
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Overall Progress</span>
            <span>
              {progressPercentage}% ({processedFiles} of {totalFiles} processed)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isCompleted ? "bg-emerald-500" : isFailed ? "bg-red-500" : "bg-blue-600"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-medium text-slate-500">Total Files</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {totalFiles}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Successfully Saved
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {successFiles}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/30 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">Failed / Errors</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{failedFiles}</p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Batch Items Details ({batchJob?.items?.length || 0})
          </h4>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 max-h-[400px] overflow-y-auto">
            {batchJob?.items && batchJob.items.length > 0 ? (
              batchJob.items.map((item: BatchItemStatus) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <div className="flex items-start space-x-3 overflow-hidden min-w-0 flex-1">
                    <div className="mt-0.5 shrink-0">{getFileIcon(item.fileName)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.fileName}
                      </p>

                      {item.candidateName && (
                        <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.candidateName}</span>
                        </div>
                      )}

                      {item.errorMessage && (
                        <div className="flex items-center space-x-1.5 mt-1 text-xs text-red-600 dark:text-red-400">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{item.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Status Badge */}
                  <div className="shrink-0 flex items-center">
                    {item.status === "queued" && (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Queued</span>
                      </span>
                    )}

                    {item.status === "processing" && (
                      <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                        <span>Extracting & Saving...</span>
                      </span>
                    )}

                    {item.status === "completed" && (
                      <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}

                    {item.status === "failed" && (
                      <span className="inline-flex items-center space-x-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Initializing batch items...
              </div>
            )}
          </div>
        </div>

        {/* Upload New Batch Bottom Action */}
        {(isCompleted || isFailed) && (
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              onClick={handleUploadNewBatch}
              className="bg-[#1657FF] hover:bg-blue-700 h-11 px-8 font-semibold text-sm"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Upload Another Batch
            </Button>
          </div>
        )}

        {/* Confirmation Auto-Close Modal Popup */}
        <ParseSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          mode="bulk"
          totalFiles={totalFiles}
          successCount={successFiles}
          failedCount={failedFiles}
          autoCloseSeconds={3}
        />
      </div>
    );
  }

  // Pre-Upload File Selector View
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.png,.jpg,.jpeg,.zip,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,application/zip"
        onChange={handleFileInputChange}
        className="hidden"
        id="bulk-cv-file-input"
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
        aria-label="Upload Bulk CV Files or ZIP Archives"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-blue-500",
          dragActive
            ? "border-blue-500 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40 scale-[1.01]"
            : "border-blue-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-950 dark:text-blue-400 mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Drag & Drop Multiple CV Files or ZIP Archives
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          or{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400 underline decoration-blue-300 underline-offset-2">
            browse files from your computer
          </span>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Supported formats: PDF, DOCX, PNG, JPG, JPEG & ZIP archives
        </p>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-xl bg-red-50 p-4 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button
              onClick={clearAllFiles}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Clear All
            </Button>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/30 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60 max-h-[300px] overflow-y-auto p-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden min-w-0 flex-1">
                  <div className="shrink-0">{getFileIcon(file.name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 transition-colors ml-2"
                  aria-label={`Remove file ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start space-x-3 rounded-xl bg-blue-50/70 p-4 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
        <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-200">
            Automated ZIP Unpacking & Concurrent Extraction
          </h5>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
            ZIP archives are automatically unpacked in background workers. Each CV will be processed with Gemini AI and stored directly into your database.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSubmitBatch}
          disabled={selectedFiles.length === 0}
          isLoading={isUploading}
          className="bg-[#1657FF] hover:bg-blue-700 h-11 px-8 font-semibold text-sm"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {isUploading
            ? "Uploading Batch..."
            : `Start Bulk Upload (${selectedFiles.length} File${selectedFiles.length === 1 ? "" : "s"})`}
        </Button>
      </div>
    </div>
  );
}
