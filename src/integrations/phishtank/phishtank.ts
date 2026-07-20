import { ScanResult } from "@/types/scan";

export async function checkPhishTank(url: string): Promise<ScanResult> {
  const isMock = process.env.MOCK_PHISHTANK === "true" || !process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (isMock) {
    const isPhish = url.toLowerCase().includes("phish") || url.toLowerCase().includes("verify-bank");
    if (isPhish) {
      return {
        provider: "PhishTank Directory",
        status: "success",
        severity: "critical",
        score: 0,
        findings: [
          {
            type: "Verified Phishing Target",
            severity: "critical",
            description: "PhishTank has verified this URL as a known active phishing campaign location.",
            recommendation: "Avoid submitting any sensitive credentials to forms on this page."
          }
        ],
        metadata: {
          phishingDetected: true,
          verifiedTime: new Date().toISOString()
        }
      };
    }

    return {
      provider: "PhishTank Directory",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { phishingDetected: false }
    };
  }

  try {
    const body = new URLSearchParams();
    body.append("url", url);
    body.append("format", "json");

    const res = await fetch("https://checkurl.phishtank.com/checkurl/", {
      method: "POST",
      headers: { "User-Agent": "phishtank/privora" },
      body
    });

    if (!res.ok) throw new Error(`PhishTank API status ${res.status}`);

    const data = await res.json();
    const results = data.results || {};
    const inDatabase = results.in_database || false;
    const isPhish = results.valid || false;

    if (inDatabase && isPhish) {
      return {
        provider: "PhishTank Directory",
        status: "success",
        severity: "critical",
        score: 0,
        findings: [
          {
            type: "Verified Phishing Target",
            severity: "critical",
            description: `PhishTank verified threat listed URL (Threat ID: ${results.phish_id}).`,
            recommendation: "Terminate all connection routes and flag domain in local network firewalls."
          }
        ],
        metadata: {
          phishingDetected: true,
          phishId: results.phish_id,
          verifiedTime: results.verified_at
        }
      };
    }

    return {
      provider: "PhishTank Directory",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { phishingDetected: false }
    };
  } catch (error: any) {
    return {
      provider: "PhishTank Directory",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
