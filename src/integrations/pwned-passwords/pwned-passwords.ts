import { ScanResult } from "@/types/scan";

async function sha1(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function checkPasswordLeak(password: string): Promise<ScanResult> {
  try {
    const fullHash = await sha1(password);
    const prefix = fullHash.substring(0, 5);
    const suffix = fullHash.substring(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) throw new Error(`Pwned Passwords error: status ${res.status}`);

    const text = await res.text();
    const lines = text.split("\n");

    let count = 0;
    for (const line of lines) {
      const parts = line.split(":");
      if (parts[0].trim() === suffix) {
        count = parseInt(parts[1], 10) || 0;
        break;
      }
    }

    if (count > 0) {
      return {
        provider: "Pwned Passwords Check",
        status: "success",
        severity: count > 1000 ? "critical" : count > 50 ? "high" : "medium",
        score: Math.max(100 - Math.floor(Math.log10(count) * 15), 0),
        findings: [
          {
            type: "Compromised Password Leak",
            severity: count > 1000 ? "critical" : "high",
            description: `This password was found in public credential dumps ${count.toLocaleString()} times.`,
            recommendation: "Never use this password again. Update any accounts utilizing this value immediately."
          }
        ],
        metadata: {
          leakedCount: count,
          hashPrefix: prefix
        }
      };
    }

    return {
      provider: "Pwned Passwords Check",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: {
        leakedCount: 0,
        hashPrefix: prefix
      }
    };
  } catch (error: any) {
    return {
      provider: "Pwned Passwords Check",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
