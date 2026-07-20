"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { DashboardHeader } from "./DashboardHeader";
import { PrivacyScoreCard } from "./PrivacyScoreCard";
import { RiskCard } from "./RiskCard";
import { AlertsCard } from "./AlertsCard";
import { TimelineChart } from "./TimelineChart";
import { RecommendationsCard } from "./RecommendationsCard";
import { ActivityCard } from "./ActivityCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function DashboardOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    score: number;
    risk: string;
    alerts: any[];
    timeline: any[];
    recommendations: any[];
    monitoring: any[];
  } | null>(null);

  const [lastScanDate, setLastScanDate] = useState("Never Scanned");
  const [nextScanDate, setNextScanDate] = useState("Autopilot Off");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?userId=${user.id}`);
      if (!res.ok) throw new Error("Failed to load dashboard metrics");
      const payload = await res.json();
      setData(payload);

      // Load scan history counts to set Last Scan Date details
      const scansRes = await fetch(`/api/scan?userId=${user.id}`).catch(() => null);
      if (scansRes && scansRes.ok) {
        const scans = await scansRes.json();
        if (scans && scans.length > 0) {
          setLastScanDate(new Date(scans[0].triggered_at).toLocaleDateString());
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-8 text-left" aria-busy="true" aria-label="Loading Stats Dashboard">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>

        {/* Top Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-[22px]" />
          <Skeleton className="h-48 rounded-[22px]" />
          <Skeleton className="h-48 rounded-[22px]" />
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-[22px]" />
          <Skeleton className="h-72 rounded-[22px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto text-left">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="text-sm font-bold text-foreground">Failed to Load Dashboard</h3>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <div className="flex justify-center">
          <Button onClick={loadData} variant="outline" className="rounded-xl px-6 h-10 border-border cursor-pointer">
            Retry Load
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.score === 100 && data.alerts.length === 0 && data.timeline.length === 0) {
    return (
      <div className="p-12 text-center space-y-6 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-[22px] bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <AlertCircle size={28} className="text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">Welcome to Privora OS</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create your Digital Twin privacy posture and configure security sweeps to map out credentials, domains, and web reputations.
          </p>
        </div>
        <div className="flex justify-center pt-2">
          <Link href="/dashboard/scan">
            <Button className="h-11 rounded-xl px-8 bg-gradient-to-r from-primary to-secondary text-white font-semibold cursor-pointer border-0 shadow-lg">
              Deploy Digital Twin Scan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardHeader
        firstName={user?.firstName || "User"}
        lastScanDate={lastScanDate}
        nextScanDate={nextScanDate}
        onRefresh={loadData}
        isRefreshing={loading}
      />

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PrivacyScoreCard score={data.score} risk={data.risk} />
        <RiskCard risk={data.risk} />
        <ActivityCard monitoring={data.monitoring} />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimelineChart timeline={data.timeline} />
        <AlertsCard alerts={data.alerts} />
      </div>

      <div className="grid grid-cols-1">
        <RecommendationsCard recommendations={data.recommendations} />
      </div>
    </div>
  );
}
