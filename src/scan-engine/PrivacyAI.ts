import { ScanResult } from "@/types/scan";

export interface AISecurityBrief {
  summary: string;
  recommendations: string[];
}

export class PrivacyAI {
  static async generateSecurityBrief(results: ScanResult[]): Promise<AISecurityBrief> {
    const activeFindings = results.flatMap((r) => r.findings);
    
    if (activeFindings.length === 0) {
      return {
        summary: "Your privacy perimeter is fully secure. Active scans resolved zero threat indicators.",
        recommendations: [
          "Enable continuous monthly monitoring checks to identify future credential leaks early.",
          "Ensure unique, complex passwords are set on vital financial and admin accounts."
        ]
      };
    }

    const criticalCount = activeFindings.filter((f) => f.severity === "critical").length;
    const highCount = activeFindings.filter((f) => f.severity === "high").length;
    
    let summary = `Your privacy footprint has identified ${activeFindings.length} active vulnerabilities. `;
    if (criticalCount > 0) {
      summary += `This includes ${criticalCount} critical level threats that require immediate security response.`;
    } else if (highCount > 0) {
      summary += `This includes ${highCount} high level threat indicators regarding configuration or credentials exposures.`;
    } else {
      summary += "All detected indicators are rated medium or low severity, representing minor configuration gaps.";
    }

    const recommendations = activeFindings.map((f) => f.recommendation);
    // Remove duplicate recommendation advice
    const uniqueRecommendations = Array.from(new Set(recommendations)).slice(0, 4);

    return {
      summary,
      recommendations: uniqueRecommendations
    };
  }
}
export const privacyAI = PrivacyAI;
