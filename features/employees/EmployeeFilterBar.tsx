"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Search, RotateCcw, Filter } from "lucide-react";
import { useFilterStore } from "@/stores/use-filter-store";

export function EmployeeFilterBar() {
  const { searchQuery, departmentFilter, statusFilter, setSearchQuery, setDepartmentFilter, setStatusFilter, resetFilters } = useFilterStore();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-1 items-center space-x-3 w-full">
        <Input
          placeholder="নাম বা আইডি সার্চ করুন... (Search name or ID)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-full md:max-w-xs"
        />

        <Select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          options={[
            { label: "সকল বিভাগ (All Departments)", value: "all" },
            { label: "সেলস (Sales)", value: "Sales" },
            { label: "অপারেশনস (Operations)", value: "Operations" },
            { label: "এইচ আর (HR)", value: "HR" },
            { label: "ফাইন্যান্স (Finance)", value: "Finance" },
            { label: "আইটি (IT)", value: "IT" },
          ]}
          className="w-48"
        />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: "সকল অবস্থা (All Status)", value: "all" },
            { label: "সক্রিয় (Active)", value: "active" },
            { label: "প্রক্রিয়াধীন (Processing)", value: "processing" },
            { label: "অপেক্ষমাণ (Pending)", value: "pending" },
          ]}
          className="w-44"
        />
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
        <Button variant="outline" size="sm" onClick={resetFilters} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
          রিসেট (Reset)
        </Button>
      </div>
    </div>
  );
}
