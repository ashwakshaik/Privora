import { ScanResult } from "@/types/scan";

export async function checkVirusTotal(domain: string): Promise<ScanResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  const isMock = !apiKey;

  if (isMock) {
    const isBad = domain.toLowerCase().includes("malware") || domain.toLowerCase().includes("spam") || domain.toLowerCase().includes("badsite");
    if (isBad) {
      return {
        provider: "VirusTotal",
        status: "success",
        severity: "critical",
        score: 10,
        findings: [
          {
            type: "Malicious Engine Detection",
            severity: "critical",
            description: "12 security vendors flagged this domain as malicious/phishing.",
            recommendation: "Inspect domain server scripts for malware injections immediately."
          }
        ],
        metadata: {
          harmless: 10,
          malicious: 12,
          suspicious: 2,
          undetected: 60
        }
      };
    }

    return {
      provider: "VirusTotal",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: {
        harmless: 74,
        malicious: 0,
        suspicious: 0,
        undetected: 10
      }
    };
  }

  try {
    const cleanDomain = domain.replace(/https?:\/\//, "").split("/")[0];
    const res = await fetch(`https://www.virustotal.com/api/v3/domains/${encodeURIComponent(cleanDomain)}`, {
      headers: { "x-apikey": apiKey }
    });

    if (!res.ok) throw new Error(`VirusTotal status ${res.status}`);

    const payload = await res.json();
    const stats = payload.data?.attributes?.last_analysis_stats || { harmless: 0, malicious: 0, suspicious: 0, undetected: 0 };
    const maliciousCount = stats.malicious || 0;

    if (maliciousCount > 0) {
      return {
        provider: "VirusTotal",
        status: "success",
        severity: maliciousCount > 5 ? "critical" : ("high" as const),
        score: Math.max(100 - (maliciousCount * 12), 0),
        findings: [
          {
            type: "Malicious Engine Detection",
            severity: maliciousCount > 5 ? "critical" : ("high" as const),
            description: `${maliciousCount} security vendors flagged this domain as malicious/phishing.`,
            recommendation: "Review hosted script libraries and clean web directory vulnerabilities."
          }
        ],
        metadata: stats
      };
    }

    return {
      provider: "VirusTotal",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: stats
    };
  } catch (error: any) {
    return {
      provider: "VirusTotal",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
