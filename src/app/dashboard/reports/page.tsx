"use client";

import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ReportsList } from "@/features/reports/components/ReportsList";

export default function ReportsArchiveRoute() {
  return (
    <DashboardShell>
      <ReportsList />
    </DashboardShell>
  );
}
