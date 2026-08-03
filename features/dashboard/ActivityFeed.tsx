import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UploadCloud, UserPlus, Cpu, FileText, Download } from "lucide-react";
import Link from "next/link";

export function ActivityFeed() {
  const activities = [
    {
      icon: UploadCloud,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      text: "CV file Rahim_Hasan_CV.pdf successfully processed",
      timestamp: "02-05-2024, 10:30 AM",
    },
    {
      icon: UserPlus,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
      text: "New employee profile created: Md. Salim Uddin",
      timestamp: "02-05-2024, 09:20 AM",
    },
    {
      icon: Cpu,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      text: "120 CVs currently under AI processing",
      timestamp: "02-05-2024, 09:00 AM",
    },
    {
      icon: FileText,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
      text: "CV file Fahima_Akter_CV.pdf successfully processed",
      timestamp: "02-05-2024, 08:45 AM",
    },
    {
      icon: Download,
      color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400",
      text: "Monthly employee report exported",
      timestamp: "02-05-2024, 08:30 AM",
    },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
          Recent Activities
        </CardTitle>
        <Link href="#" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
          View All -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((act, index) => {
            const Icon = act.icon;
            return (
              <div key={index} className="flex items-start space-x-3 text-xs">
                <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{act.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
