import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const { error, count } = await supabase
      .from("cv_records")
      .delete({ count: "exact" })
      .in("id", ids);

    if (error) {
      console.error("Bulk Delete DB Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`Successfully bulk deleted ${count || ids.length} records from cv_records`);

    return NextResponse.json({
      success: true,
      deletedCount: count || ids.length,
    });
  } catch (err: any) {
    console.error("Bulk Delete API Error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to bulk delete records" }, { status: 500 });
  }
}
