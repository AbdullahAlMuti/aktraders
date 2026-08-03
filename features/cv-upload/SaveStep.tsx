"use client";

import { CheckCircle, Users, UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Employee } from "@/types/employee.types";

interface SaveStepProps {
  savedEmployee: Employee | null;
  onReset: () => void;
}

export function SaveStep({ savedEmployee, onReset }: SaveStepProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <CheckCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Employee Record Saved to Database!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          Profile for <strong className="text-slate-900 dark:text-slate-100">{savedEmployee?.name || "New Employee"}</strong> saved under Employee ID:{" "}
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {savedEmployee?.id || "EMP-1006"}
          </span>
        </p>

        {savedEmployee?.cvFileName && (
          <div className="mt-3 inline-flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>CV: {savedEmployee.cvFileName} ({savedEmployee.cvFileSize || "Attached"})</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <Button variant="outline" onClick={onReset} leftIcon={<UploadCloud className="h-4 w-4" />}>
          Upload Another CV
        </Button>
        <Link href="/employees">
          <Button className="bg-[#1657FF] hover:bg-blue-700" leftIcon={<Users className="h-4 w-4" />}>
            Go to Employee Directory
          </Button>
        </Link>
      </div>
    </div>
  );
}
