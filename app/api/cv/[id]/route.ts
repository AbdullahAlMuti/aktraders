import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Record ID is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("cv_records")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "CV Record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      record: {
        id: data.id,
        candidateName: data.candidate_name,
        extractedText: data.extracted_text,
        originalFileName: data.original_file_name,
        originalPdfUrl: data.original_pdf_url,
        uploadedAt: data.created_at,
      },
    });
  } catch (err: any) {
    console.error("CV Detail API error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch CV record" }, { status: 500 });
  }
}
