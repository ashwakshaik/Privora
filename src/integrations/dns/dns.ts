import dns from "dns";
import { ScanResult } from "@/types/scan";

export async function checkDnsRecords(domain: string): Promise<ScanResult> {
  const cleanDomain = domain.replace(/https?:\/\//, "").split("/")[0].split(":")[0];

  try {
    const findings = [];
    let score = 100;
    let severity: "low" | "medium" | "high" | "critical" = "low";

    // 1. Resolve MX Records
    let mxRecords: any[] = [];
    try {
      mxRecords = await dns.promises.resolveMx(cleanDomain);
    } catch {
      findings.push({
        type: "Missing Mail Exchange (MX) Configuration",
        severity: "medium" as const,
        description: "No MX records resolved. Domain cannot receive emails.",
        recommendation: "Point MX records to your inbound mail provider (e.g. Google Workspace, Outlook)."
      });
      score -= 15;
      severity = "medium";
    }

    // 2. Resolve TXT Records for SPF & DMARC
    let txtRecords: string[][] = [];
    let spfFound = false;
    let dmarcFound = false;

    try {
      txtRecords = await dns.promises.resolveTxt(cleanDomain);
      const flatTxt = txtRecords.flat();
      spfFound = flatTxt.some((r) => r.toLowerCase().startsWith("v=spf1"));
    } catch {
      // Ignore resolution failures
    }

    // Resolve DMARC via TXT lookup on _dmarc.domain
    try {
      const dmarcTxt = await dns.promises.resolveTxt(`_dmarc.${cleanDomain}`);
      dmarcFound = dmarcTxt.flat().some((r) => r.toLowerCase().startsWith("v=dmarc1"));
    } catch {
      // Ignore resolution failures
    }

    if (!spfFound) {
      findings.push({
        type: "Missing SPF Policy",
        severity: "high" as const,
        description: "Sender Policy Framework (SPF) is missing. Bad actors can spoof emails from this domain.",
        recommendation: "Publish a TXT record with SPF configuration (e.g. 'v=spf1 include:_spf.google.com ~all')."
      });
      score -= 25;
      severity = "high";
    }

    if (!dmarcFound) {
      findings.push({
        type: "Missing DMARC Policy",
        severity: "high" as const,
        description: "DMARC record is missing. Email providers cannot authenticate messages securely.",
        recommendation: "Create a TXT record at '_dmarc' subdomain specifying alignment actions (e.g. 'v=DMARC1; p=quarantine;')."
      });
      score -= 20;
      severity = "high";
    }

    // 3. Resolve A Records
    let aRecords: string[] = [];
    try {
      aRecords = await dns.promises.resolve4(cleanDomain);
    } catch {
      findings.push({
        type: "Missing Address (A) Resolution",
        severity: "high" as const,
        description: "Domain cannot resolve to IPv4 hosts.",
        recommendation: "Add an A record pointing to target destination web server IPs."
      });
      score -= 30;
      severity = "high";
    }

    return {
      provider: "DNS Configuration Audit",
      status: "success",
      severity,
      score: Math.max(score, 0),
      findings,
      metadata: {
        domain: cleanDomain,
        mxRecordsCount: mxRecords.length,
        aRecords,
        spfConfigured: spfFound,
        dmarcConfigured: dmarcFound
      }
    };
  } catch (error: any) {
    return {
      provider: "DNS Configuration Audit",
      status: "error",
      severity: "low",
      score: 100,
      findings: [],
      metadata: { error: error.message }
    };
  }
}
