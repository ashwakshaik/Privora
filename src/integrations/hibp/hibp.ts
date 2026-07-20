import { ScanResult } from "@/types/scan";

export async function checkEmailBreaches(email: string): Promise<ScanResult> {
  const apiKey = process.env.HIBP_API_KEY;
  const isMock = !apiKey;

  if (isMock) {
    const testCompromised = ["test@gmail.com", "ashwak@gmail.com", "compromised@gmail.com"];
    const lowercaseEmail = email.toLowerCase();
    const isLeaked = testCompromised.includes(lowercaseEmail) || lowercaseEmail.startsWith("leak");

    if (isLeaked) {
      return {
        provider: "Have I Been Pwned",
        status: "success",
        severity: "high",
        score: 35,
        findings: [
          {
            type: "Email Credential Breach",
            severity: "high",
            description: "Email found in LinkedIn database compromise. Exposed data: passwords, work history.",
            recommendation: "Change your password immediately on LinkedIn and any other site where you reused it."
          },
          {
            type: "Email Credential Breach",
            severity: "medium",
            description: "Email found in Canva compromise. Exposed data: names, email addresses.",
            recommendation: "Ensure multi-factor authentication is active on Canva."
          }
        ],
        metadata: {
          totalBreaches: 2,
          breachedSources: ["LinkedIn", "Canva"]
        }
      };
    }

    return {
      provider: "Have I Been Pwned",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: {
        totalBreaches: 0,
        breachedSources: []
      }
    };
  }

  try {
    const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
      headers: {
        "hibp-api-key": apiKey
      }
    });

    if (res.status === 404) {
      return {
        provider: "Have I Been Pwned",
        status: "success",
        severity: "low",
        score: 100,
        findings: [],
        metadata: { totalBreaches: 0, breachedSources: [] }
      };
    }

    if (!res.ok) throw new Error(`HIBP query error: status ${res.status}`);

    const breaches = await res.json();
    const findings = breaches.map((b: any) => ({
      type: "Email Credential Breach",
      severity: b.IsSensitive ? ("critical" as const) : ("high" as const),
      description: `Email found in ${b.Title} breach (${b.BreachDate}). Exposed data: ${b.DataClasses.join(", ")}.`,
      recommendation: "Update the password on this service and terminate all current active sessions."
    }));

    return {
      provider: "Have I Been Pwned",
      status: "success",
      severity: findings.length > 2 ? "critical" : findings.length > 0 ? "high" : "low",
      score: Math.max(100 - (findings.length * 20), 0),
      findings,
      metadata: {
        totalBreaches: findings.length,
        breachedSources: breaches.map((b: any) => b.Name)
      }
    };
  } catch (error: any) {
    return {
      provider: "Have I Been Pwned",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
