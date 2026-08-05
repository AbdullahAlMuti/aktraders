import { NextRequest, NextResponse } from "next/server";
import { unpackZipFiles, processCvBatch, createBatchJob } from "@/lib/cv-batch-processor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const rawFiles: File[] = [];
    const filesFromFiles = formData.getAll("files");
    const filesFromFile = formData.getAll("file");
    const combined = [...filesFromFiles, ...filesFromFile];

    for (const item of combined) {
      if (item && typeof item === "object" && "arrayBuffer" in item) {
        rawFiles.push(item as File);
      }
    }

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files provided in request." },
        { status: 400 }
      );
    }

    const filesToProcess: Array<{ name: string; buffer: Buffer }> = [];

    for (const file of rawFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = file.name || "uploaded_file";
      const lowerName = fileName.toLowerCase();

      if (lowerName.endsWith(".zip")) {
        try {
          const unpacked = await unpackZipFiles(buffer);
          filesToProcess.push(...unpacked);
        } catch (zipErr) {
          console.warn(`Failed to unpack zip file ${fileName}:`, zipErr);
        }
      } else if (
        lowerName.endsWith(".pdf") ||
        lowerName.endsWith(".docx") ||
        lowerName.endsWith(".png") ||
        lowerName.endsWith(".jpg") ||
        lowerName.endsWith(".jpeg")
      ) {
        filesToProcess.push({ name: fileName, buffer });
      }
    }

    if (filesToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: "No supported CV files (.pdf, .docx, .png, .jpg, .jpeg, .zip) were found." },
        { status: 400 }
      );
    }

    const batchId = `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create initial job synchronously so caller gets immediate queued status
    const initialJob = createBatchJob(filesToProcess, batchId);

    // Non-blocking async promise call
    processCvBatch(filesToProcess, batchId).catch((err) => {
      console.error(`Background batch processing error for batch ${batchId}:`, err);
    });

    return NextResponse.json({
      success: true,
      batchId,
      totalFiles: filesToProcess.length,
      batch: initialJob,
      message: `Batch processing started for ${filesToProcess.length} file(s).`,
    });
  } catch (err: any) {
    console.error("Error in upload-bulk route:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process upload request." },
      { status: 500 }
    );
  }
}
