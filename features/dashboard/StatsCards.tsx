import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, CheckCircle2, Hourglass, FileText, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export function StatsCards() {
  const stats = [
    {
      title: "Total Employees",
      value: "3,000",
      subtitle: "All Active Staff",
      icon: Users,
      bgColor: "bg-[#533afd]/10 text-[#533afd]",
      href: "/employees",
    },
    {
      title: "Successfully Processed",
      value: "2,850",
      subtitle: "To Date",
      icon: CheckCircle2,
      bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      href: "/employees?status=active",
    },
    {
      title: "In Processing",
      value: "120",
      subtitle: "AI Processing Active",
      icon: Hourglass,
      bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      href: "/cv-upload",
    },
    {
      title: "CV Uploaded",
      value: "2,980",
      subtitle: "To Date",
      icon: FileText,
      bgColor: "bg-[#f96bee]/10 text-[#f96bee]",
      href: "/cv-upload",
    },
    {
      title: "New Joinees",
      value: "320",
      subtitle: "This Month",
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
          <Card key={i} className="h-full flex flex-col justify-between relative overflow-hidden border-[#e6dfd8] dark:border-[#2e2c28]">
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-medium text-[#64748d] dark:text-slate-400 tracking-tight">{stat.title}</p>
                  <h3 className="text-2xl font-bold font-sans font-tabular text-neutral-900 dark:text-white mt-1.5 tracking-tight">{stat.value}</h3>
                  <p className="text-[10px] text-[#64748d] dark:text-slate-400 mt-0.5 font-normal">{stat.subtitle}</p>
                </div>
                <div className={`p-2.5 rounded-full ${stat.bgColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <Link
                href={stat.href}
                className="inline-flex items-center text-xs font-semibold text-[#533afd] hover:text-[#4434d4] dark:text-blue-400 group pt-1"
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
