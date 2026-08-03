"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FileSpreadsheet, FileText, Filter, Calendar } from "lucide-react";
import { useState } from "react";

export function ExportActions() {
  const [dateRange, setDateRange] = useState("2026-full");
  const [department, setDepartment] = useState("all");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div className="flex items-center space-x-2 border border-slate-200 rounded-md px-3 py-1.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-800 text-xs font-medium">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>01-01-2024 - 31-12-2024</span>
        </div>

        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          options={[
            { label: "সকল বিভাগ (All Departments)", value: "all" },
            { label: "সেলস (Sales)", value: "Sales" },
            { label: "অপারেশনস (Operations)", value: "Operations" },
            { label: "এইচ আর (HR)", value: "HR" },
          ]}
          className="w-48"
        />

        <Button variant="primary" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />}>
          ফিল্টার (Filter)
        </Button>
      </div>

      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
        <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
          Excel এক্সপোর্ট
        </Button>
        <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" leftIcon={<FileText className="h-4 w-4" />}>
          PDF এক্সপোর্ট
        </Button>
      </div>
    </div>
  );
}
