import { ScanResult } from "@/types/scan";

export async function checkRdapRegistry(domain: string): Promise<ScanResult> {
  const cleanDomain = domain.replace(/https?:\/\//, "").split("/")[0].split(":")[0];
  const isMock = process.env.MOCK_RDAP === "true" || !process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (isMock) {
    const isSuspicious = cleanDomain.includes("leak") || cleanDomain.includes("phish") || cleanDomain.length > 25;
    if (isSuspicious) {
      return {
        provider: "WHOIS / RDAP Registry",
        status: "success",
        severity: "medium",
        score: 65,
        findings: [
          {
            type: "Recent Domain Creation",
            severity: "medium",
            description: "Domain was registered within the last 14 days. Often a vector for temporary phishing hosts.",
            recommendation: "Monitor activities closely. Check SSL and transaction endpoints."
          }
        ],
        metadata: {
          registrar: "NameCheap Inc.",
          createdDate: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
          expiryDate: new Date(Date.now() + 362 * 24 * 3600000).toISOString(),
          country: "IS"
        }
      };
    }

    return {
      provider: "WHOIS / RDAP Registry",
      status: "success",
      severity: "low",
      score: 100,
      findings: [],
      metadata: {
        registrar: "GoDaddy.com LLC",
        createdDate: "2018-05-12T10:00:00Z",
        expiryDate: "2028-05-12T10:00:00Z",
        country: "US"
      }
    };
  }

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`);
    
    if (res.status === 404) {
      return {
        provider: "WHOIS / RDAP Registry",
        status: "success",
        severity: "high",
        score: 40,
        findings: [
          {
            type: "Unregistered Domain Record",
            severity: "high",
            description: "RDAP registry shows this domain does not exist or has expired.",
            recommendation: "Purchase the domain if you own this target to prevent spoofing."
          }
        ],
        metadata: { status: "not_found" }
      };
    }

    if (!res.ok) throw new Error(`RDAP bootstrap error: status ${res.status}`);

    const data = await res.json();
    
    // Parse RDAP creation/expiry events
    const events = data.events || [];
    const createdEvent = events.find((e: any) => e.eventAction === "registration");
    const expiryEvent = events.find((e: any) => e.eventAction === "expiration");
    const createdDate = createdEvent ? createdEvent.eventDate : null;
    const expiryDate = expiryEvent ? expiryEvent.eventDate : null;

    // Parse registrar
    const entities = data.entities || [];
    const registrarEntity = entities.find((ent: any) => ent.roles?.includes("registrar"));
    const registrar = registrarEntity ? registrarEntity.vcardArray?.[1]?.find((vc: any) => vc[0] === "fn")?.[3] : "Unknown";

    const findings = [];
    let score = 100;
    let severity: "low" | "medium" | "high" | "critical" = "low";

    if (createdDate) {
      const ageMs = Date.now() - new Date(createdDate).getTime();
      const ageDays = ageMs / (24 * 3600000);
      if (ageDays < 30) {
        severity = "medium";
        score = 70;
        findings.push({
          type: "Newly Registered Host",
          severity: "medium" as const,
          description: `This domain was registered ${Math.floor(ageDays)} days ago. High risk of temporary host abuse.`,
          recommendation: "Implement rigid verification checks for external API triggers from this domain."
        });
      }
    }

    return {
      provider: "WHOIS / RDAP Registry",
      status: "success",
      severity,
      score,
      findings,
      metadata: {
        registrar,
        createdDate,
        expiryDate,
        country: data.port43 || "Unknown"
      }
    };
  } catch (error: any) {
    return {
      provider: "WHOIS / RDAP Registry",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
