"use client";

import { useState } from "react";
import { CheckCircle, Search, UploadCloud, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MinimalCVRecord } from "@/services/cv.service";
import { ParseSuccessModal } from "./ParseSuccessModal";

interface SaveStepProps {
  record: MinimalCVRecord | null;
  onReset: () => void;
}

export function SaveStep({ record, onReset }: SaveStepProps) {
  const [showModal, setShowModal] = useState<boolean>(true);
  const router = useRouter();

  return (
    <>
      <ParseSuccessModal
        isOpen={showModal && Boolean(record)}
        onClose={() => setShowModal(false)}
        mode="single"
        candidateName={record?.candidateName}
        recordId={record?.id}
        fileName={record?.originalFileName}
        autoCloseSeconds={3}
        onAction={() => {
          if (record?.id) {
            router.push(`/profile?id=${record.id}`);
          }
        }}
      />

      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shadow-md">
          <CheckCircle className="h-10 w-10" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            CV Record Saved to Database!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Candidate: <strong className="text-slate-900 dark:text-slate-100">{record?.candidateName || "Uploaded Candidate"}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Database Record ID:{" "}
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {record?.id || ""}
            </span>
          </p>

          {record?.originalFileName && (
            <div className="mt-3 inline-flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>PDF: {record.originalFileName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button variant="outline" onClick={onReset} leftIcon={<UploadCloud className="h-4 w-4" />}>
            Upload Another CV
          </Button>
          {record?.id && (
            <Link href={`/profile?id=${record.id}`}>
              <Button className="bg-[#1657FF] hover:bg-blue-700 font-semibold" leftIcon={<ExternalLink className="h-4 w-4" />}>
                View Profile Tabs
              </Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

