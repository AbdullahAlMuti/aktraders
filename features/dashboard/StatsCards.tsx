"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { FileText, CheckCircle2, Database, UploadCloud, ArrowRight } from "lucide-react";
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
      title: "Total Saved CVs",
      value: loading ? "..." : totalRecords.toString(),
      subtitle: "Stored in Supabase DB",
      icon: FileText,
      bgColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      href: "/cv-upload",
    },
    {
      title: "Database Status",
      value: "Active",
      subtitle: "Postgres Storage",
      icon: Database,
      bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      href: "/cv-upload",
    },
    {
      title: "Gemini Vision AI",
      value: "Enabled",
      subtitle: "Server-side Extraction",
      icon: CheckCircle2,
      bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      href: "/cv-upload",
    },
    {
      title: "PDF Storage",
      value: "Secure",
      subtitle: "Original Preservation",
      icon: UploadCloud,
      bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      href: "/cv-upload",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="h-full flex flex-col justify-between relative overflow-hidden border-[#e6dfd8] dark:border-[#2e2c28]">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 tracking-tight">{stat.title}</p>
                  <h3 className="text-2xl font-bold font-sans font-tabular text-neutral-900 dark:text-white mt-1.5 tracking-tight">{stat.value}</h3>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-normal">{stat.subtitle}</p>
                </div>
                <div className={`p-2.5 rounded-full ${stat.bgColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <Link
                href={stat.href}
                className="inline-flex items-center text-xs font-semibold text-[#cc785c] hover:text-[#a9583e] dark:text-[#cc785c] group pt-1"
              >
                <span>CV Upload Workflow</span>
                <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
