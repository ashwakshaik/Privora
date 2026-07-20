"use client";

import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { ScanConsole } from "@/features/scan/components/ScanConsole";

export default function PrivacyScanRoute() {
  return (
    <DashboardShell>
      <ScanConsole />
    </DashboardShell>
  );
}
