"use client";

import React from "react";
import { CheckSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecItem {
  type: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface RecommendationsCardProps {
  recommendations: RecItem[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 flex flex-row items-center justify-between text-left">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">AI Fix Recommendations</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground mt-0.5">Step-by-step actions to lift privacy rating</CardDescription>
        </div>
        <Sparkles size={16} className="text-primary animate-pulse" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-0 text-left">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <ShieldCheck size={18} />
            </div>
            <p className="text-xs text-muted-foreground">All recommended configurations fully applied!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-4 hover:bg-muted/5 flex items-start space-x-3 transition-colors">
                <CheckSquare size={14} className="mt-0.5 text-primary shrink-0" aria-hidden="true" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-foreground truncate">{rec.type}</h4>
                    <Badge className={`border-0 rounded-full text-[8px] font-bold px-2 py-0.2 uppercase ${
                      rec.priority === "high"
                        ? "bg-destructive/10 text-destructive"
                        : rec.priority === "medium"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-cyan-500/10 text-cyan-600"
                    }`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default RecommendationsCard;
