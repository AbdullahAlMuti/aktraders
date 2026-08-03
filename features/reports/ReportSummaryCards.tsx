import { Card, CardContent } from "@/components/ui/Card";
import { Users, CheckCircle, UserX, FileCheck, UserPlus } from "lucide-react";

export function ReportSummaryCards() {
  const cards = [
    { title: "Total Employees", value: "3,000", subtitle: "All Time", icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
    { title: "Active Employees", value: "2,850", subtitle: "Currently Active", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
    { title: "Resigned / Retired", value: "120", subtitle: "This Period", icon: UserX, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
    { title: "CVs Uploaded", value: "2,980", subtitle: "This Period", icon: FileCheck, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40" },
    { title: "New Joinees", value: "320", subtitle: "This Period", icon: UserPlus, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <Card key={i} className="border-slate-200/80 dark:border-slate-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">{c.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{c.value}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{c.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
