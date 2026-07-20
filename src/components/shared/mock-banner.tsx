"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function MockBanner() {
  const { isMockMode } = useAuth();

  if (!isMockMode) return null;

  return (
    <div 
      role="alert"
      className="bg-amber-950/40 border-b border-amber-500/20 text-amber-400 py-2.5 px-4 text-xs flex items-center justify-center space-x-2 w-full z-50 backdrop-blur-md animate-fade-in"
    >
      <AlertTriangle size={14} className="text-amber-500 animate-pulse" aria-hidden="true" />
      <span className="font-medium tracking-wide">
        Running in Mock Mode. No real data will be stored.
      </span>
    </div>
  );
}
