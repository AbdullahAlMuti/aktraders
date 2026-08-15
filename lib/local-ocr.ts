import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * High-Speed Local OCR for Scanned Bengali and English PDFs
 * Uses PyMuPDF + Tesseract OCR (with ben+eng models from tessdata)
 * 100% Offline, Zero API calls, Zero quota limits.
 */
export async function extractTextWithLocalOcr(pdfBuffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const tempPdfPath = path.join(tempDir, `cv_ocr_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`);
  const scriptPath = path.join(process.cwd(), "scripts", "ocr_extract.py");

  try {
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    return await new Promise<string>((resolve) => {
      const pythonProcess = spawn("python", [scriptPath, tempPdfPath], {
        env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" },
      });
      let stdout = "";
      let stderr = "";

      const timer = setTimeout(() => {
        try {
          pythonProcess.kill();
        } catch {}
        console.warn("Local OCR timed out after 15s");
        resolve("");
      }, 15000);

      pythonProcess.stdout.on("data", (chunk) => {
        stdout += chunk.toString("utf-8");
      });

      pythonProcess.stderr.on("data", (chunk) => {
        stderr += chunk.toString("utf-8");
      });

      pythonProcess.on("close", (code) => {
        clearTimeout(timer);
        try {
          if (fs.existsSync(tempPdfPath)) {
            fs.unlinkSync(tempPdfPath);
          }
        } catch {}

        if (code === 0 && stdout.trim()) {
          try {
            const parsed = JSON.parse(stdout.trim());
            if (parsed.text) {
              return resolve(parsed.text);
            }
          } catch {
            return resolve(stdout.trim());
          }
        } else {
          if (stderr) console.warn("Local OCR stderr:", stderr.slice(0, 300));
        }
        resolve("");
      });

      pythonProcess.on("error", (err) => {
        clearTimeout(timer);
        console.warn("Local OCR process error:", err.message);
        try {
          if (fs.existsSync(tempPdfPath)) {
            fs.unlinkSync(tempPdfPath);
          }
        } catch {}
        resolve("");
      });
    });
  } catch (err: any) {
    console.warn("extractTextWithLocalOcr error:", err.message);
    try {
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }
    } catch {}
    return "";
  }
}
