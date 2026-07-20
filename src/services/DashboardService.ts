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
}
