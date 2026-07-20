import { ScanResult } from "@/types/scan";

export async function checkSafeBrowsing(url: string): Promise<ScanResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  const isMock = !apiKey;

  if (isMock) {
    const isThreat = url.toLowerCase().includes("malware") || url.toLowerCase().includes("phish") || url.toLowerCase().includes("badsite");
    if (isThreat) {
      return {
        provider: "Google Safe Browsing",
        status: "success",
        severity: "critical",
        score: 0,
        findings: [
          {
            type: "Malicious Website Flag",
            severity: "critical",
            description: "Google Safe Browsing detected active phishing or social engineering threat on this URL.",
            recommendation: "Avoid visiting this domain. Warn visitors against interacting with web forms."
          }
        ],
        metadata: {
          threatType: "SOCIAL_ENGINEERING",
          platformType: "ANY_PLATFORM"
        }
      };
    }

    return {
      provider: "Google Safe Browsing",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: {
        threatType: "NONE",
        platformType: "NONE"
      }
    };
  }

  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "privora", clientVersion: "1.1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      })
    });

    if (!res.ok) throw new Error(`Safe Browsing status ${res.status}`);

    const data = await res.json();
    const hasMatches = data.matches && data.matches.length > 0;

    if (hasMatches) {
      const match = data.matches[0];
      return {
        provider: "Google Safe Browsing",
        status: "success",
        severity: "critical",
        score: 0,
        findings: [
          {
            type: "Malicious Website Flag",
            severity: "critical",
            description: `Google flagged this URL for ${match.threatType} on ${match.platformType}.`,
            recommendation: "Block this domain and verify server files for unauthorized script modifications."
          }
        ],
        metadata: {
          threatType: match.threatType,
          platformType: match.platformType
        }
      };
    }

    return {
      provider: "Google Safe Browsing",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { threatType: "NONE", platformType: "NONE" }
    };
  } catch (error: any) {
    return {
      provider: "Google Safe Browsing",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
