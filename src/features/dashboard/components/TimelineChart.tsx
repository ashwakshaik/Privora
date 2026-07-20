"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TimelineItem {
  date: string;
  score: number;
}

interface TimelineChartProps {
  timeline: TimelineItem[];
}

export function TimelineChart({ timeline }: TimelineChartProps) {
  const getScoreBg = (val: number) => {
    if (val >= 90) return "bg-emerald-500 hover:bg-emerald-400";
    if (val >= 70) return "bg-amber-500 hover:bg-amber-400";
    if (val >= 50) return "bg-orange-500 hover:bg-orange-400";
    return "bg-destructive hover:bg-destructive/80";
  };

  return (
    <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30 flex flex-row items-center justify-between text-left">
        <div>
          <CardTitle className="text-sm font-bold text-foreground">Score History</CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground mt-0.5">Privacy index evolution tracker</CardDescription>
        </div>
        <TrendingUp size={16} className="text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent className="p-6">
        {timeline.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No historical records cached yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chart Area */}
            <div className="h-40 flex items-end justify-between gap-4 pt-4 border-b border-border/30 px-2">
              {timeline.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-zinc-950 border border-border text-[10px] font-bold text-foreground px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    {item.score}%
                  </div>
                  
                  {/* Colored Bar */}
                  <div
                    style={{ height: `${Math.max(item.score, 12)}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ease-out ${getScoreBg(item.score)}`}
                  />
                  
                  {/* Date Label */}
                  <span className="text-[9px] text-zinc-500 font-mono font-bold mt-2 truncate max-w-full">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Legend indicators */}
            <div className="flex justify-center space-x-4 text-[9px] font-bold uppercase text-muted-foreground">
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>90-100 Safe</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>70-89 Med</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>0-69 Risk</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default TimelineChart;
