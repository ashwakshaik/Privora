"use client";

import React from "react";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";
import { RemovalCenter } from "@/features/dashboard/components/RemovalCenter";

export default function RemovalCenterRoute() {
  return (
    <DashboardShell>
      <RemovalCenter />
    </DashboardShell>
  );
}
