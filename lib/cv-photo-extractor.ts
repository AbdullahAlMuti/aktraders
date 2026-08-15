import fs from "fs";
import path from "path";

interface PdfImageCandidate {
  data: Buffer;
  width: number;
  height: number;
}

/**
 * Finds JPEG (DCTDecode) image XObjects embedded in a PDF buffer.
 * Uses latin1 string indexing so string offsets equal byte offsets.
 */
function findPdfJpegImages(pdfBuffer: Buffer): PdfImageCandidate[] {
  const pdfStr = pdfBuffer.toString("latin1");
  const candidates: PdfImageCandidate[] = [];
  const subtypeRegex = /\/Subtype\s*\/Image/g;
  let match: RegExpExecArray | null;

  while ((match = subtypeRegex.exec(pdfStr)) !== null && candidates.length < 20) {
    // Image dictionaries are small; a window around the match covers the params.
    const dictStart = Math.max(0, match.index - 800);
    const dictWindow = pdfStr.slice(dictStart, match.index + 1200);

    if (!/\/Filter\s*(?:\[\s*)?\/DCTDecode/.test(dictWindow)) continue;
    // Soft masks are alpha channels, not photos.
    if (/\/ImageMask\s+true/.test(dictWindow)) continue;

    const widthMatch = dictWindow.match(/\/Width\s+(\d+)/);
    const heightMatch = dictWindow.match(/\/Height\s+(\d+)/);
    const width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;

    const streamKeyword = pdfStr.indexOf("stream", match.index);
    if (streamKeyword === -1) continue;
    let dataStart = streamKeyword + "stream".length;
    if (pdfStr[dataStart] === "\r") dataStart++;
    if (pdfStr[dataStart] === "\n") dataStart++;
    const dataEnd = pdfStr.indexOf("endstream", dataStart);
    if (dataEnd === -1) continue;

    const data = pdfBuffer.subarray(dataStart, dataEnd);
    // Verify JPEG magic bytes (SOI marker FF D8)
    if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) continue;

    candidates.push({ data: Buffer.from(data), width, height });
  }

  return candidates;
}

/**
 * Scores whether an embedded image looks like a candidate portrait photo
 * rather than a logo, icon, banner, or decorative graphic.
 * Returns 0 when the image should be rejected.
 */
function portraitScore(img: PdfImageCandidate): number {
  const { width, height, data } = img;
  if (!width || !height) return 0;
  if (width < 90 || height < 90) return 0; // icons / logos are small
  if (data.length < 4000 || data.length > 3_000_000) return 0;

  const ratio = height / width;
  // Portrait photos are taller than wide or squarish; banners/logos are wide, full pages are very tall.
  if (ratio < 0.75 || ratio > 2.2) return 0;

  // Prefer classic passport/portrait ratios (~1.2-1.5), then square.
  const idealRatio = 1.3;
  const ratioPenalty = Math.abs(ratio - idealRatio);
  return (width * height) / (1 + ratioPenalty * 2);
}

/**
 * CV Photo Extractor Engine: detects and saves the candidate's profile photo.
 * Returns the public URL of the saved photo, or undefined when no plausible
 * candidate photo exists (callers then fall back to the default avatar).
 */
export async function extractAndSaveProfilePhoto(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  employeeId: string
): Promise<string | undefined> {
  try {
    const photosDir = path.join(process.cwd(), "public", "uploads", "photos");
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }

    // 1. Direct image file (image-based CV): the page usually shows the candidate.
    if (mimeType.startsWith("image/")) {
      const ext = mimeType.split("/")[1] || "png";
      const photoFileName = `${employeeId.toLowerCase()}_avatar.${ext}`;
      try {
        fs.writeFileSync(path.join(photosDir, photoFileName), fileBuffer);
        return `/uploads/photos/${photoFileName}`;
      } catch {
        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      }
    }

    // 2. PDF: extract embedded JPEG XObjects and pick the most portrait-like one.
    if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      const images = findPdfJpegImages(fileBuffer);
      let best: PdfImageCandidate | null = null;
      let bestScore = 0;

      for (const img of images) {
        const score = portraitScore(img);
        if (score > bestScore) {
          best = img;
          bestScore = score;
        }
      }

      if (best) {
        const photoFileName = `${employeeId.toLowerCase()}_avatar.jpg`;
        try {
          fs.writeFileSync(path.join(photosDir, photoFileName), best.data);
          return `/uploads/photos/${photoFileName}`;
        } catch {
          return `data:image/jpeg;base64,${best.data.toString("base64")}`;
        }
      }
    }
  } catch (err) {
    console.warn("CV Photo Extractor warning:", err);
  }

  return undefined;
}
