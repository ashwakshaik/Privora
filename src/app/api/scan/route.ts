import { NextResponse } from "next/server";
import { cacheManager } from "@/scan-engine/CacheManager";
import { riskEngine } from "@/scan-engine/RiskEngine";
import { privacyAI } from "@/scan-engine/PrivacyAI";
import { scanQueue } from "@/scan-engine/ScanQueue";
import { storage } from "@/lib/storage";

// Integrations
import { checkEmailBreaches } from "@/integrations/hibp/hibp";
import { checkPasswordLeak } from "@/integrations/pwned-passwords/pwned-passwords";
import { checkSafeBrowsing } from "@/integrations/google-safe-browsing/safebrowsing";
import { checkVirusTotal } from "@/integrations/virustotal/virustotal";
import { checkSslLabs } from "@/integrations/ssl-labs/ssl-labs";
import { checkDnsRecords } from "@/integrations/dns/dns";
import { checkRdapRegistry } from "@/integrations/rdap/rdap";
import { checkPhishTank } from "@/integrations/phishtank/phishtank";
import { checkOpenPhish } from "@/integrations/openphish/openphish";

import { ScanResult } from "@/types/scan";

export async function POST(req: Request) {
  try {
    const { type, target, userId } = await req.json();

    if (!type || !target || !userId) {
      return NextResponse.json({ error: "Missing required parameters type, target, or userId" }, { status: 400 });
    }

    const cacheKey = `${type}:${target}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      const { score, severity } = riskEngine.calculateUnifiedScore(cached);
      const aiBrief = await privacyAI.generateSecurityBrief(cached);
      return NextResponse.json({
        status: "success",
        score,
        severity,
        results: cached,
        aiBrief
      });
    }

    let scanResults: ScanResult[] = [];

    // Trigger sequential scan methods based on type
    if (type === "email") {
      const res = await checkEmailBreaches(target);
      scanResults.push(res);
    } else if (type === "password") {
      const res = await checkPasswordLeak(target);
      scanResults.push(res);
    } else if (type === "website") {
      // Execute security checks concurrently
      const [sb, vt, ssl, pt, op] = await Promise.all([
        checkSafeBrowsing(target),
        checkVirusTotal(target),
        checkSslLabs(target),
        checkPhishTank(target),
        checkOpenPhish(target)
      ]);
      scanResults.push(sb, vt, ssl, pt, op);
    } else if (type === "domain") {
      const [dnsRec, rdap] = await Promise.all([
        checkDnsRecords(target),
        checkRdapRegistry(target)
      ]);
      scanResults.push(dnsRec, rdap);
    } else {
      return NextResponse.json({ error: "Invalid scan query type" }, { status: 400 });
    }

    // Process Risk calculations & AI briefing
    const { score, severity } = riskEngine.calculateUnifiedScore(scanResults);
    const aiBrief = await privacyAI.generateSecurityBrief(scanResults);

    // Cache the resolved result
    cacheManager.set(cacheKey, scanResults);

    // Save Transactions in Background Queue to prevent edge function execution limits
    scanQueue.addTask(async () => {
      try {
        const criteriaHash = `hash_${type}_${Math.random().toString(36).substring(2, 6)}`;
        const scanObj = await storage.createScan(userId, "manual", criteriaHash);
        
        // Save findings
        for (const s of scanResults) {
          for (const finding of s.findings) {
            const mappedSeverity = finding.severity === "critical" ? ("high" as const) : finding.severity;
            await storage.saveScanResult(scanObj.id, s.provider, finding.description, mappedSeverity);
          }
        }
        
        // Save score record
        await storage.savePrivacyScore(userId, score, scanResults.flatMap(s => s.findings).length, 0, 0);
      } catch (err: any) {
        console.error("Failed to commit scan results to DB:", err.message);
      }
    });

    return NextResponse.json({
      status: "success",
      score,
      severity,
      results: scanResults,
      aiBrief
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
