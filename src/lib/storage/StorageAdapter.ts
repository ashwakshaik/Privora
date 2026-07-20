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

export interface StorageAdapter {
  syncUser(userId: string, email: string, firstName?: string, lastName?: string): Promise<DBUser>;
  getSettings(userId: string): Promise<DBSettings>;
  saveSettings(userId: string, data: Partial<DBSettings>): Promise<DBSettings>;
  getLatestScore(userId: string): Promise<DBPrivacyScore>;
  getScoreHistory(userId: string): Promise<DBPrivacyScore[]>;
  savePrivacyScore(userId: string, score: number, exposed: number, pending: number, completed: number): Promise<DBPrivacyScore>;
  getScans(userId: string): Promise<DBScan[]>;
  createScan(userId: string, scanType: "manual" | "automated", searchCriteriaHash: string): Promise<DBScan>;
  updateScanStatus(scanId: string, status: DBScan["status"]): Promise<DBScan>;
  getScanResults(scanId: string): Promise<DBScanResult[]>;
  saveScanResult(scanId: string, brokerName: string, recordPreview: string, severity: DBScanResult["severity"]): Promise<DBScanResult>;
  getRemovalRequests(userId: string): Promise<DBRemovalRequest[]>;
  createRemovalRequest(userId: string, brokerName: string, status: DBRemovalRequest["current_status"], logs: string[]): Promise<DBRemovalRequest>;
  updateRemovalRequestStatus(userId: string, brokerName: string, status: DBRemovalRequest["current_status"], newLog?: string): Promise<DBRemovalRequest>;
  getReports(userId: string): Promise<DBReport[]>;
  createReport(userId: string, name: string, size: string): Promise<DBReport>;
  submitFeedback(userId: string, category: "bug" | "suggestion" | "other", rating: number, message: string): Promise<DBFeedback>;
  getAllFeedback(): Promise<DBFeedback[]>;
  updateFeedbackStatusAndPriority(feedbackId: string, status: "open" | "investigating" | "resolved", priority: "high" | "medium" | "low" | null): Promise<DBFeedback>;
  
  // Continuous Monitoring & Sweeps
  getMonitoringTargets(userId: string): Promise<DBMonitoringTarget[]>;
  createMonitoringTarget(userId: string, type: DBMonitoringTarget["type"], target: string, frequency: DBMonitoringTarget["frequency"]): Promise<DBMonitoringTarget>;
  updateMonitoringTarget(targetId: string, data: Partial<DBMonitoringTarget>): Promise<DBMonitoringTarget>;
  deleteMonitoringTarget(targetId: string): Promise<void>;
  getAllActiveMonitoringTargets(): Promise<DBMonitoringTarget[]>;
  saveMonitoringHistory(targetId: string, status: "success" | "error", score: number, changes: boolean, summary?: string): Promise<DBMonitoringHistory>;
  getMonitoringHistory(targetId: string): Promise<DBMonitoringHistory[]>;

  // Scan Rating Feedback
  submitScanFeedback(userId: string, scanId: string, rating: number, comment?: string, helpful?: boolean): Promise<DBScanFeedback>;
  getScanFeedback(scanId: string): Promise<DBScanFeedback[]>;
  getAdminMetrics(): Promise<any>;
}
