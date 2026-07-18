import { createClient } from "@supabase/supabase-js";

// Check if credentials are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured =
  supabaseUrl !== "" &&
  supabaseUrl !== "https://your-supabase-project.supabase.co" &&
  supabaseAnonKey !== "" &&
  supabaseAnonKey !== "your-supabase-anonymous-key";

// Real Supabase client instance (can be null if not configured, though we instantiate it with empty strings if not)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder-project.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-key"
);

// Database Interfaces
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
};

// Database API Client
export const db = {
  // --- USERS SECTION ---
  syncUser: async (userId: string, email: string, firstName?: string, lastName?: string): Promise<DBUser> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // User doesn't exist, create it
        const newRecord = {
          id: userId,
          email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName || "User"}%20${lastName || ""}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        const { data: inserted, error: insertError } = await supabase
          .from("users")
          .insert(newRecord)
          .select()
          .single();
        
        if (insertError) throw insertError;

        // Initialize user settings
        await db.saveSettings(userId, {
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
    } else {
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
        db.saveSettings(userId, {
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
  },

  // --- SETTINGS SECTION ---
  getSettings: async (userId: string): Promise<DBSettings> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        if (error.code === "PGRST116") {
          // Fallback creation
          const defSettings: DBSettings = {
            user_id: userId,
            scan_email: "",
            home_address: "",
            phone_number: "",
            autopilot_enabled: false,
            updated_at: new Date().toISOString()
          };
          return defSettings;
        }
        throw error;
      }
      return data as DBSettings;
    } else {
      initMockDB();
      const settingsMap = JSON.parse(localStorage.getItem("privora_mock_settings") || "{}");
      if (!settingsMap[userId]) {
        // Fallback default setting structure
        settingsMap[userId] = {
          user_id: userId,
          scan_email: "",
          home_address: "",
          phone_number: "",
          autopilot_enabled: false,
          updated_at: new Date().toISOString()
        };
        localStorage.setItem("privora_mock_settings", JSON.stringify(settingsMap));
      }
      return settingsMap[userId];
    }
  },

  saveSettings: async (userId: string, data: Partial<DBSettings>): Promise<DBSettings> => {
    if (isSupabaseConfigured) {
      const { data: updated, error } = await supabase
        .from("settings")
        .upsert({ user_id: userId, ...data, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return updated as DBSettings;
    } else {
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
  },

  // --- PRIVACY SCORES SECTION ---
  getLatestScore: async (userId: string): Promise<DBPrivacyScore> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("privacy_scores")
        .select("*")
        .eq("user_id", userId)
        .order("calculated_at", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      if (data && data.length > 0) return data[0] as DBPrivacyScore;

      // Default baseline if no scores computed
      return {
        id: "baseline",
        user_id: userId,
        overall_score: 100,
        exposed_records_count: 0,
        pending_removals_count: 0,
        completed_removals_count: 0,
        calculated_at: new Date().toISOString()
      };
    } else {
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
  },

  getScoreHistory: async (userId: string): Promise<DBPrivacyScore[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("privacy_scores")
        .select("*")
        .eq("user_id", userId)
        .order("calculated_at", { ascending: true });
      if (error) throw error;
      return data as DBPrivacyScore[];
    } else {
      initMockDB();
      const scores = JSON.parse(localStorage.getItem("privora_mock_privacy_scores") || "[]");
      return scores
        .filter((s: DBPrivacyScore) => s.user_id === userId)
        .sort((a: DBPrivacyScore, b: DBPrivacyScore) => new Date(a.calculated_at).getTime() - new Date(b.calculated_at).getTime());
    }
  },

  savePrivacyScore: async (
    userId: string,
    score: number,
    exposed: number,
    pending: number,
    completed: number
  ): Promise<DBPrivacyScore> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
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
    } else {
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
  },

  // --- SCANS SECTION ---
  getScans: async (userId: string): Promise<DBScan[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", userId)
        .order("triggered_at", { ascending: false });
      if (error) throw error;
      return data as DBScan[];
    } else {
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
  },

  createScan: async (userId: string, scanType: "manual" | "automated", searchCriteriaHash: string): Promise<DBScan> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
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
    } else {
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
  },

  updateScanStatus: async (scanId: string, status: DBScan["status"]): Promise<DBScan> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("scans")
        .update({ status, completed_at: status === "completed" ? new Date().toISOString() : undefined })
        .eq("id", scanId)
        .select()
        .single();
      if (error) throw error;
      return data as DBScan;
    } else {
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
  },

  // --- SCAN RESULTS SECTION ---
  getScanResults: async (scanId: string): Promise<DBScanResult[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("scan_results")
        .select("*")
        .eq("scan_id", scanId);
      if (error) throw error;
      return data as DBScanResult[];
    } else {
      initMockDB();
      const results = JSON.parse(localStorage.getItem("privora_mock_scan_results") || "[]");
      return results.filter((r: DBScanResult) => r.scan_id === scanId);
    }
  },

  saveScanResult: async (scanId: string, brokerName: string, recordPreview: string, severity: DBScanResult["severity"]): Promise<DBScanResult> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
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
    } else {
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
  },

  // --- REMOVAL REQUESTS SECTION ---
  getRemovalRequests: async (userId: string): Promise<DBRemovalRequest[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("removal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBRemovalRequest[];
    } else {
      initMockDB();
      const requests = JSON.parse(localStorage.getItem("privora_mock_removal_requests") || "[]");
      
      // Seed default baseline requests if empty
      const userRequests = requests.filter((r: DBRemovalRequest) => r.user_id === userId);
      if (userRequests.length === 0) {
        const baseline = [
          {
            id: `rem_1`,
            user_id: userId,
            broker_name: "Whitepages.com",
            current_status: "processing",
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
            current_status: "completed",
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
            current_status: "exposed",
            submitted_date: "Not Sent",
            tracking_log: ["Personal profile found in scan results. Autopilot removal pending authorization."],
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: `rem_4`,
            user_id: userId,
            broker_name: "Intelius.com",
            current_status: "refused",
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
        return baseline as DBRemovalRequest[];
      }
      return userRequests.sort((a: DBRemovalRequest, b: DBRemovalRequest) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  createRemovalRequest: async (userId: string, brokerName: string, status: DBRemovalRequest["current_status"], logs: string[]): Promise<DBRemovalRequest> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
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
    } else {
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
  },

  updateRemovalRequestStatus: async (userId: string, brokerName: string, status: DBRemovalRequest["current_status"], newLog?: string): Promise<DBRemovalRequest> => {
    if (isSupabaseConfigured) {
      // Fetch request first to get current logs
      const { data: request } = await supabase
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

      const { data: updated, error } = await supabase
        .from("removal_requests")
        .update(updateData)
        .eq("user_id", userId)
        .eq("broker_name", brokerName)
        .select()
        .single();
      if (error) throw error;
      return updated as DBRemovalRequest;
    } else {
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
  },

  // --- REPORTS SECTION ---
  getReports: async (userId: string): Promise<DBReport[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBReport[];
    } else {
      initMockDB();
      const reports = JSON.parse(localStorage.getItem("privora_mock_reports") || "[]");
      const userReports = reports.filter((r: DBReport) => r.user_id === userId);
      
      // Seed default baseline reports if empty
      if (userReports.length === 0) {
        const baseline = [
          { name: "Monthly Privacy Report — June 2026", date: "Jul 01, 2026", size: "1.2 MB", id: "rep-june-26", user_id: userId, created_at: new Date(2026, 6, 1).toISOString() },
          { name: "Monthly Privacy Report — May 2026", date: "Jun 01, 2026", size: "1.1 MB", id: "rep-may-26", user_id: userId, created_at: new Date(2026, 5, 1).toISOString() },
          { name: "Monthly Privacy Report — April 2026", date: "May 01, 2026", size: "1.4 MB", id: "rep-apr-26", user_id: userId, created_at: new Date(2026, 4, 1).toISOString() },
        ];
        const updatedReports = [...reports, ...baseline];
        localStorage.setItem("privora_mock_reports", JSON.stringify(updatedReports));
        return baseline as DBReport[];
      }
      return userReports.sort((a: DBReport, b: DBReport) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  createReport: async (userId: string, name: string, size: string): Promise<DBReport> => {
    const formattedDate = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
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
    } else {
      initMockDB();
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
  },

  submitFeedback: async (
    userId: string,
    category: "bug" | "suggestion" | "other",
    rating: number,
    message: string
  ): Promise<DBFeedback> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
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
    } else {
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
  },

  getAllFeedback: async (): Promise<DBFeedback[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as DBFeedback[];
    } else {
      initMockDB();
      const feedbackList = JSON.parse(localStorage.getItem("privora_mock_feedback") || "[]");
      
      // Seed default feedback if empty
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
  },

  updateFeedbackStatusAndPriority: async (
    feedbackId: string,
    status: "open" | "investigating" | "resolved",
    priority: "high" | "medium" | "low" | null
  ): Promise<DBFeedback> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("feedback")
        .update({ status, priority })
        .eq("id", feedbackId)
        .select()
        .single();
      if (error) throw error;
      return data as DBFeedback;
    } else {
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
  }
};

