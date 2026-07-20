import { storage } from "@/lib/storage";

export class DashboardService {
  static async getOverviewStats(userId: string) {
    const scoreRecord = await storage.getLatestScore(userId);
    const removals = await storage.getRemovalRequests(userId);
    const settings = await storage.getSettings(userId);
    const scans = await storage.getScans(userId);

    const exposed = removals.filter(r => r.current_status === "exposed" || r.current_status === "refused").length;
    const processing = removals.filter(r => r.current_status === "processing" || r.current_status === "pending").length;
    const completed = removals.filter(r => r.current_status === "completed").length;
    
    // Risk breakdown (Active risk counts)
    const highRisk = removals.filter(r => {
      const name = r.broker_name.toLowerCase();
      return (r.current_status !== "completed") && (name.includes("whitepages") || name.includes("spokeo") || name.includes("privateeye"));
    }).length;

    const medRisk = removals.filter(r => {
      const name = r.broker_name.toLowerCase();
      return (r.current_status !== "completed") && (name.includes("radaris") || name.includes("leakcheck") || name.includes("haveibeenpwned"));
    }).length;

    const lowRisk = removals.filter(r => {
      const name = r.broker_name.toLowerCase();
      return (r.current_status !== "completed") && (!name.includes("whitepages") && !name.includes("spokeo") && !name.includes("privateeye") && !name.includes("radaris") && !name.includes("leakcheck") && !name.includes("haveibeenpwned"));
    }).length;

    // Last scan date logic
    let lastScanDate = "Never Scanned";
    if (scans.length > 0) {
      const lastScan = scans[0];
      lastScanDate = lastScan.triggered_at 
        ? new Date(lastScan.triggered_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : "Never Scanned";
    }

    let nextScanDate = "Autopilot Off";
    if (settings.autopilot_enabled) {
      nextScanDate = "Scheduled (Monthly)";
      if (settings.scan_frequency === "weekly") nextScanDate = "Scheduled (Weekly)";
      if (settings.scan_frequency === "quarterly") nextScanDate = "Scheduled (Quarterly)";
    }

    // Success Rate
    const totalRemovals = removals.length;
    const successRate = totalRemovals > 0 
      ? Math.round((completed / totalRemovals) * 100) 
      : 100;

    // Risks Alerts list
    const risks = removals
      .filter(r => r.current_status === "exposed" || r.current_status === "refused" || r.current_status === "processing")
      .slice(0, 3)
      .map(r => {
        const name = r.broker_name.toLowerCase();
        let severity = "Low";
        let type = "Public Profile Record";
        if (name.includes("whitepages") || name.includes("spokeo") || name.includes("privateeye")) {
          severity = "High";
          type = name.includes("whitepages") ? "Home Address" : "Phone Number";
        } else if (name.includes("radaris") || name.includes("leakcheck") || name.includes("haveibeenpwned")) {
          severity = "Medium";
          type = "Contact Email Leak";
        }
        return {
          source: r.broker_name,
          type,
          detail: r.tracking_log[r.tracking_log.length - 1] || "Exposed profile record.",
          severity
        };
      });

    // Timeline Events
    const events = removals.map(r => {
      const lastLog = r.tracking_log[r.tracking_log.length - 1];
      return {
        text: `${r.broker_name}: ${lastLog || "Status updated."}`,
        time: r.resolved_date ? `Resolved on ${r.resolved_date}` : `Updated recently`,
        status: r.current_status === "completed" ? "success" : r.current_status === "processing" || r.current_status === "pending" ? "processing" : "alert"
      };
    }).slice(0, 4);

    return {
      overallScore: scoreRecord.overall_score,
      exposed,
      processing,
      completed,
      highRisk,
      medRisk,
      lowRisk,
      lastScanDate,
      nextScanDate,
      successRate,
      risks: risks.length > 0 ? risks : [{ source: "No Risks Found", type: "Clean Boundary", detail: "Active scanning shows zero exposed registries.", severity: "Low" }],
      events
    };
  }

  static async getPrivacyScore(userId: string) {
    const scoreRecord = await storage.getLatestScore(userId);
    const score = scoreRecord.overall_score;
    let risk: "Low" | "Medium" | "High" | "Critical" = "Low";
    if (score < 50) risk = "Critical";
    else if (score < 70) risk = "High";
    else if (score < 90) risk = "Medium";
    
    return { score, risk };
  }

  static async getRecentAlerts(userId: string) {
    const removals = await storage.getRemovalRequests(userId);
    const exposed = removals.filter(r => r.current_status === "exposed" || r.current_status === "refused");
    return exposed.map(r => ({
      id: r.id,
      title: `${r.broker_name} Exposure`,
      description: r.tracking_log[r.tracking_log.length - 1] || "Exposed personal registry.",
      severity: (r.broker_name.toLowerCase().includes("whitepages") || r.broker_name.toLowerCase().includes("spokeo")) ? "high" : "medium",
      time: new Date(r.created_at).toLocaleDateString()
    })).slice(0, 5);
  }

  static async getTimeline(userId: string) {
    const history = await storage.getScoreHistory(userId);
    return history.map(h => ({
      date: new Date(h.calculated_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      score: h.overall_score
    }));
  }

  static async getMonitoring(userId: string) {
    const targets = await storage.getMonitoringTargets(userId);
    return targets.map(t => ({
      id: t.id,
      type: t.type,
      target: t.target,
      status: t.enabled ? "Running" : "Paused",
      frequency: t.frequency
    }));
  }

  static async getRecommendations(userId: string) {
    const scans = await storage.getScans(userId);
    if (scans.length === 0) {
      return [
        { type: "Configuration Check", description: "Enable Autopilot daily continuous privacy scan monitoring.", priority: "high" },
        { type: "Secret Scan", description: "Configure SPF policies on active domain zones.", priority: "medium" }
      ];
    }
    const latestResults = await storage.getScanResults(scans[0].id);
    if (latestResults.length === 0) {
      return [
        { type: "Safe Browsing Check", description: "No security issues. Setup a monthly report schedule.", priority: "low" }
      ];
    }
    return latestResults.map(r => ({
      type: r.broker_name,
      description: `Fix recommendation: ${r.record_preview}`,
      priority: r.severity === "high" ? "high" : r.severity === "medium" ? "medium" : "low"
    })).slice(0, 3);
  }
}
