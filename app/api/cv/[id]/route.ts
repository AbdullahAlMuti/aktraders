import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deleteEmployeeEverywhere } from "@/lib/db-schema";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kvddegdgvdzldlwslvre.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_gs-IB3kyklUD6MmEgC4ANQ_0KyJD8Vo";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: (url: any, init: any = {}) => fetch(url, { ...init, cache: "no-store" }) },
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

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

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Record ID is required" }, { status: 400 });
    }

    // The id may be a raw CV record id (cv-...) or an employee id (EMP-...).
    const ok = await deleteEmployeeEverywhere(id);

    if (!ok) {
      return NextResponse.json({ success: false, error: "Failed to delete record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully" });
  } catch (err: any) {
    console.error("CV Delete API error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete CV record" }, { status: 500 });
  }
}
