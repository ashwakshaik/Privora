import { storage } from "@/lib/storage";
import { riskEngine } from "./RiskEngine";
import { improvementEngine } from "./ImprovementEngine";
import { logger } from "@/lib/logger";

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

export class MonitoringScheduler {
  static async runDailySweeps(): Promise<{ processedCount: number; alertsSent: number }> {
    logger.info("[Scheduler] Initializing automated daily monitoring sweeps...");
    const activeTargets = await storage.getAllActiveMonitoringTargets();
    let processedCount = 0;
    let alertsSent = 0;

    for (const target of activeTargets) {
      try {
        let scanResults: ScanResult[] = [];
        logger.info(`[Scheduler] Sweeping target: ${target.target} (${target.type})`);

        if (target.type === "email") {
          const res = await checkEmailBreaches(target.target);
          scanResults.push(res);
        } else if (target.type === "password") {
          const res = await checkPasswordLeak(target.target);
          scanResults.push(res);
        } else if (target.type === "website") {
          const [sb, vt, ssl, pt, op] = await Promise.all([
            checkSafeBrowsing(target.target),
            checkVirusTotal(target.target),
            checkSslLabs(target.target),
            checkPhishTank(target.target),
            checkOpenPhish(target.target)
          ]);
          scanResults.push(sb, vt, ssl, pt, op);
        } else if (target.type === "domain") {
          const [dnsRec, rdap] = await Promise.all([
            checkDnsRecords(target.target),
            checkRdapRegistry(target.target)
          ]);
          scanResults.push(dnsRec, rdap);
        }

        const { score } = riskEngine.calculateUnifiedScore(scanResults);

        // Fetch last historical sweep
        const historyList = await storage.getMonitoringHistory(target.id);
        const lastRun = historyList[0];

        let changesDetected = false;
        let summary = "Initial sweep registered.";

        if (lastRun) {
          // Compare with last run
          // For simplicity we create a dummy previous scan result to compare
          const comparison = improvementEngine.compareScans(
            [], // Sourced from cache or blank for first comparison diff
            scanResults,
            lastRun.risk_score,
            score
          );
          changesDetected = comparison.changesDetected || score !== lastRun.risk_score;
          summary = comparison.summary;
        } else {
          changesDetected = true;
        }

        // Save history logs
        await storage.saveMonitoringHistory(target.id, "success", score, changesDetected, summary);

        // Update target metadata
        const nextScanDate = new Date();
        if (target.frequency === "daily") nextScanDate.setDate(nextScanDate.getDate() + 1);
        else if (target.frequency === "weekly") nextScanDate.setDate(nextScanDate.getDate() + 7);
        else nextScanDate.setMonth(nextScanDate.getMonth() + 1);

        await storage.updateMonitoringTarget(target.id, {
          last_scan: new Date().toISOString(),
          next_scan: nextScanDate.toISOString()
        });

        if (changesDetected) {
          logger.warn(`[Alert Engine] Threat changes verified for target: ${target.target}. Score changed.`);
          alertsSent++;
        }

        processedCount++;
      } catch (err: any) {
        logger.error(`[Scheduler] Sweep failed for target ${target.target}: ${err.message}`);
        await storage.saveMonitoringHistory(target.id, "error", 0, false, err.message);
      }
    }

    logger.info(`[Scheduler] Sweeps complete. Targets checked: ${processedCount}. Alerts generated: ${alertsSent}`);
    return { processedCount, alertsSent };
  }
}
export const monitoringScheduler = MonitoringScheduler;
