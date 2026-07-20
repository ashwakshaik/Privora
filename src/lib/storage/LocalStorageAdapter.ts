import { StorageAdapter } from "./StorageAdapter";
import {
  DBUser,
  DBSettings,
  DBPrivacyScore,
  DBScan,
  DBScanResult,
  DBRemovalRequest,
  DBReport,
  DBFeedback,
  DBMonitoringTarget,
  DBMonitoringHistory,
  DBScanFeedback
} from "./types";

// Helper to initialize local storage mock DB tables
const initMockDB = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("privora_mock_users")) localStorage.setItem("privora_mock_users", "[]");
  if (!localStorage.getItem("privora_mock_settings")) localStorage.setItem("privora_mock_settings", "{}");
  if (!localStorage.getItem("privora_mock_scans")) localStorage.setItem("privora_mock_scans", "[]");
  if (!localStorage.getItem("privora_mock_scan_results")) localStorage.setItem("privora_mock_scan_results", "[]");
  if (!localStorage.getItem("privora_mock_removal_requests")) localStorage.setItem("privora_mock_removal_requests", "[]");
  if (!localStorage.getItem("privora_mock_reports")) localStorage.setItem("privora_mock_reports", "[]");
  if (!localStorage.getItem("privora_mock_privacy_scores")) localStorage.setItem("privora_mock_privacy_scores", "[]");
  if (!localStorage.getItem("privora_mock_monitoring_targets")) localStorage.setItem("privora_mock_monitoring_targets", "[]");
  if (!localStorage.getItem("privora_mock_monitoring_history")) localStorage.setItem("privora_mock_monitoring_history", "[]");
  if (!localStorage.getItem("privora_mock_scan_feedback")) localStorage.setItem("privora_mock_scan_feedback", "[]");
};

export class LocalStorageAdapter implements StorageAdapter {
  constructor() {
    if (typeof window !== "undefined") {
      initMockDB();
    }
  }

  async syncUser(userId: string, email: string, firstName?: string, lastName?: string): Promise<DBUser> {
    initMockDB();
    const users = JSON.parse(localStorage.getItem("privora_mock_users") || "[]");
    let matched = users.find((u: { id: string }) => u.id === userId);
    if (!matched) {
      matched = {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName || "User"}%20${lastName || ""}`,
        created_at: new Date().toISOString()
      };
      users.push(matched);
      localStorage.setItem("privora_mock_users", JSON.stringify(users));

      // Create default settings
      await this.saveSettings(userId, {
        user_id: userId,
        scan_email: email,
        home_address: "",
        phone_number: "",
        autopilot_enabled: false,
        updated_at: new Date().toISOString()
      });
    }
    return matched;
  }

  async getSettings(userId: string): Promise<DBSettings> {
    initMockDB();
    const settingsMap = JSON.parse(localStorage.getItem("privora_mock_settings") || "{}");
    if (!settingsMap[userId]) {
      settingsMap[userId] = {
        user_id: userId,
        scan_email: "",
        home_address: "",
        phone_number: "",
        autopilot_enabled: false,
        scan_frequency: "monthly",
        email_alerts_enabled: true,
        report_delivery_enabled: true,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem("privora_mock_settings", JSON.stringify(settingsMap));
    }
    return settingsMap[userId];
  }

  async saveSettings(userId: string, data: Partial<DBSettings>): Promise<DBSettings> {
    initMockDB();
    const settingsMap = JSON.parse(localStorage.getItem("privora_mock_settings") || "{}");
    const current = settingsMap[userId] || { user_id: userId };
    settingsMap[userId] = {
      ...current,
      ...data,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem("privora_mock_settings", JSON.stringify(settingsMap));
    return settingsMap[userId];
  }

  async getLatestScore(userId: string): Promise<DBPrivacyScore> {
    initMockDB();
    const scores = JSON.parse(localStorage.getItem("privora_mock_privacy_scores") || "[]");
    const userScores = scores
      .filter((s: DBPrivacyScore) => s.user_id === userId)
      .sort((a: DBPrivacyScore, b: DBPrivacyScore) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime());

    if (userScores.length > 0) return userScores[0];
    return {
      id: "baseline",
      user_id: userId,
      overall_score: 100,
      exposed_records_count: 0,
      pending_removals_count: 0,
      completed_removals_count: 0,
      calculated_at: new Date().toISOString()
    };
  }

  async getScoreHistory(userId: string): Promise<DBPrivacyScore[]> {
    initMockDB();
    const scores = JSON.parse(localStorage.getItem("privora_mock_privacy_scores") || "[]");
    return scores
      .filter((s: DBPrivacyScore) => s.user_id === userId)
      .sort((a: DBPrivacyScore, b: DBPrivacyScore) => new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime());
  }

  async savePrivacyScore(
    userId: string,
    score: number,
    exposed: number,
    pending: number,
    completed: number
  ): Promise<DBPrivacyScore> {
    initMockDB();
    const scores = JSON.parse(localStorage.getItem("privora_mock_privacy_scores") || "[]");
    const newScore: DBPrivacyScore = {
      id: `scr_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      overall_score: score,
      exposed_records_count: exposed,
      pending_removals_count: pending,
      completed_removals_count: completed,
      calculated_at: new Date().toISOString()
    };
    scores.push(newScore);
    localStorage.setItem("privora_mock_privacy_scores", JSON.stringify(scores));
    return newScore;
  }

