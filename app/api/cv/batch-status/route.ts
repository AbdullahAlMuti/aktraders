import { NextRequest, NextResponse } from "next/server";
import { batchJobsMap } from "@/lib/cv-batch-processor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const batchId = url.searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json(
        { success: false, error: "Missing batchId parameter." },
        { status: 400 }
      );
    }

    const job = batchJobsMap.get(batchId);

    if (!job) {
      return NextResponse.json(
        { success: false, error: `Batch job '${batchId}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      batch: job,
    });
  } catch (err: any) {
    console.error("Error in batch-status route:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error." },
      { status: 500 }
    );
  }
}
