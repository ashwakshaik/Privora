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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { toast } from "sonner";
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
          .map(r => ({
            source: r.broker_name,
            type: r.broker_name.includes("Whitepages") ? "Home Address" : r.broker_name.includes("Spokeo") ? "Phone Number" : "Email Address",
            detail: r.tracking_log[r.tracking_log.length - 1] || "Exposed registry profile.",
            severity: r.broker_name.includes("Whitepages") || r.broker_name.includes("Spokeo") ? "High" : "Medium"
          }));
        
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-heading">Overview</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Welcome back, {user?.firstName || "Ashwak"}. Monitor and secure your digital privacy footprint.
            </p>
          </div>
          <Link href="/dashboard/scan">
            <Button className="rounded-xl shadow-premium bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90">
              <Search size={15} className="mr-2" />
              Start Privacy Scan
            </Button>
          </Link>
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
          {/* Left: Privacy Score & Risk Alerts (2 Columns - 40%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Privacy Score Widget */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between overflow-hidden relative">
              {/* Subtle top background glow overlay */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
              
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">Privacy Score</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Dynamic digital exposure index.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center justify-center py-6">
                {/* Score Circle Gauge */}
                <div className="relative h-44 w-44 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="currentColor"
                      strokeWidth="9"
                      className="text-muted/20 fill-none"
                    />
                    <motion.circle
                      cx="88"
                      cy="88"
                      r="76"
                      stroke="url(#purpleBlueCyan)"
                      strokeWidth="9"
                      strokeDasharray={477}
                      strokeDashoffset={477 - (477 * scoreProgress) / 100}
                      className="fill-none stroke-linecap-round"
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                    {/* SVG Gradient definitions */}
                    <defs>
                      <linearGradient id="purpleBlueCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(262, 83%, 58%)" />
                        <stop offset="50%" stopColor="hsl(221, 83%, 53%)" />
                        <stop offset="100%" stopColor="hsl(187, 92%, 45%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-foreground tracking-tight">{scoreProgress}%</span>
                    <span className="text-[9px] text-destructive font-bold uppercase tracking-wider mt-1">
                      Exposed
                    </span>
                  </div>
                </div>

                {/* Score Status Alert */}
                <div className="mt-6 flex items-center space-x-2 bg-destructive/5 border border-destructive/10 rounded-xl px-4 py-2 text-destructive text-[11px]">
                  <ShieldAlert size={14} className="animate-pulse" />
                  <span>12 exposed broker files require deletion</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Alerts List */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">Risk Alerts</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Highest severity exposed records.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                {riskAlerts.map((alert, idx) => (
                  <div key={idx} className="flex justify-between items-start p-3 bg-muted/30 border border-border/30 rounded-xl">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground leading-none">{alert.source}</p>
                      <p className="text-[10px] text-muted-foreground leading-none">{alert.detail}</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20 rounded-full text-[9px] font-semibold px-2 py-0.5">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: Privacy Insights & Timeline (3 Columns - 60%) */}
          <div className="lg:col-span-3 space-y-6">
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
