"use client";

import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { SettingsPanel } from "@/features/settings/components/SettingsPanel";

export default function SettingsRoute() {
  return (
    <DashboardShell>
      <SettingsPanel />
    </DashboardShell>
  );
}
