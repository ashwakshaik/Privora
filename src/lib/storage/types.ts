export interface DBUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface DBSettings {
  user_id: string;
  scan_email: string;
  home_address: string;
  phone_number: string;
  autopilot_enabled: boolean;
  scan_frequency?: "weekly" | "monthly" | "quarterly";
  email_alerts_enabled?: boolean;
  report_delivery_enabled?: boolean;
  updated_at: string;
}

export interface DBPrivacyScore {
  id: string;
  user_id: string;
  overall_score: number;
  exposed_records_count: number;
  pending_removals_count: number;
  completed_removals_count: number;
  calculated_at: string;
}

export interface DBScan {
  id: string;
  user_id: string;
  scan_type: "manual" | "automated";
  search_criteria_hash: string;
  status: "idle" | "scanning" | "completed" | "failed";
  triggered_at: string;
  completed_at?: string;
}

export interface DBScanResult {
  id: string;
  scan_id: string;
  broker_name: string;
  record_preview: string;
  severity: "high" | "medium" | "low";
  match_status: "exposed" | "removed";
  found_at: string;
}

export interface DBRemovalRequest {
  id: string;
  user_id: string;
  broker_name: string;
  current_status: "pending" | "processing" | "completed" | "failed" | "exposed" | "refused";
  submitted_date?: string;
  resolved_date?: string;
  tracking_log: string[];
  created_at: string;
}

export interface DBReport {
  id: string;
  user_id: string;
  name: string;
  date: string;
  size: string;
  created_at: string;
}

export interface DBFeedback {
  id: string;
  user_id: string;
  category: "bug" | "suggestion" | "other";
  rating: number;
  message: string;
  submitted_at: string;
  priority?: "high" | "medium" | "low" | null;
  status?: "open" | "investigating" | "resolved" | null;
}

export interface DBMonitoringTarget {
  id: string;
  user_id: string;
  type: "email" | "website" | "domain" | "password";
  target: string;
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  last_scan?: string;
  next_scan?: string;
  created_at: string;
}

export interface DBMonitoringHistory {
  id: string;
  target_id: string;
  status: "success" | "error";
  risk_score: number;
  changes_detected: boolean;
  change_summary?: string;
  created_at: string;
}

export interface DBScanFeedback {
  id: string;
  user_id: string;
  scan_id: string;
  rating: number;
  comment?: string;
  helpful?: boolean;
  created_at: string;
}

