"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  Info,
  Clock,
  Settings,
  TrendingUp,
  Calendar,
  Bell,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { useAuth } from "@/providers/auth-provider";
import { db } from "@/lib/supabase";

interface StatItem {
  title: string;
  value: string;
  subtitle: string;
  accentColor: string;
}

interface RiskItem {
  source: string;
  type: string;
  detail: string;
  severity: string;
}

interface TimelineItem {
  text: string;
  time: string;
  status: string;
}

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [scoreProgress, setScoreProgress] = useState(0);
  const [stats, setStats] = useState<StatItem[]>([
    { title: "Brokers Scanned", value: "85", subtitle: "Active broker directories", accentColor: "border-cyan-500/20 text-cyan-500 bg-cyan-500/5" },
    { title: "Active Exposures", value: "0", subtitle: "Records exposing private PII", accentColor: "border-destructive/20 text-destructive bg-destructive/5" },
    { title: "Removals Processing", value: "0", subtitle: "In-flight opt-out requests", accentColor: "border-blue-500/20 text-blue-500 bg-blue-500/5" },
    { title: "Removals Completed", value: "0", subtitle: "Confirmed database deletes", accentColor: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" },
  ]);

  const [riskAlerts, setRiskAlerts] = useState<RiskItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([]);
  
  // Day 2 Scheduler States
  const [lastScanDate, setLastScanDate] = useState("Never Scanned");
  const [nextScanDate, setNextScanDate] = useState("Autopilot Off");

  // Day 5 Advanced Widgets States
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [medRiskCount, setMedRiskCount] = useState(0);
  const [lowRiskCount, setLowRiskCount] = useState(0);
  const [removalSuccessRate, setRemovalSuccessRate] = useState(100);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [historicalScores, setHistoricalScores] = useState<{ date: string; score: number }[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        // 1. Fetch latest score
        const scoreRecord = await db.getLatestScore(user.id);
        
        // 2. Fetch removal requests
        const removals = await db.getRemovalRequests(user.id);

        // Compute counts
        const exposed = removals.filter(r => r.current_status === "exposed" || r.current_status === "refused").length;
        const processing = removals.filter(r => r.current_status === "processing" || r.current_status === "pending").length;
        const completed = removals.filter(r => r.current_status === "completed").length;
        const totalRemovals = removals.length;

        // Dynamic stats array
        setStats([
          { title: "Brokers Scanned", value: "85", subtitle: "Active broker directories", accentColor: "border-cyan-500/20 text-cyan-500 bg-cyan-500/5" },
          { title: "Active Exposures", value: String(exposed), subtitle: "Records exposing private PII", accentColor: "border-destructive/20 text-destructive bg-destructive/5" },
          { title: "Removals Processing", value: String(processing), subtitle: "In-flight opt-out requests", accentColor: "border-blue-500/20 text-blue-500 bg-blue-500/5" },
          { title: "Removals Completed", value: String(completed), subtitle: "Confirmed database deletes", accentColor: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" },
        ]);

        // Animate score loader gauge
        setTimeout(() => setScoreProgress(scoreRecord.overall_score), 350);

        // 3. Compile Risk Alerts from exposed requests
        const risks = removals
          .filter(r => r.current_status === "exposed" || r.current_status === "refused" || r.current_status === "processing")
          .slice(0, 3)
          .map(r => {
            const name = r.broker_name.toLowerCase();
            let sev = "Low";
            let type = "Public Profile Record";
            if (name.includes("whitepages") || name.includes("spokeo") || name.includes("privateeye")) {
              sev = "High";
              type = name.includes("whitepages") ? "Home Address" : "Phone Number";
            } else if (name.includes("radaris") || name.includes("leakcheck") || name.includes("haveibeenpwned")) {
              sev = "Medium";
              type = "Contact Email Leak";
            }
            return {
              source: r.broker_name,
              type,
              detail: r.tracking_log[r.tracking_log.length - 1] || "Exposed profile record.",
              severity: sev
            };
          });
        
        setRiskAlerts(risks.length > 0 ? risks : [
          { source: "No Risks Found", type: "Clean Boundary", detail: "Active scanning shows zero exposed registries.", severity: "Low" }
        ]);

        // 4. Compile Timeline Events from logs
        const events: TimelineItem[] = [];
        removals.forEach(r => {
          const lastLog = r.tracking_log[r.tracking_log.length - 1];
          if (lastLog) {
            events.push({
              text: `${r.broker_name}: ${lastLog}`,
              time: r.resolved_date ? `Resolved on ${r.resolved_date}` : `Updated recently`,
              status: r.current_status === "completed" ? "success" : r.current_status === "processing" || r.current_status === "pending" ? "processing" : "alert"
            });
          }
        });
        setTimelineEvents(events.slice(0, 4));

        // Day 2: Fetch Scans & Calculate Last/Next Scan dates
        const scans = await db.getScans(user.id);
        const userSettings = await db.getSettings(user.id);
        
        const latestScan = scans.find(s => s.status === "completed");
        let lastDate: Date | null = null;
        
        if (latestScan) {
          lastDate = new Date(latestScan.triggered_at);
          setLastScanDate(lastDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
        } else {
          setLastScanDate("Never Scanned");
        }

        if (userSettings.autopilot_enabled) {
          const baseDate = lastDate || new Date();
          const freq = userSettings.scan_frequency || "monthly";
          let addDays = 30;
          if (freq === "weekly") addDays = 7;
          else if (freq === "quarterly") addDays = 90;

          const nextDate = new Date(baseDate.getTime() + addDays * 24 * 3600000);
          setNextScanDate(nextDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
        } else {
          setNextScanDate("Autopilot Off");
        }

        // Day 5: Risk Severity Breakdown
        let highCount = 0;
        let medCount = 0;
        let lowCount = 0;
        removals.forEach(r => {
          if (r.current_status !== "completed") {
            const name = r.broker_name.toLowerCase();
            if (name.includes("whitepages") || name.includes("spokeo") || name.includes("privateeye")) {
              highCount++;
            } else if (name.includes("radaris") || name.includes("leakcheck") || name.includes("haveibeenpwned")) {
              medCount++;
            } else {
              lowCount++;
            }
          }
        });
        setHighRiskCount(highCount);
        setMedRiskCount(medCount);
        setLowRiskCount(lowCount);

        // Day 5: Removal Success Rate
        const rate = totalRemovals === 0 ? 100 : Math.round((completed / totalRemovals) * 100);
        setRemovalSuccessRate(rate);

        // Day 5: Historical Scores (30 days trend simulation)
        setHistoricalScores([
          { date: "Jul 01", score: 34 },
          { date: "Jul 05", score: 38 },
          { date: "Jul 10", score: 42 },
          { date: "Jul 15", score: 55 },
          { date: "Jul 18", score: scoreRecord.overall_score }
        ]);

        // Day 5: Recent Notifications Feed
        setNotifications([
          { id: "1", message: `System: Active privacy scan check completed. ${exposed} leaks identified.`, time: "1 hour ago", read: false },
          { id: "2", message: `Autopilot: Opt-out request dispatched to Whitepages.com directories.`, time: "3 hours ago", read: false },
          { id: "3", message: `Stripe Billing: Invoice processed for Pro Subscription account.`, time: "1 day ago", read: true }
        ]);

      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };

    loadDashboardData();
  }, [user]);

  const insights = [
    { title: "Location Masking", detail: "Disable location sharing in major browser search settings.", tag: "Actionable" },
    { title: "Email Redirection", detail: "Use masking aliases for non-essential online registrations.", tag: "Tip" },
    { title: "Indices Removal", detail: "Request Google to opt-out your profile from street-view searches.", tag: "Guide" },
  ];

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-heading">Overview</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Welcome back, {user?.firstName || "Ashwak"}. Monitor and secure your digital privacy footprint.
            </p>
          </div>
          
          {/* Day 2: Last & Next Scan Dynamic Widgets */}
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="flex items-center space-x-2 bg-muted/20 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground">
              <Calendar size={13} className="text-zinc-500" />
              <span className="font-semibold text-foreground">Last Scan:</span>
              <span>{lastScanDate}</span>
            </div>
            
            <div className="flex items-center space-x-2 bg-muted/20 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground">
              <Clock size={13} className="text-zinc-500" />
              <span className="font-semibold text-foreground">Next Scan:</span>
              <span>{nextScanDate}</span>
            </div>

            <Link href="/dashboard/scan">
              <Button className="rounded-xl shadow-premium bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90">
                <Search size={15} className="mr-2" />
                Start Privacy Scan
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Exposure Summary Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardContent className="p-6 text-left">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {stat.title}
                </span>
                <div className="flex items-baseline space-x-3 mt-2.5">
                  <span className="text-3xl font-black tracking-tight text-foreground">
                    {stat.value}
                  </span>
                  <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${stat.accentColor}`}>
                    Active
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 block leading-none">
                  {stat.subtitle}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 2. Split Workspace Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
          
          {/* Left Block (3 Columns - 60%): Privacy Score & Advanced Analytics */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Privacy score & 30-Day Trend Combined */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Privacy Score Ring Gauge */}
              <Card className="md:col-span-2 border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-bold text-foreground">Privacy Score</CardTitle>
                  <CardDescription className="text-[9px] text-muted-foreground">Digital exposure score</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="relative h-32 w-32 flex items-center justify-center">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-muted/10 fill-none"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke="url(#dashboardPurpleGrad)"
                        strokeWidth="7"
                        strokeDasharray={327}
                        strokeDashoffset={327 - (327 * scoreProgress) / 100}
                        className="fill-none stroke-linecap-round"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="dashboardPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
                          <stop offset="100%" stopColor="hsl(221, 83%, 53%)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-foreground tracking-tight">{scoreProgress}%</span>
                      <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5">Score</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Day 5: 30-Day Privacy Score Trend Widget */}
              <Card className="md:col-span-3 border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-bold text-foreground">Privacy Trend (30 Days)</CardTitle>
                  <CardDescription className="text-[9px] text-muted-foreground">Rating trajectory over last sweeps</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-end justify-between border-b border-l border-border/50 pb-2 pl-3 h-24 mt-2 relative mx-4">
                  {historicalScores.map((h, idx) => (
                    <div key={idx} className="w-[18%] flex flex-col items-center">
                      <div className="w-2 bg-primary/20 rounded-full flex items-end justify-center h-16">
                        <div
                          style={{ height: `${h.score}%` }}
                          className="w-full bg-primary rounded-full"
                        />
                      </div>
                      <span className="text-[8px] text-muted-foreground font-mono mt-1">{h.date} ({h.score}%)</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Day 5: Risk Severity Distribution & Removal Success Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Risk Distribution Card */}
              <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-foreground">Risk Distribution</CardTitle>
                  <CardDescription className="text-[9px] text-muted-foreground">Active leaks categorized by risk level</CardDescription>
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-destructive font-medium flex items-center"><AlertTriangle size={11} className="mr-1" /> High Severity</span>
                    <span className="font-bold">{highRiskCount}</span>
                  </div>
                  <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${highRiskCount * 12}%` }} className="bg-destructive h-full rounded-full" />
                  </div>

                  <div className="flex justify-between items-center text-xs mt-3">
                    <span className="text-amber-500 font-medium flex items-center"><AlertTriangle size={11} className="mr-1" /> Medium Severity</span>
                    <span className="font-bold">{medRiskCount}</span>
                  </div>
                  <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${medRiskCount * 12}%` }} className="bg-amber-500 h-full rounded-full" />
                  </div>

                  <div className="flex justify-between items-center text-xs mt-3">
                    <span className="text-cyan-500 font-medium flex items-center"><Info size={11} className="mr-1" /> Low Severity</span>
                    <span className="font-bold">{lowRiskCount}</span>
                  </div>
                  <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${lowRiskCount * 12}%` }} className="bg-cyan-500 h-full rounded-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Removal Success Rate Card */}
              <Card className="border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-foreground">Removal Success Rate</CardTitle>
                  <CardDescription className="text-[9px] text-muted-foreground">Percentage of completed opt-outs</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-4">
                  <div className="text-3xl font-black text-foreground">{removalSuccessRate}%</div>
                  <p className="text-[9px] text-muted-foreground mt-1">Confirmed database removals</p>
                  
                  <div className="w-full bg-muted/40 h-3 rounded-full mt-4 overflow-hidden relative">
                    <div
                      style={{ width: `${removalSuccessRate}%` }}
                      className="bg-gradient-to-r from-primary to-emerald-500 h-full rounded-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Alerts List */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">Risk Alerts</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Highest severity exposed records requiring attention.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {riskAlerts.map((alert, idx) => (
                  <div key={idx} className="flex justify-between items-start p-3 bg-muted/30 border border-border/30 rounded-xl">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground leading-none">{alert.source}</p>
                      <span className="text-[9px] font-mono text-zinc-500 block">{alert.type}</span>
                      <p className="text-[10px] text-muted-foreground leading-none mt-1">{alert.detail}</p>
                    </div>
                    <Badge className={`border-0 rounded-full text-[9px] font-semibold px-2 py-0.5 uppercase ${
                      alert.severity === "High" ? "bg-destructive/15 text-destructive" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Block (2 Columns - 40%): Notifications & Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Day 5: Recent Notifications Feed */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5"><Bell size={14} className="text-primary" /> Notifications Feed</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Alert logs and automated tasks telemetry.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border transition text-xs relative ${
                      notif.read ? "bg-muted/10 border-border/30 text-muted-foreground" : "bg-primary/5 border-primary/20 text-foreground"
                    }`}
                  >
                    {!notif.read && <div className="absolute top-3.5 right-3 h-2 w-2 rounded-full bg-primary" />}
                    <p className="text-[11px] font-medium leading-relaxed pr-3">{notif.message}</p>
                    <span className="text-[9px] text-muted-foreground block mt-1">{notif.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Privacy Insights */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">Privacy Insights</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Custom preventative guidelines and safety guides.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg mt-0.5">
                      <Sparkles size={14} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-foreground leading-none">{insight.title}</h4>
                        <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/10 rounded-full text-[9px] font-medium px-1.5 py-0.2">
                          {insight.tag}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                        {insight.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Activity Timeline</CardTitle>
                  <CardDescription className="text-[11px] text-muted-foreground">
                    Removals and scans event histories.
                  </CardDescription>
                </div>
                <Link href="/dashboard/removal">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 rounded-lg">
                    Opt-out Center
                    <ArrowRight size={12} className="ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative border-l border-border pl-5 space-y-4.5">
                  {timelineEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                      {/* Bullet Icon */}
                      <span className="absolute -left-[30px] top-0.5 bg-card border border-border p-0.5 rounded-full text-foreground shadow-sm">
                        {event.status === "success" ? (
                          <CheckCircle2 size={10} className="text-emerald-500" />
                        ) : event.status === "processing" ? (
                          <Clock size={10} className="text-blue-500" />
                        ) : (
                          <AlertTriangle size={10} className="text-destructive" />
                        )}
                      </span>
                      <p className="text-xs font-semibold text-foreground leading-relaxed">{event.text}</p>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{event.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
