export interface Finding {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
}

export interface ScanResult {
  provider: string;
  status: "success" | "error";
  severity: "low" | "medium" | "high" | "critical";
  score: number;
  findings: Finding[];
  metadata: Record<string, any>;
}
