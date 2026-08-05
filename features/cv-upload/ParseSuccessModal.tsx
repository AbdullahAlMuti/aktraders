"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, FileText, X, ArrowRight, Layers, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/utils/cn";

export interface ParseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "single" | "bulk";
  candidateName?: string;
  recordId?: string;
  fileName?: string;
  totalFiles?: number;
  successCount?: number;
  failedCount?: number;
  autoCloseSeconds?: number; // default 3
  onAction?: () => void;
}

export function ParseSuccessModal({
  isOpen,
  onClose,
  mode,
  candidateName,
  recordId,
  fileName,
  totalFiles = 1,
  successCount = 1,
  failedCount = 0,
  autoCloseSeconds = 3,
  onAction,
}: ParseSuccessModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(autoCloseSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(autoCloseSeconds);
      return;
    }

    setSecondsLeft(autoCloseSeconds);
    setIsPaused(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, autoCloseSeconds]);

  const handleAutoClose = () => {
    onClose();
    if (onAction) onAction();
  };

  if (!isOpen) return null;

  const progressPercent = ((autoCloseSeconds - secondsLeft) / autoCloseSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 dark:bg-[#0d1b2e] shadow-2xl border border-slate-200/80 dark:border-slate-800 animate-in zoom-in-95 duration-300"
        onMouseEnter={() => setIsPaused(true)}
      >
        {/* Top Close Button */}
        <button
          onClick={handleAutoClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center pt-2">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
          </div>
        </div>

        {/* Text Content */}
        <div className="mt-4 text-center space-y-2">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {mode === "single" ? "CV Extraction Complete!" : "Bulk CV Processing Complete!"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {mode === "single"
              ? "Candidate profile details extracted & categorized into database tabs."
              : `Processed ${totalFiles} CV file(s) with ${successCount} successful extractions.`}
          </p>
        </div>

        {/* Details Card */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
          {mode === "single" ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Candidate:</span>
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  <span>{candidateName || "Uploaded Candidate"}</span>
                </span>
              </div>

              {recordId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Record ID:</span>
                  <span className="font-extrabold font-mono text-blue-600 dark:text-blue-400">
                    AKT-{recordId.slice(-4).toUpperCase()}
                  </span>
                </div>
              )}

              {fileName && (
                <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
                  <span className="text-slate-400 font-medium">File:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px] flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-purple-500" />
                    <span>{fileName}</span>
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Total Files:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{totalFiles}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="font-medium">Successful Extractions:</span>
                <span className="font-extrabold">{successCount}</span>
              </div>
              {failedCount > 0 && (
                <div className="flex items-center justify-between text-rose-500">
                  <span className="font-medium">Failed:</span>
                  <span className="font-extrabold">{failedCount}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* 3-Second Countdown Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>{isPaused ? "Timer Paused" : `Auto-closing in ${secondsLeft}s...`}</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleAutoClose}
            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold"
          >
            Close Now
          </Button>

          {mode === "single" && recordId ? (
            <Link href={`/profile?id=${recordId}`} className="flex-1">
              <Button
                variant="primary"
                onClick={onClose}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-xs font-bold shadow-md shadow-blue-500/20"
              >
                View Profile
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              onClick={handleAutoClose}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="flex-1 rounded-xl bg-[#0066ff] hover:bg-[#0052cc] text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
