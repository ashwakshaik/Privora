"use client";

import React from "react";
import { Activity, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MonitorItem {
  id: string;
  type: string;
  target: string;
  status: string;
  frequency: string;
}

interface ActivityCardProps {
  monitoring: MonitorItem[];
}

export function ActivityCard({ monitoring }: ActivityCardProps) {
  return (
    <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 flex flex-row items-center justify-between text-left">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Active Continuous Monitors</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground mt-0.5">Asset channels under daily cron check</CardDescription>
        </div>
        <Activity size={16} className="text-primary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0 text-left">
        {monitoring.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <ShieldCheck size={18} />
            </div>
            <p className="text-xs text-muted-foreground">Continuous monitoring is idle. Configure targets in Settings.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {monitoring.map((item) => (
              <div key={item.id} className="p-4 hover:bg-muted/5 flex items-center justify-between transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-primary capitalize">{item.type}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">•</span>
                    <span className="text-[10px] text-zinc-500 font-mono capitalize">{item.frequency}</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                    {item.target}
                  </h4>
                </div>
                
                <Badge className={`border-0 rounded-full text-[8px] font-bold px-2 py-0.2 uppercase ${
                  item.status.toLowerCase() === "running"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-zinc-500/10 text-zinc-500"
                }`}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default ActivityCard;
