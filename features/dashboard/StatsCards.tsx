"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, CheckCircle2, Hourglass, FileText, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export function StatsCards() {
  const [counts, setCounts] = useState({
    total: 0,
    processed: 0,
    processing: 0,
    uploaded: 0,
    newJoinees: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();
      try {
        const { count: totalCount } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true });

        const { count: processedCount } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");

        const { count: processingCount } = await supabase
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("status", "processing");

        setCounts({
          total: totalCount || 0,
          processed: processedCount || 0,
          processing: processingCount || 0,
          uploaded: totalCount || 0,
          newJoinees: totalCount || 0,
        });
      } catch (e) {
        console.warn("Could not fetch stats counts:", e);
      }
    };

    fetchCounts();
  }, []);

  const stats = [
    {
      title: "Total Employees",
      value: counts.total.toLocaleString(),
      subtitle: "All Active Personnel",
      icon: Users,
      bgColor: "bg-[#cc785c]/10 text-[#cc785c]",
      href: "/employees",
    },
    {
      title: "Successfully Processed",
      value: counts.processed.toLocaleString(),
      subtitle: "Verified Records",
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      href: "/employees?status=active",
    },
    {
      title: "In Processing",
      value: counts.processing.toLocaleString(),
      subtitle: "AI Processing Queue",
      icon: Hourglass,
      bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      href: "/cv-upload",
    },
    {
      title: "CV Database",
      value: counts.uploaded.toLocaleString(),
      subtitle: "CV Extracted Records",
      icon: FileText,
      bgColor: "bg-purple-500/10 text-purple-400",
      href: "/cv-upload",
    },
    {
      title: "New Joinees",
      value: counts.newJoinees.toLocaleString(),
      subtitle: "Recent Additions",
      icon: UserPlus,
      bgColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      href: "/employees",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="h-full flex flex-col justify-between relative overflow-hidden border-[#e6dfd8] dark:border-[#2e2c28] bg-card text-card-foreground">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground tracking-tight">{stat.title}</p>
                  <h3 className="text-2xl font-bold font-sans font-tabular text-foreground mt-1.5 tracking-tight">{stat.value}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-normal">{stat.subtitle}</p>
                </div>
                <div className={`p-2.5 rounded-full ${stat.bgColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <Link
                href={stat.href}
                className="inline-flex items-center text-xs font-semibold text-[#cc785c] hover:text-[#a9583e] group pt-1"
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
