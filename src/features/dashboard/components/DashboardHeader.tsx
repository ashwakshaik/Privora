"use client";

import React from "react";
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  firstName: string;
  lastScanDate: string;
  nextScanDate: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DashboardHeader({
  firstName,
  lastScanDate,
  nextScanDate,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left border-b border-border/40 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-heading">Overview</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Welcome back, {firstName || "User"}. Monitor your privacy Digital Twin posture.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 bg-muted/20 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground">
          <Calendar size={13} className="text-zinc-500" aria-hidden="true" />
          <span>Last sweep: <strong className="text-foreground">{lastScanDate}</strong></span>
        </div>

        <div className="flex items-center space-x-2 bg-muted/20 border border-border/80 rounded-xl px-3.5 py-1.5 text-xs text-muted-foreground">
          <Clock size={13} className="text-zinc-500" aria-hidden="true" />
          <span>Autopilot: <strong className="text-foreground">{nextScanDate}</strong></span>
        </div>

        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="h-9 px-4 rounded-xl text-xs font-semibold border-border cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RefreshCw size={12} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
