import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";

    let dbQuery = supabase.from("cv_records").select("id, candidate_name, original_file_name, original_pdf_url, created_at");

    if (query.length > 0) {
      dbQuery = dbQuery.ilike("candidate_name", `%${query}%`);
    }

    const { data, error } = await dbQuery.order("created_at", { ascending: false }).limit(20);

    if (error) {
      console.error("Supabase search query error:", error);
      return NextResponse.json({ success: false, results: [] });
    }

    const results = (data || []).map((item) => ({
      id: item.id,
      candidateName: item.candidate_name,
      originalFileName: item.original_file_name,
      originalPdfUrl: item.original_pdf_url,
      uploadedAt: item.created_at,
    }));

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err: any) {
    console.error("Search route error:", err);
    return NextResponse.json({ success: false, results: [] });
  }
}
