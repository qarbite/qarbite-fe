import { UploadResponse } from "@/types";

export const qarbiteApi = {
  uploadInspectionMedia: async (
    file: File,
    assetId: string
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assetId", assetId);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Gagal memproses. Status: ${response.status}`);
      }

      const result: UploadResponse = await response.json();
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};