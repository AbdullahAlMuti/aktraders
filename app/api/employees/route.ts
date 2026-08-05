import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeParseStructuredJSON } from "@/lib/cv-json-unwrapper";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbawcgxjvjkvtgtczseo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function parseCandidateDetails(candidateName: string, text: string, rawStructuredData?: any) {
  const structured = safeParseStructuredJSON(rawStructuredData);

  const content = text || "";
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = structured?.personal?.email || (emailMatch ? emailMatch[0] : "Not Provided in CV");

  const phoneMatch = content.match(/(?:\+880|01)[0-9]{8,9}/) || content.match(/\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);
  const phone = structured?.personal?.mobile || structured?.personal?.phone || (phoneMatch ? phoneMatch[0] : "Not Provided in CV");

  const designation = structured?.employment?.designation || structured?.designation || "Not Provided in CV";
  const department = structured?.employment?.department || structured?.department || "Not Provided in CV";

  return { email, phone, designation, department };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase.from("cv_records").select("*", { count: "exact" });

    if (search) {
      const q = search.replace(/AKT-/i, "").replace(/'/g, "''");
      dbQuery = dbQuery.or(
        `candidate_name.ilike.%${q}%,id.ilike.%${q}%,original_file_name.ilike.%${q}%,extracted_text.ilike.%${q}%`
      );
    }

    dbQuery = dbQuery.range(from, to).order("created_at", { ascending: false });

    const { data, count, error } = await dbQuery;

    if (error) {
      console.error("Supabase getEmployees error:", error);
      return NextResponse.json({ success: false, data: [], meta: { total: 0, page, limit, totalPages: 0 } });
    }

    const formattedEmployees = (data || []).map((item: any) => {
      const parsed = parseCandidateDetails(item.candidate_name, item.extracted_text, item.structured_data);
      return {
        id: item.id,
        name: item.candidate_name,
        email: parsed.email,
        phone: parsed.phone,
        department: parsed.department,
        designation: parsed.designation,
        status: "active",
        joiningDate: item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        cvFileName: item.original_file_name,
        cvFileSize: "PDF Document",
        avatarUrl: undefined,
        cvData: {
          id: item.id,
          candidateName: item.candidate_name,
          extractedText: item.extracted_text,
          structuredData: item.structured_data,
          originalFileName: item.original_file_name,
          originalPdfUrl: item.original_pdf_url,
          uploadedAt: item.created_at,
        },
      };
    });

    const totalRecords = count !== null ? count : formattedEmployees.length;

    return NextResponse.json({
      success: true,
      data: formattedEmployees,
      meta: {
        total: totalRecords,
        page,
        limit,
        totalPages: totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0,
      },
    });
  } catch (err: any) {
    console.error("getEmployees API error:", err);
    return NextResponse.json({ success: false, data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  }
}
