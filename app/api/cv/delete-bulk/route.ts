import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteEmployeeEverywhere } from "@/lib/db-schema";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "IDs array is required" }, { status: 400 });
    }

    let deletedCount = 0;
    for (const id of ids) {
      const ok = await deleteEmployeeEverywhere(id);
      if (ok) deletedCount++;
    }

    if (deletedCount === 0) {
      return NextResponse.json({ success: false, error: "No records could be deleted" }, { status: 500 });
    }

    console.log(`Successfully bulk deleted ${deletedCount} employee record(s)`);

    return NextResponse.json({
      success: true,
      deletedCount,
    });
  } catch (err: any) {
    console.error("Bulk Delete API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to bulk delete records" }, { status: 500 });
  }
}
