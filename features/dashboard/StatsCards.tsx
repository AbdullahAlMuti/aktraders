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
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      href: "/employees",
    },
    {
      title: "Successfully Processed",
      value: "2,850",
      subtitle: "To Date",
      icon: CheckCircle2,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      href: "/employees?status=active",
    },
    {
      title: "In Processing",
      value: "120",
      subtitle: "AI Processing Active",
      icon: Hourglass,
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      iconColor: "text-amber-600 dark:text-amber-400",
      href: "/cv-upload",
    },
    {
      title: "CV Uploaded",
      value: "2,980",
      subtitle: "To Date",
      icon: FileText,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-600 dark:text-purple-400",
      href: "/cv-upload",
    },
    {
      title: "New Joinees",
      value: "320",
      subtitle: "This Month",
      icon: UserPlus,
      bgColor: "bg-cyan-50 dark:bg-cyan-950/40",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      href: "/employees",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="relative overflow-hidden hover:shadow-md transition-all border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stat.value}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{stat.subtitle}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <Link
                href={stat.href}
                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-4 group"
              >
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
