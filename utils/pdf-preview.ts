import { useState, useEffect } from "react";

export function getSafePdfBlobUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (typeof window === "undefined") return null;

  if (url.startsWith("data:application/pdf;base64,")) {
    try {
      const base64Data = url.split(",")[1];
      const binaryStr = window.atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn("Failed to convert Data URI to Blob URL:", e);
      return null;
    }
  }
  return url;
}

export function usePdfBlobUrl(url: string | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setBlobUrl(null);
      return;
    }

    const createdUrl = getSafePdfBlobUrl(url);
    setBlobUrl(createdUrl);

    return () => {
      if (createdUrl && createdUrl.startsWith("blob:")) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [url]);

  return blobUrl;
}
