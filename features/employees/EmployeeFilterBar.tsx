"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw, Download } from "lucide-react";
import { useFilterStore } from "@/stores/use-filter-store";

interface EmployeeFilterBarProps {
  onExportCSV?: () => void;
}

export function EmployeeFilterBar({ onExportCSV }: EmployeeFilterBarProps) {
  const { searchQuery, setSearchQuery, resetFilters } = useFilterStore();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111c38]">
      <div className="flex flex-1 items-center space-x-3 w-full">
        <Input
          placeholder="Search candidate name, email, or record ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4.5 w-4.5" />}
          className="w-full md:max-w-md text-sm font-medium"
        />
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        {onExportCSV && (
          <Button variant="outline" size="sm" onClick={onExportCSV} leftIcon={<Download className="h-4 w-4" />} className="text-sm font-bold">
            Export CSV
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="h-4 w-4" />} className="text-sm font-bold">
          Reset
        </Button>
      </div>
    </div>
  );
}
