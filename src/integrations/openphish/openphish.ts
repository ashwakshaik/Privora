import { ScanResult } from "@/types/scan";

export async function checkOpenPhish(url: string): Promise<ScanResult> {
  const isMock = process.env.MOCK_OPENPHISH === "true" || !process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (isMock) {
    const isPhish = url.toLowerCase().includes("phish") || url.toLowerCase().includes("paypal-secure");
    if (isPhish) {
      return {
        provider: "OpenPhish Intelligence",
        status: "success",
        severity: "critical",
        score: 0,
        findings: [
          {
            type: "OpenPhish Threat Record",
            severity: "critical",
            description: "OpenPhish feed matches show this URL is an active credential harvesting portal.",
            recommendation: "Blacklist the destination address in system DNS servers immediately."
          }
        ],
        metadata: { phishingDetected: true }
      };
    }

    return {
      provider: "OpenPhish Intelligence",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { phishingDetected: false }
    };
  }

  try {
    // OpenPhish provides a free flat text file listing active phishing URLs
    const res = await fetch("https://openphish.com/feed.txt");
    if (!res.ok) throw new Error(`OpenPhish feed status ${res.status}`);

    const text = await res.text();
    const urlsList = text.split("\n");
    const isMatch = urlsList.some((line) => line.trim() === url.trim());

    if (isMatch) {
      return {
        provider: "OpenPhish Intelligence",
        status: "success",
        severity: "critical",
        score: 0,
        findings: [
          {
            type: "OpenPhish Threat Record",
            severity: "critical",
            description: "OpenPhish intelligence matching identifies this URL as a known phishing page.",
            recommendation: "Block server egress routes to this host and notify local security operations."
          }
        ],
        metadata: { phishingDetected: true }
      };
    }

    return {
      provider: "OpenPhish Intelligence",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { phishingDetected: false }
    };
  } catch (error: any) {
    return {
      provider: "OpenPhish Intelligence",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
