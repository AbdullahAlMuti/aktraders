"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EmployeeProfileView } from "@/features/employees/EmployeeProfileView";
import { FullEmployeeProfile } from "@/types/employee.types";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [profile, setProfile] = useState<FullEmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/employees/${id}`);
        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        } else {
          setError(data.error || "Failed to load employee profile.");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading employee profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Loading 6-Tab Employee Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Employee Profile Not Found</h2>
        <p className="text-sm text-slate-400">{error || `No profile matching identifier '${id}' exists.`}</p>
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Employee Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
        </Link>
      </div>

      <EmployeeProfileView profile={profile} />
    </div>
  );
}
