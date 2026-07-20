"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Info,
  TrendingUp,
  Bell,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { DashboardService } from "@/services/DashboardService";

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

export function DashboardOverview() {
  const { user } = useAuth();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [scoreProgress, setScoreProgress] = useState(0);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskItem[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([]);
  const [lastScanDate, setLastScanDate] = useState("Never Scanned");
  const [nextScanDate, setNextScanDate] = useState("Autopilot Off");
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
        const data = await DashboardService.getOverviewStats(user.id);
        
        setStats([
          { title: "Brokers Scanned", value: "85", subtitle: "Active broker directories", accentColor: "border-cyan-500/20 text-cyan-500 bg-cyan-500/5" },
          { title: "Active Exposures", value: String(data.exposed), subtitle: "Records exposing private PII", accentColor: "border-destructive/20 text-destructive bg-destructive/5" },
          { title: "Removals Processing", value: String(data.processing), subtitle: "In-flight opt-out requests", accentColor: "border-blue-500/20 text-blue-500 bg-blue-500/5" },
          { title: "Removals Completed", value: String(data.completed), subtitle: "Confirmed database deletes", accentColor: "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" },
        ]);

        setLastScanDate(data.lastScanDate);
        setNextScanDate(data.nextScanDate);
        setHighRiskCount(data.highRisk);
        setMedRiskCount(data.medRisk);
        setLowRiskCount(data.lowRisk);
        setRemovalSuccessRate(data.successRate);
        setRiskAlerts(data.risks);
        setTimelineEvents(data.events);

        // Animate score loader gauge
        setTimeout(() => setScoreProgress(data.overallScore), 350);

        // Simulated data feeds
        setHistoricalScores([
          { date: "Jul 01", score: 34 },
          { date: "Jul 05", score: 38 },
          { date: "Jul 10", score: 42 },
          { date: "Jul 15", score: 55 },
          { date: "Jul 18", score: data.overallScore }
        ]);

        setNotifications([
          { id: "1", message: `System: Active privacy scan check completed. ${data.exposed} leaks identified.`, time: "1 hour ago", read: false },
          { id: "2", message: `Autopilot: Opt-out request dispatched to Whitepages.com directories.`, time: "3 hours ago", read: false },
          { id: "3", message: `Stripe Billing: Invoice processed for Pro Subscription account.`, time: "1 day ago", read: true }
        ]);

      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const insights = [
    { title: "Location Masking", detail: "Disable location sharing in major browser search settings.", tag: "Actionable" },
    { title: "Email Redirection", detail: "Use masking aliases for non-essential online registrations.", tag: "Tip" },
    { title: "Indices Removal", detail: "Request Google to opt-out your profile from street-view searches.", tag: "Guide" },
  ];

  if (isPageLoading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-label="Loading Overview Stats">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-9 w-40 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/60 bg-card rounded-[22px]">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-9 w-14 rounded-lg" />
                <Skeleton className="h-3 w-36 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card className="md:col-span-2 border-border/60 bg-card rounded-[22px] h-[200px]">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </CardContent>
              </Card>
              <Card className="md:col-span-3 border-border/60 bg-card rounded-[22px] h-[200px]">
                <CardContent className="p-6 flex items-end justify-between h-full space-x-2">
                  <Skeleton className="h-16 w-8 rounded-t" />
                  <Skeleton className="h-20 w-8 rounded-t" />
                  <Skeleton className="h-24 w-8 rounded-t" />
                  <Skeleton className="h-28 w-8 rounded-t" />
                </CardContent>
              </Card>
            </div>
            <Card className="border-border/60 bg-card rounded-[22px] h-[200px] p-6">
              <Skeleton className="h-full w-full rounded-xl" />
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/60 bg-card rounded-[22px] h-[420px] p-6">
              <Skeleton className="h-full w-full rounded-xl" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-heading">Overview</h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Welcome back, {user?.firstName || "Ashwak"}. Monitor and secure your digital privacy footprint.
          </p>
        </div>
        
        {/* Last & Next Scan Dynamic Widgets */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center space-x-2 bg-muted/20 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground">
            <Calendar size={13} className="text-zinc-500" aria-hidden="true" />
            <span className="font-semibold text-foreground">Last Scan:</span>
            <span>{lastScanDate}</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-muted/20 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground">
            <Clock size={13} className="text-zinc-500" aria-hidden="true" />
            <span className="font-semibold text-foreground">Next Scan:</span>
            <span>{nextScanDate}</span>
          </div>

          <Link href="/dashboard/scan">
            <Button className="rounded-xl shadow-premium bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary">
              <Search size={15} className="mr-2" aria-hidden="true" />
              Start Privacy Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Exposure Summary Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="Privacy Metrics Grid">
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
                <div className="relative h-32 w-32 flex items-center justify-center" aria-label={`Current privacy index score is ${scoreProgress}%`}>
                  <svg className="h-full w-full transform -rotate-90" aria-hidden="true">
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

            {/* 30-Day Privacy Score Trend Widget */}
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
                        role="img"
                        aria-label={`Score was ${h.score}% on ${h.date}`}
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground font-mono mt-1">{h.date} ({h.score}%)</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Risk Severity Distribution & Removal Success Rate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Distribution Card */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-foreground">Risk Distribution</CardTitle>
                <CardDescription className="text-[9px] text-muted-foreground">Active leaks by risk level</CardDescription>
              </CardHeader>
              <CardContent className="py-2 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-destructive font-medium flex items-center"><AlertTriangle size={11} className="mr-1" aria-hidden="true" /> High Severity</span>
                  <span className="font-bold">{highRiskCount}</span>
                </div>
                <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${highRiskCount * 12}%` }} className="bg-destructive h-full rounded-full" />
                </div>

                <div className="flex justify-between items-center text-xs mt-3">
                  <span className="text-amber-500 font-medium flex items-center"><AlertTriangle size={11} className="mr-1" aria-hidden="true" /> Medium Severity</span>
                  <span className="font-bold">{medRiskCount}</span>
                </div>
                <div className="w-full bg-muted/40 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${medRiskCount * 12}%` }} className="bg-amber-500 h-full rounded-full" />
                </div>

                <div className="flex justify-between items-center text-xs mt-3">
                  <span className="text-cyan-500 font-medium flex items-center"><Info size={11} className="mr-1" aria-hidden="true" /> Low Severity</span>
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
          
          {/* Notifications feed */}
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center space-x-2">
                <Bell size={15} className="text-primary animate-pulse" aria-hidden="true" />
                <CardTitle className="text-xs font-bold text-foreground">Security Feed</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[170px] divide-y divide-border/20">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 flex items-start space-x-3 hover:bg-muted/10 transition-colors">
                  <div className="space-y-1 text-left flex-1 min-w-0">
                    <p className="text-[10px] text-foreground leading-relaxed font-medium break-words">
                      {n.message}
                    </p>
                    <span className="text-[8px] text-muted-foreground font-mono block mt-1">{n.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Autopilot Timeline */}
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp size={15} className="text-cyan-500" aria-hidden="true" />
                <CardTitle className="text-xs font-bold text-foreground">Autopilot Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border-l border-border/60 pl-4 ml-2.5 space-y-5 py-1">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className={cn(
                      "absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                      event.status === "success" ? "bg-emerald-500" : event.status === "processing" ? "bg-blue-500" : "bg-destructive"
                    )} />
                    <div className="space-y-0.5 text-left">
                      <p className="text-[10px] font-semibold text-foreground leading-tight">
                        {event.text}
                      </p>
                      <span className="text-[8px] text-muted-foreground font-mono block">
                        {event.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <FileText size={15} className="text-primary" aria-hidden="true" />
                <CardTitle className="text-xs font-bold text-foreground">Privacy Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-foreground">{insight.title}</span>
                    <Badge variant="outline" className="text-[7px] font-bold tracking-wider px-1.5 uppercase bg-primary/5 text-primary border-primary/20">
                      {insight.tag}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">{insight.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