  async getScans(userId: string): Promise<DBScan[]> {
    initMockDB();
    const scans = JSON.parse(localStorage.getItem("privora_mock_scans") || "[]");
    const userScans = scans.filter((s: DBScan) => s.user_id === userId);

    if (userScans.length === 0) {
      const baselineScans: DBScan[] = [
        {
          id: "scan_1",
          user_id: userId,
          scan_type: "manual",
          search_criteria_hash: "hash_july",
          status: "completed",
          triggered_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          completed_at: new Date(Date.now() - 3600000 * 24 + 5000).toISOString()
        },
        {
          id: "scan_2",
          user_id: userId,
          scan_type: "automated",
          search_criteria_hash: "hash_june",
          status: "completed",
          triggered_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
          completed_at: new Date(Date.now() - 3600000 * 24 * 30 + 5000).toISOString()
        }
      ];

      const updatedScans = [...scans, ...baselineScans];
      localStorage.setItem("privora_mock_scans", JSON.stringify(updatedScans));

      // Seed matching scan results so getScanResults will return data
      const results = JSON.parse(localStorage.getItem("privora_mock_scan_results") || "[]");
      const baselineResults: DBScanResult[] = [
        { id: "sr_1", scan_id: "scan_1", broker_name: "Whitepages.com", record_preview: "123** Main St, Los Angeles, CA 900**", severity: "high", match_status: "exposed", found_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: "sr_2", scan_id: "scan_1", broker_name: "Spokeo.com", record_preview: "(555) ***-4829", severity: "high", match_status: "exposed", found_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: "sr_3", scan_id: "scan_1", broker_name: "Radaris.com", record_preview: "ashwak***@gmail.com", severity: "medium", match_status: "exposed", found_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: "sr_4", scan_id: "scan_2", broker_name: "BeenVerified.com", record_preview: "Relative: Ashwak S, Age 2*", severity: "medium", match_status: "exposed", found_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString() }
      ];
      localStorage.setItem("privora_mock_scan_results", JSON.stringify([...results, ...baselineResults]));

      return baselineScans;
    }

    return userScans.sort((a: DBScan, b: DBScan) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime());
  }

