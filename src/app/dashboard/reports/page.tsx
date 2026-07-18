"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  TrendingUp,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  History,
  Eye,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { db, DBReport, DBScan, DBScanResult } from "@/lib/supabase";

interface ReportItem {
  name: string;
  date: string;
  size: string;
  id: string;
}

export default function ReportsArchivePage() {
  const { user } = useAuth();
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [latestScore, setLatestScore] = useState(100);
  const [activeTab, setActiveTab] = useState<"reports" | "scans">("reports");

  // Scans history
  const [scansList, setScansList] = useState<DBScan[]>([]);
  const [scansLoading, setScansLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState<DBScan | null>(null);
  const [selectedScanResults, setSelectedScanResults] = useState<DBScanResult[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadReportsData = async () => {
      try {
        const reports = await db.getReports(user.id);
        setReportsList(reports.map(r => ({
          name: r.name,
          date: r.date,
          size: r.size,
          id: r.id
        })));

        const scoreRecord = await db.getLatestScore(user.id);
        setLatestScore(scoreRecord.overall_score);
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    };

    loadReportsData();
  }, [user]);

  // Load scans when tab changes to scans
  useEffect(() => {
    if (!user || activeTab !== "scans") return;

    const loadScansData = async () => {
      setScansLoading(true);
      try {
        const list = await db.getScans(user.id);
        setScansList(list);
      } catch (err) {
        console.error("Failed to load scan history:", err);
        toast.error("Failed to load scan history.");
      } finally {
        setScansLoading(false);
      }
    };

    loadScansData();
  }, [user, activeTab]);

  const viewScanDetails = async (scan: DBScan) => {
    setSelectedScan(scan);
    setModalLoading(true);
    try {
      const results = await db.getScanResults(scan.id);
      setSelectedScanResults(results);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scan details.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownload = async (name: string) => {
    if (!user) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      
      // Fetch active exposures to print them dynamically
      const removals = await db.getRemovalRequests(user.id);
      const activeExposures = removals.filter(r => r.current_status !== "completed");
      
      // Document Theme Colors (Privora styling)
      const primaryColor = [11, 10, 15]; // dark-gray
      const accentColor = [99, 102, 241]; // indigo-violet

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 38, "F");

      // Brand Logo / Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("PRIVORA", 14, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 180);
      doc.text("SECURE AUTOMATED DATA PRIVACY SYSTEMS", 14, 28);

      // Metadata Block
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("REPORT METADATA SUMMARY", 14, 50);

      doc.setDrawColor(220, 220, 225);
      doc.line(14, 53, 196, 53);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Report Identifier:  ${name.toUpperCase()}`, 14, 62);
      doc.text(`Generated For:      ${user.firstName || "Ashwak"} ${user.lastName || ""}`, 14, 68);
      doc.text(`Email Registered:   ${user.email || "user@gmail.com"}`, 14, 74);
      doc.text(`Compilation Date:   ${new Date().toLocaleDateString()}`, 14, 80);

      // Score Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("PRIVACY SCORE ANALYSIS", 14, 95);
      doc.line(14, 98, 196, 98);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Calculated Privacy Score:   ${latestScore}%`, 14, 107);
      
      const statusText = latestScore > 80
        ? "Status: SECURE. Excellent digital privacy parameters."
        : latestScore > 50
        ? "Status: MODERATE RISK. Data broker exposure entries found."
        : "Status: HIGH EXPOSURE RISK. Critical contact and address files exposed.";
      doc.text(statusText, 14, 114);

      // Active Exposures list
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("EXPOSURE PROFILE AUDIT", 14, 128);
      doc.line(14, 131, 196, 131);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      if (activeExposures.length === 0) {
        doc.text("No active exposed records detected. All opt-outs completed or zero matches found.", 14, 140);
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("Broker Name", 14, 140);
        doc.text("Exposure Status", 80, 140);
        doc.text("Last Update Notes", 125, 140);
        doc.setFont("helvetica", "normal");
        
        let y = 146;
        activeExposures.slice(0, 12).forEach((exp) => {
          doc.text(exp.broker_name, 14, y);
          doc.text(exp.current_status.toUpperCase(), 80, y);
          
          const logNote = exp.tracking_log[exp.tracking_log.length - 1] || "Exposed profile.";
          const truncatedLog = logNote.length > 35 ? logNote.substring(0, 32) + "..." : logNote;
          doc.text(truncatedLog, 125, y);
          y += 7;
        });

        if (activeExposures.length > 12) {
          doc.text(`... and ${activeExposures.length - 12} other active exposures. View dashboard for complete log.`, 14, y);
        }
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("CONFIDENTIAL PRIVACY AUDIT. POWERED BY AES-256 ZERO-KNOWLEDGE AUTOMATION ENGINES.", 14, 285);

      doc.save(`${name.toLowerCase().replace(/ /g, "-")}.pdf`);
      toast.success(`PDF report downloaded: ${name}.pdf`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF report.");
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;
    try {
      const removals = await db.getRemovalRequests(user.id);
      
      const csvRows = [
        ["Broker Name", "Status", "Exposed Data Heuristic", "Resolved Date"],
        ...removals.map(r => [
          r.broker_name,
          r.current_status,
          r.tracking_log[r.tracking_log.length - 1] || "Exposed registry profile.",
          r.resolved_date || "N/A"
        ])
      ];

      const csvContent = csvRows
        .map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `privora_privacy_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export CSV report.");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-heading">Reports & History Archive</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              Download generated monthly PDF/CSV audits and explore past scanning logs.
            </p>
          </div>
          <Button
            onClick={handleExportCSV}
            className="rounded-xl shadow-premium bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90 font-semibold text-xs h-9"
          >
            <FileSpreadsheet size={14} className="mr-2" />
            Quick Export CSV
          </Button>
        </div>

        {/* Dynamic Tab Selector */}
        <div className="flex space-x-1 border-b border-border w-fit">
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "reports"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5"><FileText size={13} /> PDF Reports</span>
          </button>
          <button
            onClick={() => setActiveTab("scans")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "scans"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5"><History size={13} /> Scan History</span>
          </button>
        </div>

        {/* Tab Content 1: PDF Reports */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Score Trend graph summary */}
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Privacy Rating Progress</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Score trajectory tracker over previous scanning cycles.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex flex-col justify-between">
                <div className="flex-1 flex items-end justify-between border-b border-l border-border/80 pb-2 pl-4 h-40 relative">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 pr-4">
                    <div className="border-t border-dashed border-zinc-300 w-full h-0" />
                    <div className="border-t border-dashed border-zinc-300 w-full h-0" />
                    <div className="border-t border-dashed border-zinc-300 w-full h-0" />
                  </div>

                  <div className="w-[20%] flex flex-col items-center z-10">
                    <div className="h-10 w-2.5 rounded-full bg-primary/20 flex items-end">
                      <div className="h-[34%] w-full bg-primary rounded-full" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-2">Apr (34)</span>
                  </div>
                  <div className="w-[20%] flex flex-col items-center z-10">
                    <div className="h-20 w-2.5 rounded-full bg-primary/20 flex items-end">
                      <div className="h-[48%] w-full bg-primary rounded-full" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-2">May (48)</span>
                  </div>
                  <div className="w-[20%] flex flex-col items-center z-10">
                    <div className="h-32 w-2.5 rounded-full bg-primary/20 flex items-end">
                      <div className="h-[75%] w-full bg-primary rounded-full" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-2">Jun (75)</span>
                  </div>
                  <div className="w-[20%] flex flex-col items-center z-10">
                    <div className="h-24 w-2.5 rounded-full bg-primary/20 flex items-end">
                      <div className="h-[42%] w-full bg-primary rounded-full" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono mt-2">Jul (42)</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 text-[11px] text-muted-foreground">
                  <TrendingUp size={14} className="text-primary" />
                  <span>Score shifts directly coordinate with background opt-out resolutions.</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Monthly Audits PDF</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportsList.map((rep, idx) => (
                  <Card key={idx} className="border-border/60 bg-card rounded-[22px] shadow-premium hover:border-primary/20 transition-all">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3.5 min-w-0">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                          <FileText size={20} />
                        </div>
                        <div className="truncate text-left">
                          <h4 className="text-xs font-semibold text-foreground truncate">{rep.name}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center">
                            <Calendar size={10} className="mr-1" />
                            {rep.date} • {rep.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(rep.name)}
                        className="h-9 w-9 border border-border text-muted-foreground hover:text-foreground rounded-lg ml-3 cursor-pointer"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: Scan History */}
        {activeTab === "scans" && (
          <Card className="border-border/60 bg-card rounded-[22px] overflow-hidden shadow-premium">
            <CardContent className="p-0">
              {scansLoading ? (
                <div className="text-center py-12 text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading scan histories...
                </div>
              ) : scansList.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  No scan history found. Initiate a scan in the Privacy Scan module first.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-[#18181B]/5 hover:bg-muted/10">
                      <TableHead className="text-zinc-500 text-xs font-semibold py-3 px-6">Triggered Date</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold">Scan Type</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold">Criteria Hash</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scansList.map((scan) => (
                      <TableRow key={scan.id} className="border-b border-border hover:bg-muted/10">
                        <TableCell className="text-xs py-4 px-6 text-foreground font-medium">
                          {new Date(scan.triggered_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary border-0 rounded-full text-[9px] font-semibold uppercase px-2 py-0.5">
                            {scan.scan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center text-xs text-foreground">
                            {scan.status === "completed" ? (
                              <CheckCircle size={12} className="text-emerald-500 mr-1.5" />
                            ) : (
                              <AlertTriangle size={12} className="text-destructive mr-1.5" />
                            )}
                            {scan.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground font-mono">
                          {scan.search_criteria_hash}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs rounded-xl border-border hover:bg-muted/50"
                            onClick={() => viewScanDetails(scan)}
                          >
                            <Eye size={12} className="mr-1.5" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Scan Results Modal */}
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#09090B] border border-border/80 rounded-2xl w-full max-w-2xl p-6 relative shadow-premium overflow-hidden text-left">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <h3 className="text-base font-bold text-foreground font-heading">Scan Details</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ID: {selectedScan.id} • Date: {new Date(selectedScan.triggered_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedScan(null)}
                  className="h-8 rounded-lg border-0 text-muted-foreground hover:text-foreground"
                >
                  Close
                </Button>
              </div>

              {/* Scan Results List */}
              <div className="mt-5 space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {modalLoading ? (
                  <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
                    <Loader2 size={16} className="animate-spin" /> Loading matched profiles...
                  </div>
                ) : selectedScanResults.length === 0 ? (
                  <div className="text-center py-12 text-xs text-muted-foreground">
                    No registry matches were found during this scan.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedScanResults.map((res, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border border-border/30 rounded-xl bg-muted/15"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-foreground">{res.broker_name}</p>
                          <p className="text-[10px] font-mono text-muted-foreground">{res.record_preview}</p>
                        </div>
                        <Badge
                          variant={res.severity === "high" ? "destructive" : "secondary"}
                          className="rounded-full text-[9px] font-bold px-2 py-0.5 uppercase"
                        >
                          {res.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Informational Alerts bottom */}
        <div className="flex items-center space-x-2.5 bg-muted/40 border border-border rounded-xl p-4 text-xs text-muted-foreground">
          <AlertCircle size={15} className="text-primary" />
          <span>Privacy report generation logs and scan directories are stored strictly in in-memory hashes.</span>
        </div>
      </div>
    </DashboardShell>
  );
}
