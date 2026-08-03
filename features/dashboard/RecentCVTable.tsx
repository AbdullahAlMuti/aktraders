import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { Eye } from "lucide-react";

export function RecentCVTable() {
  const uploads = [
    {
      name: "Md. Rahim Hasan",
      fileName: "Rahim_Hasan_CV.pdf",
      date: "02-05-2024",
      time: "10:30 AM",
      status: "সম্পন্ন",
      variant: "success" as const,
    },
    {
      name: "Fahima Akter",
      fileName: "Fahima_Akter_CV.pdf",
      date: "02-05-2024",
      time: "09:45 AM",
      status: "সম্পন্ন",
      variant: "success" as const,
    },
    {
      name: "Md. Salim Uddin",
      fileName: "Salim_Uddin_CV.pdf",
      date: "02-05-2024",
      time: "09:20 AM",
      status: "প্রক্রিয়াধীন",
      variant: "warning" as const,
    },
    {
      name: "Nusrat Jahan",
      fileName: "Nusrat_Jahan_CV.pdf",
      date: "02-05-2024",
      time: "08:55 AM",
      status: "প্রক্রিয়াধীন",
      variant: "warning" as const,
    },
    {
      name: "Abdur Rahman",
      fileName: "Abdur_Rahman_CV.pdf",
      date: "02-05-2024",
      time: "08:20 AM",
      status: "অপেক্ষমাণ",
      variant: "secondary" as const,
    },
  ];

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
          সাম্প্রতিক আপলোডকৃত CV (Recently Uploaded CVs)
        </CardTitle>
        <Link href="/cv-upload" className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
          সব দেখুন -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800 text-left font-semibold">
                <th className="py-2.5 px-2">নাম (Name)</th>
                <th className="py-2.5 px-2">ফাইলের নাম</th>
                <th className="py-2.5 px-2">আপলোডের তারিখ</th>
                <th className="py-2.5 px-2">অবস্থা (Status)</th>
                <th className="py-2.5 px-2 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {uploads.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      <Avatar name={item.name} size="sm" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{item.fileName}</td>
                  <td className="py-3 px-2 text-slate-500">
                    <div>{item.date}</div>
                    <div className="text-[10px] text-slate-400">{item.time}</div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={item.variant}>{item.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Link
                      href="/cv-upload"
                      className="inline-flex items-center rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