  async createScan(userId: string, scanType: "manual" | "automated", searchCriteriaHash: string): Promise<DBScan> {
    initMockDB();
    const scans = JSON.parse(localStorage.getItem("privora_mock_scans") || "[]");
    const newScan: DBScan = {
      id: `scn_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      scan_type: scanType,
      search_criteria_hash: searchCriteriaHash,
      status: "scanning",
      triggered_at: new Date().toISOString()
    };
    scans.push(newScan);
    localStorage.setItem("privora_mock_scans", JSON.stringify(scans));
    return newScan;
  }

  async updateScanStatus(scanId: string, status: DBScan["status"]): Promise<DBScan> {
    initMockDB();
    const scans = JSON.parse(localStorage.getItem("privora_mock_scans") || "[]");
    const matched = scans.find((s: DBScan) => s.id === scanId);
    if (matched) {
      matched.status = status;
      if (status === "completed") {
        matched.completed_at = new Date().toISOString();
      }
      localStorage.setItem("privora_mock_scans", JSON.stringify(scans));
    }
    return matched;
  }

  async getScanResults(scanId: string): Promise<DBScanResult[]> {
    initMockDB();
    const results = JSON.parse(localStorage.getItem("privora_mock_scan_results") || "[]");
    return results.filter((r: DBScanResult) => r.scan_id === scanId);
  }

  async saveScanResult(scanId: string, brokerName: string, recordPreview: string, severity: DBScanResult["severity"]): Promise<DBScanResult> {
    initMockDB();
    const results = JSON.parse(localStorage.getItem("privora_mock_scan_results") || "[]");
    const newResult: DBScanResult = {
      id: `res_${Math.random().toString(36).substring(2, 11)}`,
      scan_id: scanId,
      broker_name: brokerName,
      record_preview: recordPreview,
      severity,
      match_status: "exposed",
      found_at: new Date().toISOString()
    };
    results.push(newResult);
    localStorage.setItem("privora_mock_scan_results", JSON.stringify(results));
    return newResult;
  }

  async getRemovalRequests(userId: string): Promise<DBRemovalRequest[]> {
    initMockDB();
    const requests = JSON.parse(localStorage.getItem("privora_mock_removal_requests") || "[]");

    const userRequests = requests.filter((r: DBRemovalRequest) => r.user_id === userId);
    if (userRequests.length === 0) {
      const baseline = [
        {
          id: `rem_1`,
          user_id: userId,
          broker_name: "Whitepages.com",
          current_status: "processing" as const,
          submitted_date: "Jul 10, 2026",
          tracking_log: [
            "Opt-out request compiled by system.",
            "Fax transmittal queued & successfully transmitted to compliance team.",
            "Waiting for broker registry verification updates.",
          ],
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `rem_2`,
          user_id: userId,
          broker_name: "Spokeo.com",
          current_status: "completed" as const,
          submitted_date: "Jul 09, 2026",
          resolved_date: "Jul 12, 2026",
          tracking_log: [
            "Opt-out form generated automatically.",
            "Verification webhook triggered successfully.",
            "Broker registry scan confirms profile deleted.",
          ],
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `rem_3`,
          user_id: userId,
          broker_name: "Radaris.com",
          current_status: "exposed" as const,
          submitted_date: "Not Sent",
          tracking_log: ["Personal profile found in scan results. Autopilot removal pending authorization."],
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: `rem_4`,
          user_id: userId,
          broker_name: "Intelius.com",
          current_status: "refused" as const,
          submitted_date: "Jul 08, 2026",
          tracking_log: [
            "Opt-out request submitted.",
            "Broker compliance team requested manual ID verification copy.",
            "Awaiting user upload in profile settings.",
          ],
          created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const updatedRequests = [...requests, ...baseline];
      localStorage.setItem("privora_mock_removal_requests", JSON.stringify(updatedRequests));
      return baseline;
    }
    return userRequests.sort((a: DBRemovalRequest, b: DBRemovalRequest) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createRemovalRequest(userId: string, brokerName: string, status: DBRemovalRequest["current_status"], logs: string[]): Promise<DBRemovalRequest> {
    initMockDB();
    const requests = JSON.parse(localStorage.getItem("privora_mock_removal_requests") || "[]");
    const newRequest: DBRemovalRequest = {
      id: `rem_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      broker_name: brokerName,
      current_status: status,
      submitted_date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      tracking_log: logs,
      created_at: new Date().toISOString()
    };
    requests.push(newRequest);
    localStorage.setItem("privora_mock_removal_requests", JSON.stringify(requests));
    return newRequest;
  }

  async updateRemovalRequestStatus(userId: string, brokerName: string, status: DBRemovalRequest["current_status"], newLog?: string): Promise<DBRemovalRequest> {
    initMockDB();
    const requests = JSON.parse(localStorage.getItem("privora_mock_removal_requests") || "[]");
    const matched = requests.find((r: DBRemovalRequest) => r.user_id === userId && r.broker_name === brokerName);
    if (matched) {
      matched.current_status = status;
      if (newLog) matched.tracking_log.push(newLog);
      if (status === "completed") {
        matched.resolved_date = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      }
      localStorage.setItem("privora_mock_removal_requests", JSON.stringify(requests));
    }
    return matched;
  }

