export interface MinimalCVRecord {
  id: string;
  candidateName: string;
  extractedText: string;
  originalFileName: string;
  originalPdfUrl: string;
  uploadedAt: string;
}

export const cvService = {
  async uploadCV(file: File): Promise<{ success: boolean; record?: MinimalCVRecord; error?: string }> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || "Upload request failed" };
    }
  },

  async searchCandidates(query: string): Promise<Array<Omit<MinimalCVRecord, "extractedText">>> {
    try {
      const res = await fetch(`/api/cv/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error("Failed to search candidates:", err);
      return [];
    }
  },

  async getCVById(id: string): Promise<MinimalCVRecord | null> {
    try {
      const res = await fetch(`/api/cv/${id}`);
      const data = await res.json();
      if (data.success && data.record) {
        return data.record;
      }
    } catch (err) {
      console.error("Failed to fetch CV by ID:", err);
    }
    return null;
  },
};
