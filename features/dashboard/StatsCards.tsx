"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FileText, CheckCircle2, Database, UploadCloud, ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { cvService } from "@/services/cv.service";

export function StatsCards() {
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cvService.searchCandidates("").then((res) => {
      setTotalRecords(res.length);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      title: "Total CV Records",
      value: loading ? "..." : totalRecords.toString(),
      subtitle: "All Stored Records",
      icon: FileText,
      bgColor: "bg-[#e8f1ff] text-[#0066ff]",
      href: "/cv-upload",
    },
    {
      title: "Successfully Processed",
      value: loading ? "..." : totalRecords.toString(),
      subtitle: "Gemini AI Processed",
      icon: CheckCircle2,
      bgColor: "bg-[#e6f9f0] text-[#10b981]",
      href: "/employees",
    },
    {
      title: "Database Status",
      value: "Active",
      subtitle: "Supabase Live DB",
      icon: Database,
      bgColor: "bg-[#fef6e7] text-[#f59e0b]",
      href: "/employees",
    },
    {
      title: "CV Uploaded Today",
      value: loading ? "..." : totalRecords.toString(),
      subtitle: "Original PDF Saved",
      icon: UploadCloud,
      bgColor: "bg-[#f3e8ff] text-[#9333ea]",
      href: "/cv-upload",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="h-full flex flex-col justify-between relative overflow-hidden border-slate-200/80 dark:border-slate-800 card-elevation rounded-2xl bg-white dark:bg-[#111c38]">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">{stat.title}</p>
                  <h3 className="text-2xl font-bold font-sans font-tabular text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-normal">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bgColor} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <Link
                href={stat.href}
                className="inline-flex items-center text-xs font-bold text-[#0066ff] hover:text-[#0052cc] dark:text-[#0066ff] group pt-1"
              >
                <span>View Details</span>
                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
