"use client";

import { CheckCircle, Users, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function SaveStep({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <CheckCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          এমপ্লয়ী তথ্য সফলভাবে সংরক্ষিত হয়েছে!
        </h3>
        <p className="text-xs text-slate-500">
          এমপ্লয়ী আইডি: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">EMP-1006</span> এর অধীনে প্রোফাইল আপডেট করা হয়েছে।
        </p>
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <Button variant="outline" onClick={onReset} leftIcon={<UploadCloud className="h-4 w-4" />}>
          নতুন CV আপলোড করুন
        </Button>
        <Link href="/employees">
          <Button className="bg-[#1657FF] hover:bg-blue-700" leftIcon={<Users className="h-4 w-4" />}>
            এমপ্লয়ী তালিকায় যান
          </Button>
        </Link>
      </div>
    </div>
  );
}
