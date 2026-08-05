"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { FileText, User, ExternalLink, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
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
  const [showAll, setShowAll] = useState(false);

  const fetchRecords = useCallback(() => {
    cvService.searchCandidates("").then((results) => {
      setRecords(results);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchRecords();
    window.addEventListener("focus", fetchRecords);
    const interval = setInterval(fetchRecords, 3000);
    return () => {
      window.removeEventListener("focus", fetchRecords);
      clearInterval(interval);
    };
  }, [fetchRecords]);

  const visibleRecords = showAll ? records : records.slice(0, 6);

  return (
    <Card className="h-full flex flex-col justify-between border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111c38]">
      <div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-[#0066ff]" />
            Recently Saved CV Records
          </CardTitle>
          <Link href="/cv-upload" className="text-xs font-bold text-[#0066ff] hover:underline dark:text-[#0066ff]">
            Upload New CV -&gt;
          </Link>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">Loading records from database...</div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
              <FileText className="h-8 w-8 text-slate-400" />
              <p className="text-xs text-slate-500 font-medium">No Saved CV Records Found</p>
              <p className="text-[11px] text-slate-400">Upload a PDF CV to extract and save candidate details.</p>
              <div className="pt-2">
                <Link href="/cv-upload">
                  <button className="px-4 py-1.5 rounded-xl bg-[#0066ff] text-white text-xs font-semibold hover:bg-[#0052cc] transition-colors shadow-sm">
                    Upload First PDF CV
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 dark:border-slate-800 text-left font-semibold">
                    <th className="py-2.5 px-2">Candidate Name</th>
                    <th className="py-2.5 px-2">Original PDF File</th>
                    <th className="py-2.5 px-2">Upload Date</th>
                    <th className="py-2.5 px-2 text-right">View CV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {visibleRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f1ff] text-[#0066ff] font-bold text-xs shrink-0">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">{item.candidateName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {item.originalFileName}
                      </td>
                      <td className="py-3 px-2 text-slate-400 font-mono text-[11px]">
                        {new Date(item.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            href={`/profile?id=${item.id}`}
                            className="inline-flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-bold bg-[#e8f1ff] text-[#0066ff] hover:bg-[#d4e4ff] transition-colors"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete CV record for ${item.candidateName}?`)) {
                                const { employeeService } = await import("@/services/employee.service");
                                const ok = await employeeService.deleteEmployee(item.id);
                                if (ok) {
                                  setRecords((prev) => prev.filter((r) => r.id !== item.id));
                                }
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </div>

      {/* See More Footer Button */}
      {records.length > 6 && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 rounded-b-2xl">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center space-x-1 text-xs font-bold text-[#0066ff] hover:text-[#0052cc] transition-colors"
          >
            <span>{showAll ? "Show Top 6 Only" : `See More (${records.length - 6} more records)`}</span>
            {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <Link
            href="/employees"
            className="text-xs font-bold text-slate-500 hover:text-[#0066ff] transition-colors"
          >
            View All in Employee List -&gt;
          </Link>
        </div>
      )}
    </Card>
  );
}
