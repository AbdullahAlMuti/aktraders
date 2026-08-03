"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { employeeService } from "@/services/employee.service";
import { Employee } from "@/types/employee.types";

export function RecentCVTable() {
  const [uploads, setUploads] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getEmployees({ limit: 5 }).then((res) => {
      if (res && res.data) {
        setUploads(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-[#e6dfd8] dark:border-[#2e2c28]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">
          Recently Uploaded CVs
        </CardTitle>
        <Link href="/cv-upload" className="text-xs font-semibold text-[#cc785c] hover:underline dark:text-[#cc785c]">
          View All -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400 font-mono">Loading records...</div>
        ) : uploads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <FileText className="h-8 w-8 text-neutral-400" />
            <p className="text-xs text-neutral-500 font-medium">No Recently Uploaded CVs Found</p>
            <p className="text-[11px] text-neutral-400">No recent CV uploads available in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e6dfd8] text-neutral-500 dark:border-[#2e2c28] text-left font-semibold">
                  <th className="py-2.5 px-2">Name</th>
                  <th className="py-2.5 px-2">File Name</th>
                  <th className="py-2.5 px-2">Joining Date</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd8] dark:divide-[#2e2c28]">
                {uploads.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <Avatar name={item.name} size="sm" />
                        <span className="font-semibold text-neutral-900 dark:text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                      {item.cvFileName || "N/A"}
                    </td>
                    <td className="py-3 px-2 text-neutral-500">{item.joiningDate || "N/A"}</td>
                    <td className="py-3 px-2">
                      <Badge variant={item.status === "active" ? "success" : item.status === "processing" ? "warning" : "secondary"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/employees`}
                        className="inline-flex items-center rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-[#cc785c] dark:hover:bg-neutral-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
