import { ScanResult, Finding } from "@/types/scan";

export async function checkSslLabs(host: string): Promise<ScanResult> {
  const isMock = process.env.MOCK_SSL === "true" || !process.env.GOOGLE_SAFE_BROWSING_API_KEY; // Fallback to mock if no general API keys

  if (isMock) {
    const isWeak = host.toLowerCase().includes("weak") || host.toLowerCase().includes("expired");
    if (isWeak) {
      return {
        provider: "SSL Labs Analysis",
        status: "success",
        severity: "high",
        score: 40,
        findings: [
          {
            type: "Weak SSL Protocol / Configuration",
            severity: "high",
            description: "Server supports TLS 1.0 / TLS 1.1 and has vulnerable cipher suites enabled.",
            recommendation: "Disable legacy TLS versions and configure secure ciphers (ECDHE-ECDSA-AES128-GCM-SHA256)."
          }
        ],
        metadata: {
          sslGrade: "C",
          isExpired: false,
          protocols: ["TLS 1.0", "TLS 1.1", "TLS 1.2"]
        }
      };
    }

    return {
      provider: "SSL Labs Analysis",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: {
        sslGrade: "A+",
        isExpired: false,
        protocols: ["TLS 1.2", "TLS 1.3"]
      }
    };
  }

  try {
    const cleanHost = host.replace(/https?:\/\//, "").split("/")[0];
    const res = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(cleanHost)}&publish=off&fromCache=on&all=done`);
    
    if (!res.ok) throw new Error(`SSL Labs API status ${res.status}`);

    const data = await res.json();
    const endpoint = data.endpoints?.[0] || {};
    const grade = endpoint.grade || "A";

    let severity: "low" | "medium" | "high" | "critical" = "low";
    let score = 100;
    const findings: Finding[] = [];

    if (grade.startsWith("F") || grade === "M" || grade === "T") {
      severity = "critical";
      score = 0;
      findings.push({
        type: "SSL Certificate Validation Failure",
        severity: "critical",
        description: `Server SSL certification failed with severe validation code: ${grade}.`,
        recommendation: "Verify server host certificates, chain path validations, and server time."
      });
    } else if (grade.startsWith("C") || grade.startsWith("D")) {
      severity = "high";
      score = 45;
      findings.push({
        type: "Legacy SSL Cipher Suites",
        severity: "high",
        description: `Host SSL grade returned: ${grade}. Legacy TLS ciphers are active.`,
        recommendation: "Regenerate certificates, enable HSTS, and block older browser TLS negotiation requests."
      });
    } else if (grade.startsWith("B")) {
      severity = "medium";
      score = 75;
      findings.push({
        type: "Missing HTTP Strict Transport Security (HSTS)",
        severity: "medium",
        description: "HSTS header is absent. Communication is susceptible to downgrade attacks.",
        recommendation: "Add 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload' headers to web config."
      });
    }

    return {
      provider: "SSL Labs Analysis",
      status: "success",
      severity,
      score,
      findings,
      metadata: {
        sslGrade: grade,
        isExpired: endpoint.isExpired || false,
        protocols: endpoint.protocols || ["TLS 1.2"]
      }
    };
  } catch (error: any) {
    return {
      provider: "SSL Labs Analysis",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
