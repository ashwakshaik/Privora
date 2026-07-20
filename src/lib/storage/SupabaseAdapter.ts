import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StorageAdapter } from "./StorageAdapter";
import { config } from "../env";
import {
  DBUser,
  DBSettings,
  DBPrivacyScore,
  DBScan,
  DBScanResult,
  DBRemovalRequest,
  DBReport,
  DBFeedback
} from "./types";

export class SupabaseAdapter implements StorageAdapter {
  private supabase: SupabaseClient;

  constructor() {
    // Instantiate Supabase client using the central config
    const supabaseUrl = config.supabaseUrl || "https://placeholder-project.supabase.co";
    const supabaseAnonKey = config.supabaseAnonKey || "placeholder-key";
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  async syncUser(userId: string, email: string, firstName?: string, lastName?: string): Promise<DBUser> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      const newRecord = {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName || "User"}%20${lastName || ""}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data: inserted, error: insertError } = await this.supabase
        .from("users")
        .insert(newRecord)
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Initialize default user settings
      await this.saveSettings(userId, {
        user_id: userId,
        scan_email: email,
        home_address: "",
        phone_number: "",
        autopilot_enabled: false,
        updated_at: new Date().toISOString()
      });

      return inserted as DBUser;
    }
    if (error) throw error;
    return data as DBUser;
  }

  async getSettings(userId: string): Promise<DBSettings> {
    const { data, error } = await this.supabase
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") {
        const defSettings: DBSettings = {
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
        return defSettings;
      }
      throw error;
    }
    return data as DBSettings;
  }

  async saveSettings(userId: string, data: Partial<DBSettings>): Promise<DBSettings> {
    const { data: updated, error } = await this.supabase
      .from("settings")
      .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return updated as DBSettings;
  }

  async getLatestScore(userId: string): Promise<DBPrivacyScore> {
    const { data, error } = await this.supabase
      .from("privacy_scores")
      .select("*")
      .eq("user_id", userId)
      .order("calculated_at", { ascending: false })
      .limit(1);
    
    if (error) throw error;
    if (data && data.length > 0) return data[0] as DBPrivacyScore;

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
    const { data, error } = await this.supabase
      .from("privacy_scores")
      .select("*")
      .eq("user_id", userId)
      .order("calculated_at", { ascending: true });
    if (error) throw error;
    return data as DBPrivacyScore[];
  }

  async savePrivacyScore(
    userId: string,
    score: number,
    exposed: number,
    pending: number,
    completed: number
  ): Promise<DBPrivacyScore> {
    const { data, error } = await this.supabase
      .from("privacy_scores")
      .insert({
        user_id: userId,
        overall_score: score,
        exposed_records_count: exposed,
        pending_removals_count: pending,
        completed_removals_count: completed,
        calculated_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data as DBPrivacyScore;
  }

  async getScans(userId: string): Promise<DBScan[]> {
    const { data, error } = await this.supabase
      .from("scans")
      .select("*")
      .eq("user_id", userId)
      .order("triggered_at", { ascending: false });
    if (error) throw error;
    return data as DBScan[];
  }

  async createScan(userId: string, scanType: "manual" | "automated", searchCriteriaHash: string): Promise<DBScan> {
    const { data, error } = await this.supabase
      .from("scans")
      .insert({
        user_id: userId,
        scan_type: scanType,
        search_criteria_hash: searchCriteriaHash,
        status: "scanning",
        triggered_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data as DBScan;
  }

  async updateScanStatus(scanId: string, status: DBScan["status"]): Promise<DBScan> {
    const { data, error } = await this.supabase
      .from("scans")
      .update({ status, completed_at: status === "completed" ? new Date().toISOString() : undefined })
      .eq("id", scanId)
      .select()
      .single();
    if (error) throw error;
    return data as DBScan;
  }

  async getScanResults(scanId: string): Promise<DBScanResult[]> {
    const { data, error } = await this.supabase
      .from("scan_results")
      .select("*")
      .eq("scan_id", scanId);
    if (error) throw error;
    return data as DBScanResult[];
  }

  async saveScanResult(scanId: string, brokerName: string, recordPreview: string, severity: DBScanResult["severity"]): Promise<DBScanResult> {
    const { data, error } = await this.supabase
      .from("scan_results")
      .insert({
        scan_id: scanId,
        broker_name: brokerName,
        record_preview: recordPreview,
        severity,
        match_status: "exposed",
        found_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data as DBScanResult;
  }

  async getRemovalRequests(userId: string): Promise<DBRemovalRequest[]> {
    const { data, error } = await this.supabase
      .from("removal_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as DBRemovalRequest[];
  }

  async createRemovalRequest(userId: string, brokerName: string, status: DBRemovalRequest["current_status"], logs: string[]): Promise<DBRemovalRequest> {
    const { data, error } = await this.supabase
      .from("removal_requests")
      .insert({
        user_id: userId,
        broker_name: brokerName,
        current_status: status,
        submitted_date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        tracking_log: logs,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data as DBRemovalRequest;
  }

  async updateRemovalRequestStatus(userId: string, brokerName: string, status: DBRemovalRequest["current_status"], newLog?: string): Promise<DBRemovalRequest> {
    const { data: request } = await this.supabase
      .from("removal_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("broker_name", brokerName)
      .single();
    
    const logs = request ? [...request.tracking_log] : [];
    if (newLog) logs.push(newLog);

    const updateData: Partial<DBRemovalRequest> = {
      current_status: status,
      tracking_log: logs
    };
    if (status === "completed") {
      updateData.resolved_date = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    }

    const { data: updated, error } = await this.supabase
      .from("removal_requests")
      .update(updateData)
      .eq("user_id", userId)
      .eq("broker_name", brokerName)
      .select()
      .single();
    if (error) throw error;
    return updated as DBRemovalRequest;
  }

  async getReports(userId: string): Promise<DBReport[]> {
    const { data, error } = await this.supabase
      .from("reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as DBReport[];
  }

  async createReport(userId: string, name: string, size: string): Promise<DBReport> {
    const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const { data, error } = await this.supabase
      .from("reports")
      .insert({
        user_id: userId,
        name,
        date: formattedDate,
        size,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data as DBReport;
  }

  async submitFeedback(
    userId: string,
    category: "bug" | "suggestion" | "other",
    rating: number,
    message: string
  ): Promise<DBFeedback> {
    const { data, error } = await this.supabase
      .from("feedback")
      .insert({
        user_id: userId,
        category,
        rating,
        message,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) throw error;
    return data as DBFeedback;
  }

  async getAllFeedback(): Promise<DBFeedback[]> {
    const { data, error } = await this.supabase
      .from("feedback")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) throw error;
    return data as DBFeedback[];
  }

  async updateFeedbackStatusAndPriority(
    feedbackId: string,
    status: "open" | "investigating" | "resolved",
    priority: "high" | "medium" | "low" | null
  ): Promise<DBFeedback> {
    const { data, error } = await this.supabase
      .from("feedback")
      .update({ status, priority })
      .eq("id", feedbackId)
      .select()
      .single();
    if (error) throw error;
    return data as DBFeedback;
  }
}
