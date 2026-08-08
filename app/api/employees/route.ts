import { NextRequest, NextResponse } from "next/server";
import { localEmployeeStore, buildFullProfileFromRecord, profileFromEmployeeRow, supabase } from "@/lib/db-schema";
import { FullEmployeeProfile } from "@/types/employee.types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const profilesList: FullEmployeeProfile[] = [];
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();

    const addProfile = (profile: FullEmployeeProfile) => {
      if (profile.deleted) {
        seenIds.add(profile.employeeId);
        seenIds.add(profile.id);
        return;
      }
      if (seenIds.has(profile.employeeId) || seenIds.has(profile.id)) return;
      const email = profile.email?.trim().toLowerCase();
      if (email && seenEmails.has(email)) return;
      seenIds.add(profile.employeeId);
      seenIds.add(profile.id);
      if (email) seenEmails.add(email);
      profilesList.push(profile);
    };

    // 1. Primary source of truth: Supabase `employees` table
    try {
      const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false }).limit(2000);
      for (const row of data || []) {
        addProfile(profileFromEmployeeRow(row));
      }
    } catch (dbErr) {
      console.warn("Supabase employees fetch warning:", dbErr);
    }

    // 2. Legacy CV records that were never promoted to an employees row
    try {
      const { data } = await supabase.from("cv_records").select("*").order("created_at", { ascending: false }).limit(2000);
      for (const item of data || []) {
        addProfile(buildFullProfileFromRecord(item));
      }
    } catch (dbErr) {
      console.warn("Supabase cv_records fetch warning:", dbErr);
    }

    // 3. In-memory cache (covers a DB outage within this server process)
    for (const profile of localEmployeeStore.values()) {
      addProfile(profile);
    }

    // 4. Multi-Identifier Filter Engine
    let filtered = profilesList;
    if (search) {
      filtered = profilesList.filter((p) => {
        return (
          p.name.toLowerCase().includes(search) ||
          p.employeeId.toLowerCase().includes(search) ||
          p.applicantId.toLowerCase().includes(search) ||
          p.cvNumber.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.phone.toLowerCase().includes(search) ||
          p.designation.toLowerCase().includes(search) ||
          p.department.toLowerCase().includes(search) ||
          p.otherDetails?.skills?.some((s) => s.toLowerCase().includes(search))
        );
      });
    }

    const total = filtered.length;
    const from = (page - 1) * limit;
    const paginated = filtered.slice(from, from + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      },
    });
  } catch (err: any) {
    console.error("getEmployees API error:", err);
    return NextResponse.json({ success: false, data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  }
}
