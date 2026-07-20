"use client";

import React from "react";
import { Bell, AlertCircle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  time: string;
}

interface AlertsCardProps {
  alerts: AlertItem[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
  return (
    <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 flex flex-row items-center justify-between text-left">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Recent Security Alerts</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground mt-0.5">Threat triggers flagged across scans</CardDescription>
        </div>
        <Bell size={16} className="text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0 text-left">
        {alerts.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <AlertCircle size={18} />
            </div>
            <p className="text-xs text-muted-foreground">Your twin is secure. Zero alerts verified.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-muted/5 flex items-start space-x-3 transition-colors">
                <ShieldAlert
                  size={14}
                  className={`mt-0.5 shrink-0 ${
                    alert.severity === "high" ? "text-destructive" : "text-amber-500"
                  }`}
                  aria-hidden="true"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">{alert.title}</h4>
                    <span className="text-[9px] text-zinc-500 font-mono shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default AlertsCard;
