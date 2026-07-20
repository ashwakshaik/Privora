"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RiskCardProps {
  risk: string;
}

export function RiskCard({ risk }: RiskCardProps) {
  const getRiskDetails = (level: string) => {
    const lowercase = level.toLowerCase();
    if (lowercase === "critical" || lowercase === "high") {
      return {
        title: "High Risk Actions Required",
        description: "Critical exposures detected on external data brokers search indices.",
        color: "text-destructive border-destructive/20 bg-destructive/5",
        icon: ShieldAlert,
      };
    }
    if (lowercase === "medium") {
      return {
        title: "Medium Exposure Checked",
        description: "Minor tracking elements found on public registers.",
        color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
        icon: AlertTriangle,
      };
    }
    return {
      title: "Privacy Footprint Secure",
      description: "No high severity leaks found across queried sources.",
      color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
      icon: ShieldCheck,
    };
  };

  const details = getRiskDetails(risk);
  const Icon = details.icon;

  return (
    <Card className={`border-border/60 bg-card rounded-[22px] shadow-premium p-6 border-b-4 flex flex-col justify-between ${details.color}`}>
      <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Threat Status</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground mt-0.5">Calculated risk band</CardDescription>
        </div>
        <div className="h-8 w-8 rounded-lg bg-card/65 border border-border flex items-center justify-center">
          <Icon size={16} />
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2 space-y-2 text-left">
        <h3 className="text-sm font-bold text-foreground">{details.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{details.description}</p>
      </CardContent>
    </Card>
  );
}
export default RiskCard;
