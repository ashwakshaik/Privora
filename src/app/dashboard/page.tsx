"use client";

import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export default function DashboardOverviewPage() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}
