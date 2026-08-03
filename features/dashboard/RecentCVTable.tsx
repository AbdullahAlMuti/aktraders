"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Eye, FileText, Calendar, User, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { cvService } from "@/services/cv.service";

interface CVItem {
  id: string;
  candidateName: string;
  originalFileName: string;
  originalPdfUrl: string;
  uploadedAt: string;
}

export function RecentCVTable() {
  const [records, setRecords] = useState<CVItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cvService.searchCandidates("").then((results) => {
      setRecords(results);
      setLoading(false);
    });
  }, []);

  return (
    <Card className="h-full flex flex-col justify-between border-[#e6dfd8] dark:border-[#2e2c28]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#cc785c]" />
          Recently Saved CV Records
        </CardTitle>
        <Link href="/cv-upload" className="text-xs font-semibold text-[#cc785c] hover:underline dark:text-[#cc785c]">
          Upload New CV -&gt;
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400 font-mono">Loading records from database...</div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
            <FileText className="h-8 w-8 text-neutral-400" />
            <p className="text-xs text-neutral-500 font-medium">No Saved CV Records Found</p>
            <p className="text-[11px] text-neutral-400">Upload a PDF CV to extract and save candidate details.</p>
            <div className="pt-2">
              <Link href="/cv-upload">
                <button className="px-4 py-1.5 rounded-lg bg-[#cc785c] text-white text-xs font-semibold hover:bg-[#a9583e] transition-colors">
                  Upload First PDF CV
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#e6dfd8] text-neutral-500 dark:border-[#2e2c28] text-left font-semibold">
                  <th className="py-2.5 px-2">Candidate Name</th>
                  <th className="py-2.5 px-2">Original PDF File</th>
                  <th className="py-2.5 px-2">Upload Date</th>
                  <th className="py-2.5 px-2 text-right">View CV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6dfd8] dark:divide-[#2e2c28]">
                {records.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-bold text-xs">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-semibold text-neutral-900 dark:text-white">{item.candidateName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                      {item.originalFileName}
                    </td>
                    <td className="py-3 px-2 text-neutral-500">
                      {new Date(item.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        href={`/cv-upload/${item.id}`}
                        className="inline-flex items-center space-x-1 rounded px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition-colors"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
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
