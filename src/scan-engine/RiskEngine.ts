import { ScanResult } from "@/types/scan";

export class RiskEngine {
  static calculateUnifiedScore(results: ScanResult[]): {
    score: number;
    severity: "low" | "medium" | "high" | "critical";
  } {
    let baseScore = 100;
    let maxSeverity: "low" | "medium" | "high" | "critical" = "low";

    const severityPriority = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    results.forEach((res) => {
      // Deduct score based on individual findings
      res.findings.forEach((finding) => {
        if (finding.severity === "critical") {
          baseScore -= 35;
        } else if (finding.severity === "high") {
          baseScore -= 20;
        } else if (finding.severity === "medium") {
          baseScore -= 10;
        } else if (finding.severity === "low") {
          baseScore -= 2;
        }

        // Keep track of maximum severity
        const currentPriority = severityPriority[finding.severity] || 1;
        const maxPriority = severityPriority[maxSeverity] || 1;
        if (currentPriority > maxPriority) {
          maxSeverity = finding.severity;
        }
      });
    });

    const finalScore = Math.max(Math.min(baseScore, 100), 0);

    return {
      score: finalScore,
      severity: maxSeverity
    };
  }
}
export const riskEngine = RiskEngine;
