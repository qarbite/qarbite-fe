export type SeverityLevel = "Low" | "Medium" | "High" | "Critical";
export type InsightPriority = "HIGH PRIORITY" | "OPTIMIZATION" | "INVENTORY ALERT";

export interface Anomaly {
  id: string;
  type: string;
  severity: SeverityLevel;
  confidenceScore: number;
  description: string;
}

export interface Recommendation {
  id: string;
  action: string;
  priority: InsightPriority;
  estimatedTimeToFailure?: number; 
}

export interface AIAnalysisResult {
  inspectionId: string;
  assetId: string;
  qaValidationStatus: "Pending" | "Valid" | "Invalid";
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  analyzedAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: AIAnalysisResult;
}