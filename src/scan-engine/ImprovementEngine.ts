import { ScanResult } from "@/types/scan";

export interface ScanComparisonResult {
  changesDetected: boolean;
  scoreDifference: number;
  improvements: string[];
  remainingThreats: string[];
  newThreats: string[];
  summary: string;
}

export class ImprovementEngine {
  static compareScans(
    previousResults: ScanResult[],
    currentResults: ScanResult[],
    prevScore: number,
    currentScore: number
  ): ScanComparisonResult {
    const prevFindings = previousResults.flatMap((r) => r.findings);
    const currFindings = currentResults.flatMap((r) => r.findings);

    const prevTypes = new Set(prevFindings.map((f) => f.type));
    const currTypes = new Set(currFindings.map((f) => f.type));

    const improvements: string[] = [];
    const newThreats: string[] = [];
    const remainingThreats: string[] = [];

    // Find resolved items (present in previous, gone in current)
    prevFindings.forEach((f) => {
      if (!currTypes.has(f.type) && !improvements.includes(`Resolved: ${f.type}`)) {
        improvements.push(`Resolved: ${f.type}`);
      }
    });

    // Find new items (not in previous, present in current)
    currFindings.forEach((f) => {
      if (!prevTypes.has(f.type)) {
        if (!newThreats.includes(`New vulnerability: ${f.type}`)) {
          newThreats.push(`New vulnerability: ${f.type}`);
        }
      } else {
        if (!remainingThreats.includes(`Remaining: ${f.type}`)) {
          remainingThreats.push(`Remaining: ${f.type}`);
        }
      }
    });

    const scoreDiff = currentScore - prevScore;
    const changesDetected = improvements.length > 0 || newThreats.length > 0;

    let summary = `Privacy Index Score changed from ${prevScore}% to ${currentScore}% (Delta: ${scoreDiff >= 0 ? "+" : ""}${scoreDiff}%). `;
    if (improvements.length > 0) {
      summary += `Resolved ${improvements.length} threat indicators. `;
    }
    if (newThreats.length > 0) {
      summary += `Identified ${newThreats.length} new exposures.`;
    }
    if (improvements.length === 0 && newThreats.length === 0) {
      summary += "No new changes resolved across threat scanning indices.";
    }

    return {
      changesDetected,
      scoreDifference: scoreDiff,
      improvements,
      remainingThreats,
      newThreats,
      summary
    };
  }
}
export const improvementEngine = ImprovementEngine;
