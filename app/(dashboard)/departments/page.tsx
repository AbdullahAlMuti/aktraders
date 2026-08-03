import { PageContainer } from "@/components/layouts/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Departments",
  description: "AK Traders department management",
};

export default function DepartmentsPage() {
  const departments = [
    { name: "Sales", code: "DEPT-SLS", head: "Kazi Nazrul", count: 900, percentage: "30%", color: "border-l-blue-600" },
    { name: "Operations", code: "DEPT-OPS", head: "Tariqul Islam", count: 750, percentage: "25%", color: "border-l-emerald-600" },
    { name: "HR", code: "DEPT-HR", head: "Selina Parvin", count: 450, percentage: "15%", color: "border-l-amber-600" },
    { name: "Finance", code: "DEPT-FIN", head: "Mahmud Hasan", count: 300, percentage: "10%", color: "border-l-purple-600" },
    { name: "IT", code: "DEPT-IT", head: "Abdur Rahman", count: 300, percentage: "10%", color: "border-l-cyan-600" },
    { name: "Others", code: "DEPT-OTH", head: "Staff Admin", count: 300, percentage: "10%", color: "border-l-rose-600" },
  ];

  return (
    <PageContainer
      title="Departments"
      subtitle="Organizational departments and staff allocation overview"
      breadcrumbs={[{ label: "Departments" }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, i) => (
          <Card key={i} className={`border-l-4 ${dept.color} border-slate-200/80 dark:border-slate-800 hover:shadow-md transition-shadow`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold">{dept.name}</CardTitle>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{dept.code}</p>
                </div>
                <Badge variant="default">{dept.percentage}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Total Employees:</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{dept.count} Staff</span>
              </div>

              <div className="text-xs text-slate-500">
                Head of Department: <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.head}</span>
              </div>

              <Link
                href={`/employees?department=${dept.name}`}
                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 pt-2"
              >
                View Department Directory <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
