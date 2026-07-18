"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Clock, CheckCircle2, ShieldAlert, ArrowRight, Settings, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { db, DBRemovalRequest } from "@/lib/supabase";

interface BrokerRemoval {
  broker: string;
  status: "Exposed" | "In Progress" | "Removed" | "Refused";
  date: string;
  log: string[];
}

export default function RemovalCenterPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "removed" | "exposed">("all");
  const [selectedBroker, setSelectedBroker] = useState<BrokerRemoval | null>(null);
  const [autopilot, setAutopilot] = useState(false);
  const [removalsData, setRemovalsData] = useState<BrokerRemoval[]>([]);
  const [metrics, setMetrics] = useState({ exposed: 0, processing: 0, completed: 0, score: 100 });

  useEffect(() => {
    if (!user) return;

    const loadRemovalData = async () => {
      try {
        // Load settings for autopilot
        const settings = await db.getSettings(user.id);
        setAutopilot(settings.autopilot_enabled);

        // Load latest score
        const scoreRecord = await db.getLatestScore(user.id);

        // Load removals list
        const rawRemovals = await db.getRemovalRequests(user.id);
        
        // Map to UI BrokerRemoval structure
        const mappedData: BrokerRemoval[] = rawRemovals.map((r) => {
          let statusText: BrokerRemoval["status"] = "Exposed";
          if (r.current_status === "completed") statusText = "Removed";
          else if (r.current_status === "processing" || r.current_status === "pending") statusText = "In Progress";
          else if (r.current_status === "refused") statusText = "Refused";

          return {
            broker: r.broker_name,
            status: statusText,
            date: r.submitted_date || "Not Sent",
            log: r.tracking_log,
          };
        });

        setRemovalsData(mappedData);

        // Compute counts
        const exposedCount = rawRemovals.filter(r => r.current_status === "exposed" || r.current_status === "refused").length;
        const processingCount = rawRemovals.filter(r => r.current_status === "processing" || r.current_status === "pending").length;
        const completedCount = rawRemovals.filter(r => r.current_status === "completed").length;

        setMetrics({
          exposed: exposedCount,
          processing: processingCount,
          completed: completedCount,
          score: scoreRecord.overall_score
        });
      } catch (err) {
        console.error("Failed to load removals center:", err);
      }
    };

    loadRemovalData();
  }, [user]);

  const handleAutopilotToggle = async () => {
    if (!user) return;
    const newVal = !autopilot;
    setAutopilot(newVal);
    try {
      await db.saveSettings(user.id, { autopilot_enabled: newVal });
      toast.success(`Autopilot ${newVal ? "activated" : "deactivated"}.`);
    } catch {
      toast.error("Failed to update autopilot setting.");
    }
  };

  const filteredData = removalsData.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "in-progress") return item.status === "In Progress";
    if (activeTab === "removed") return item.status === "Removed";
    if (activeTab === "exposed") return item.status === "Exposed" || item.status === "Refused";
    return true;
  });

  const getStatusBadge = (status: BrokerRemoval["status"]) => {
    switch (status) {
      case "Removed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[9px] font-bold px-2 py-0.5">
            Removed
          </Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-full text-[9px] font-bold px-2 py-0.5">
            In Progress
          </Badge>
        );
      case "Exposed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 rounded-full text-[9px] font-bold px-2 py-0.5">
            Exposed
          </Badge>
        );
      case "Refused":
        return (
          <Badge className="bg-zinc-100 text-zinc-500 border-zinc-200 rounded-full text-[9px] font-bold px-2 py-0.5">
            Action Required
          </Badge>
        );
    }
  };

  return (
    <DashboardShell>
      <div className="flex gap-6 relative min-h-[calc(100vh-120px)]">
        {/* Main List Column */}
        <div className="flex-1 space-y-8 min-w-0 text-left">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground font-heading">Removal Center</h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Track and request deletion logs of exposed profiles.
              </p>
            </div>

            {/* Autopilot toggle */}
            <div className="flex items-center space-x-3 bg-card border border-border px-4 py-2 rounded-xl shadow-premium">
              <span className="text-xs font-semibold text-foreground">Autopilot Mode</span>
              <button
                onClick={handleAutopilotToggle}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autopilot ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autopilot ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Metrics summary widget */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border bg-card p-4 rounded-xl shadow-premium">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Exposures</span>
              <p className="text-xl font-bold text-destructive mt-1">{metrics.exposed}</p>
            </Card>
            <Card className="border-border bg-card p-4 rounded-xl shadow-premium">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">In Progress</span>
              <p className="text-xl font-bold text-blue-500 mt-1">{metrics.processing}</p>
            </Card>
            <Card className="border-border bg-card p-4 rounded-xl shadow-premium">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Removals Done</span>
              <p className="text-xl font-bold text-emerald-500 mt-1">{metrics.completed}</p>
            </Card>
            <Card className="border-border bg-card p-4 rounded-xl shadow-premium">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Protected Score</span>
              <p className="text-xl font-bold text-primary mt-1">{metrics.score}%</p>
            </Card>
          </div>

          {/* Filter Tab bar */}
          <div className="flex space-x-1 border-b border-border">
            {(["all", "exposed", "in-progress", "removed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Main Table Card */}
          <Card className="border-border/60 bg-card rounded-[22px] overflow-hidden shadow-premium">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-[#18181B]/5 hover:bg-muted/10">
                    <TableHead className="text-zinc-500 text-xs font-semibold py-3 px-6">Broker Name</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-semibold">Removal Status</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-semibold">Date Submitted</TableHead>
                    <TableHead className="text-zinc-500 text-xs font-semibold text-right pr-6">Trace Logs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((res, idx) => (
                    <TableRow key={idx} className="border-b border-border hover:bg-muted/10">
                      <TableCell className="font-bold text-foreground py-4 px-6">{res.broker}</TableCell>
                      <TableCell>{getStatusBadge(res.status)}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{res.date}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBroker(res)}
                          className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 rounded-lg"
                        >
                          Details
                          <ArrowRight size={14} className="ml-1.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right slide drawer details panel */}
        {selectedBroker && (
          <aside className="w-80 border-l border-border/65 bg-card p-6 flex flex-col justify-between absolute md:sticky top-0 right-0 h-[calc(100vh-120px)] z-15 shadow-2xl rounded-r-[22px] text-left animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">{selectedBroker.broker}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedBroker(null)}
                  className="h-8 w-8 rounded-lg"
                  aria-label="Close panel"
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Status Badge */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Current Status
                </span>
                <div className="pt-1">{getStatusBadge(selectedBroker.status)}</div>
              </div>

              {/* Logs timeline list */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Opt-Out Log Trace
                </span>
                <div className="relative border-l border-border pl-4 space-y-4">
                  {selectedBroker.log.map((logLine, idx) => (
                    <div key={idx} className="relative text-left">
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-border bg-card flex items-center justify-center">
                        <span className="h-1 w-1 bg-primary rounded-full" />
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{logLine}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-border pt-4">
              <Button
                onClick={() => setSelectedBroker(null)}
                variant="outline"
                className="w-full h-9 text-xs rounded-xl border-border text-foreground hover:bg-muted/50"
              >
                Close Drawer
              </Button>
            </div>
          </aside>
        )}
      </div>
    </DashboardShell>
  );
}
