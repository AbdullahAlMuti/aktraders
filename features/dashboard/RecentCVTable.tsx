"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { Eye, FileText, UploadCloud } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function RecentCVTable() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCVs = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          setRecords(data);
        }
      } catch (e) {
        console.warn("Could not fetch recent CVs:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCVs();
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-[#e6dfd8] dark:border-[#2e2c28] bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-foreground">
          Recently Uploaded CVs
        </CardTitle>
        <Link href="/employees" className="text-xs font-semibold text-[#cc785c] hover:underline">
          View All -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
            Loading recent records...
          </div>
        ) : records.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="mx-auto h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">No CV Records Yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Upload a candidate PDF or Image to extract candidate data.</p>
            </div>
            <Link
              href="/cv-upload"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#cc785c] text-white text-xs font-semibold hover:bg-[#a9583e] transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload Candidate CV</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-left font-semibold">
                  <th className="py-2.5 px-2">Name</th>
                  <th className="py-2.5 px-2">File Name</th>
                  <th className="py-2.5 px-2">Department</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <Avatar name={item.name} size="sm" />
                        <span className="font-semibold text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground font-mono text-[11px]">
                      {item.cv_file_name || `${item.name.replace(/\s+/g, "_")}_CV.pdf`}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground font-medium">{item.department || "General"}</td>
                    <td className="py-3 px-2">
                      <Badge variant={item.status === "active" ? "success" : "warning"}>
                        {item.status || "active"}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href="/employees"
                        className="inline-flex items-center rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
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