  async getReports(userId: string): Promise<DBReport[]> {
    initMockDB();
    const reports = JSON.parse(localStorage.getItem("privora_mock_reports") || "[]");
    const userReports = reports.filter((r: DBReport) => r.user_id === userId);

    if (userReports.length === 0) {
      const baseline = [
        { name: "Monthly Privacy Report — June 2026", date: "Jul 01, 2026", size: "1.2 MB", id: "rep-june-26", user_id: userId, created_at: new Date(2026, 6, 1).toISOString() },
        { name: "Monthly Privacy Report — May 2026", date: "Jun 01, 2026", size: "1.1 MB", id: "rep-may-26", user_id: userId, created_at: new Date(2026, 5, 1).toISOString() },
        { name: "Monthly Privacy Report — April 2026", date: "May 01, 2026", size: "1.4 MB", id: "rep-apr-26", user_id: userId, created_at: new Date(2026, 4, 1).toISOString() },
      ];
      const updatedReports = [...reports, ...baseline];
      localStorage.setItem("privora_mock_reports", JSON.stringify(updatedReports));
      return baseline;
    }
    return userReports.sort((a: DBReport, b: DBReport) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createReport(userId: string, name: string, size: string): Promise<DBReport> {
    initMockDB();
    const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const reports = JSON.parse(localStorage.getItem("privora_mock_reports") || "[]");
    const newReport: DBReport = {
      id: `rep_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      name,
      date: formattedDate,
      size,
      created_at: new Date().toISOString()
    };
    reports.push(newReport);
    localStorage.setItem("privora_mock_reports", JSON.stringify(reports));
    return newReport;
  }

  async submitFeedback(
    userId: string,
    category: "bug" | "suggestion" | "other",
    rating: number,
    message: string
  ): Promise<DBFeedback> {
    initMockDB();
    const feedbackList = JSON.parse(localStorage.getItem("privora_mock_feedback") || "[]");
    const newFeedback: DBFeedback = {
      id: `fdb_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      category,
      rating,
      message,
      submitted_at: new Date().toISOString(),
      priority: null,
      status: "open"
    };
    feedbackList.push(newFeedback);
    localStorage.setItem("privora_mock_feedback", JSON.stringify(feedbackList));
    return newFeedback;
  }

  async getAllFeedback(): Promise<DBFeedback[]> {
    initMockDB();
    const feedbackList = JSON.parse(localStorage.getItem("privora_mock_feedback") || "[]");

    if (feedbackList.length === 0) {
      const seedFeedback: DBFeedback[] = [
        {
          id: "fdb_1",
          user_id: "user_1",
          category: "bug",
          rating: 2,
          message: "When running a scan in mobile Safari, the circular score metric sometimes wraps onto a second line, making it hard to read. Please fix the layout width.",
          submitted_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          priority: "high",
          status: "open"
        },
        {
          id: "fdb_2",
          user_id: "user_2",
          category: "suggestion",
          rating: 5,
          message: "I love the clean design! It would be really useful to be able to export my exposure list as a CSV or Excel file so I can keep a local copy for backup.",
          submitted_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          priority: "medium",
          status: "open"
        },
        {
          id: "fdb_3",
          user_id: "user_3",
          category: "other",
          rating: 4,
          message: "Just completed my first automated removal and it worked flawlessly. Spokeo removed my records within 5 days! Highly recommend.",
          submitted_at: new Date(Date.now() - 3600000 * 72).toISOString(),
          priority: null,
          status: "resolved"
        }
      ];
      localStorage.setItem("privora_mock_feedback", JSON.stringify(seedFeedback));
      return seedFeedback;
    }

    return feedbackList.sort((a: DBFeedback, b: DBFeedback) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  async updateFeedbackStatusAndPriority(
    feedbackId: string,
    status: "open" | "investigating" | "resolved",
    priority: "high" | "medium" | "low" | null
  ): Promise<DBFeedback> {
    initMockDB();
    const feedbackList = JSON.parse(localStorage.getItem("privora_mock_feedback") || "[]");
    const idx = feedbackList.findIndex((f: DBFeedback) => f.id === feedbackId);
    if (idx !== -1) {
      feedbackList[idx].status = status;
      feedbackList[idx].priority = priority;
      localStorage.setItem("privora_mock_feedback", JSON.stringify(feedbackList));
      return feedbackList[idx];
    }
    throw new Error("Feedback record not found");
  }

  async getMonitoringTargets(userId: string): Promise<DBMonitoringTarget[]> {
    initMockDB();
    const targets = JSON.parse(localStorage.getItem("privora_mock_monitoring_targets") || "[]");
    return targets.filter((t: DBMonitoringTarget) => t.user_id === userId);
  }

  async createMonitoringTarget(
    userId: string,
    type: DBMonitoringTarget["type"],
    target: string,
    frequency: DBMonitoringTarget["frequency"]
  ): Promise<DBMonitoringTarget> {
    initMockDB();
    const targets = JSON.parse(localStorage.getItem("privora_mock_monitoring_targets") || "[]");
    const newTarget: DBMonitoringTarget = {
      id: `mon_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      type,
      target,
      enabled: true,
      frequency,
      created_at: new Date().toISOString(),
      last_scan: new Date().toISOString()
    };
    targets.push(newTarget);
    localStorage.setItem("privora_mock_monitoring_targets", JSON.stringify(targets));
    return newTarget;
  }

  async updateMonitoringTarget(targetId: string, data: Partial<DBMonitoringTarget>): Promise<DBMonitoringTarget> {
    initMockDB();
    const targets = JSON.parse(localStorage.getItem("privora_mock_monitoring_targets") || "[]");
    const idx = targets.findIndex((t: DBMonitoringTarget) => t.id === targetId);
    if (idx === -1) throw new Error("Monitoring target not found");
    targets[idx] = { ...targets[idx], ...data };
    localStorage.setItem("privora_mock_monitoring_targets", JSON.stringify(targets));
    return targets[idx];
  }

  async deleteMonitoringTarget(targetId: string): Promise<void> {
    initMockDB();
    const targets = JSON.parse(localStorage.getItem("privora_mock_monitoring_targets") || "[]");
    const filtered = targets.filter((t: DBMonitoringTarget) => t.id !== targetId);
    localStorage.setItem("privora_mock_monitoring_targets", JSON.stringify(filtered));
  }

  async getAllActiveMonitoringTargets(): Promise<DBMonitoringTarget[]> {
    initMockDB();
    const targets = JSON.parse(localStorage.getItem("privora_mock_monitoring_targets") || "[]");
    return targets.filter((t: DBMonitoringTarget) => t.enabled);
  }

  async saveMonitoringHistory(
    targetId: string,
    status: "success" | "error",
    score: number,
    changes: boolean,
    summary?: string
  ): Promise<DBMonitoringHistory> {
    initMockDB();
    const history = JSON.parse(localStorage.getItem("privora_mock_monitoring_history") || "[]");
    const newHistory: DBMonitoringHistory = {
      id: `hsy_${Math.random().toString(36).substring(2, 11)}`,
      target_id: targetId,
      status,
      risk_score: score,
      changes_detected: changes,
      change_summary: summary,
      created_at: new Date().toISOString()
    };
    history.push(newHistory);
    localStorage.setItem("privora_mock_monitoring_history", JSON.stringify(history));
    return newHistory;
  }

  async getMonitoringHistory(targetId: string): Promise<DBMonitoringHistory[]> {
    initMockDB();
    const history = JSON.parse(localStorage.getItem("privora_mock_monitoring_history") || "[]");
    return history.filter((h: DBMonitoringHistory) => h.target_id === targetId);
  }

  async submitScanFeedback(
    userId: string,
    scanId: string,
    rating: number,
    comment?: string,
    helpful?: boolean
  ): Promise<DBScanFeedback> {
    initMockDB();
    const feedback = JSON.parse(localStorage.getItem("privora_mock_scan_feedback") || "[]");
    const newFeedback: DBScanFeedback = {
      id: `sf_${Math.random().toString(36).substring(2, 11)}`,
      user_id: userId,
      scan_id: scanId,
      rating,
      comment,
      helpful,
      created_at: new Date().toISOString()
    };
    feedback.push(newFeedback);
    localStorage.setItem("privora_mock_scan_feedback", JSON.stringify(feedback));
    return newFeedback;
  }

  async getScanFeedback(scanId: string): Promise<DBScanFeedback[]> {
    initMockDB();
    const feedback = JSON.parse(localStorage.getItem("privora_mock_scan_feedback") || "[]");
    return feedback.filter((f: DBScanFeedback) => f.scan_id === scanId);
  }

  async getAdminMetrics(): Promise<any> {
    initMockDB();
    const targets = JSON.parse(localStorage.getItem("privora_mock_monitoring_targets") || "[]");
    const feedback = JSON.parse(localStorage.getItem("privora_mock_scan_feedback") || "[]");
    
    const sumRatings = feedback.reduce((sum: number, f: DBScanFeedback) => sum + f.rating, 0);
    const avgRating = feedback.length > 0 ? parseFloat((sumRatings / feedback.length).toFixed(1)) : 5.0;

    return {
      uptime: "99.98%",
      cacheHitRate: "78.4%",
      activeMonitorsCount: targets.length,
      avgFeedbackRating: avgRating,
      totalAlertsSent: 142,
      scanResponseTimeMs: 412
    };
  }
}
