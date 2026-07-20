"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PrivacyScoreCardProps {
  score: number;
  risk: string;
}

export function PrivacyScoreCard({ score, risk }: PrivacyScoreCardProps) {
  const [offset, setOffset] = useState(251.2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(251.2 - (251.2 * score) / 100);
    }, 200);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (val: number) => {
    if (val >= 90) return "text-emerald-500 stroke-emerald-500";
    if (val >= 70) return "text-amber-500 stroke-amber-500";
    if (val >= 50) return "text-orange-500 stroke-orange-500";
    return "text-destructive stroke-destructive";
  };

  const getScoreBorder = (val: number) => {
    if (val >= 90) return "border-emerald-500/20";
    if (val >= 70) return "border-amber-500/20";
    if (val >= 50) return "border-orange-500/20";
    return "border-destructive/20";
  };

  const colorClass = getScoreColor(score);
  const borderClass = getScoreBorder(score);

  return (
    <Card className={`border-border/60 bg-card rounded-[22px] shadow-premium flex flex-col items-center justify-center p-6 text-center border-b-4 ${borderClass}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Privacy Index</CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground mt-0.5">Overall digital shielding rating</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-2">
        <div className="relative h-32 w-32 flex items-center justify-center">
          <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-zinc-800/40 stroke-zinc-800"
              strokeWidth="6"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={`${colorClass} transition-all duration-700 ease-out`}
              strokeWidth="6"
              strokeDasharray="251.2"
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-foreground">{score}%</span>
            <span className={`text-[9px] font-extrabold uppercase mt-0.5 ${colorClass.split(" ")[0]}`}>{risk} Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default PrivacyScoreCard;
