import { useState } from "react";
import { qarbiteApi } from "@/services/api";
import { AIAnalysisResult } from "@/types";

export const useUploadImage = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  const uploadMedia = async (file: File, assetId: string) => {
    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await qarbiteApi.uploadInspectionMedia(file, assetId);

      if (response.success && response.data) {
        setAnalysisResult(response.data);
      } else {
        setError(response.message || "Gagal menganalisis media.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem saat menghubungi AI.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadState = () => {
    setIsUploading(false);
    setError(null);
    setAnalysisResult(null);
  };

  return { isUploading, error, analysisResult, uploadMedia, resetUploadState };
};