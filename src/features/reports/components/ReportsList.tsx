"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  AlertCircle,
  History,
  Eye,
  CheckCircle,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { storage, DBScan, DBScanResult } from "@/lib/storage";
import { ReportService } from "@/services/ReportService";

interface ReportItem {
  name: string;
  date: string;
  size: string;
  id: string;
}

export function ReportsList() {
  const { user } = useAuth();
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [latestScore, setLatestScore] = useState(100);
  const [activeTab, setActiveTab] = useState<"reports" | "scans">("reports");

  const [scansList, setScansList] = useState<DBScan[]>([]);
  const [scansLoading, setScansLoading] = useState(false);
  const [selectedScan, setSelectedScan] = useState<DBScan | null>(null);
  const [selectedScanResults, setSelectedScanResults] = useState<DBScanResult[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadReportsData = async () => {
      try {
        const reports = await ReportService.getReports(user.id);
        setReportsList(reports.map(r => ({
          name: r.name,
          date: r.date,
          size: r.size,
          id: r.id
        })));

        const scoreRecord = await storage.getLatestScore(user.id);
        setLatestScore(scoreRecord.overall_score);
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    };

    loadReportsData();
  }, [user]);

  useEffect(() => {
    if (!user || activeTab !== "scans") return;

    const loadScansData = async () => {
      setScansLoading(true);
      try {
        const list = await storage.getScans(user.id);
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
      const results = await storage.getScanResults(scan.id);
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
      
      const removals = await storage.getRemovalRequests(user.id);
      const scans = await storage.getScans(user.id);
      
      let scanResults: any[] = [];
      if (scans.length > 0) {
        // Query results of latest scan transaction
        scanResults = await storage.getScanResults(scans[0].id);
      }

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

      // Score
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("CURRENT PRIVORA INDEX", 14, 95);
      doc.line(14, 98, 196, 98);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`${latestScore}%`, 14, 112);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Total Shielding Factor (Higher = Less Digital Exposure)", 14, 118);

      // Active leaks
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("ACTIVE UNRESOLVED EXPOSURES", 14, 134);
      doc.line(14, 137, 196, 137);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      let yPos = 146;
      if (activeExposures.length === 0) {
        doc.text("Congratulations, you have zero active exposures. All brokers opt-outs have completed.", 14, yPos);
        yPos += 12;
      } else {
        activeExposures.forEach((ex, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. ${ex.broker_name}`, 14, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(`Status: ${ex.current_status.toUpperCase()} | Logs: ${ex.tracking_log[ex.tracking_log.length - 1] || "None"}`, 14, yPos + 5);
          yPos += 14;
        });
      }

      // Verified Scan findings
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("VERIFIED THREAT SCAN FINDINGS", 14, yPos);
      doc.line(14, yPos + 3, 196, yPos + 3);
      yPos += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      if (scanResults.length === 0) {
        doc.text("No active vulnerability threat findings verified on record.", 14, yPos);
      } else {
        scanResults.forEach((res, index) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont("helvetica", "bold");
          doc.text(`${index + 1}. [${res.severity.toUpperCase()}] ${res.broker_name}`, 14, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(`Detail: ${res.record_preview}`, 14, yPos + 5);
          yPos += 14;
        });
      }

      doc.save(`${name.toLowerCase().replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF Downloaded successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Could not compile jsPDF structure.");
    }
  };

  const handleGenerateReport = async () => {
    if (!user) return;
    try {
      const reportName = `Monthly Privacy Report — ${new Date().toLocaleString("en-US", { month: "long" })} ${new Date().getFullYear()}`;
      const size = "1.2 MB";
      const newRep = await ReportService.createReport(user.id, reportName, size);
      
      setReportsList(prev => [
        { name: newRep.name, date: newRep.date, size: newRep.size, id: newRep.id },
        ...prev
      ]);
      toast.success("New privacy report generated.");
    } catch {
      toast.error("Failed to generate report.");
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-heading">Reports Archive</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Download monthly privacy briefs and view historical scan tables.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/60 pb-px" role="tablist" aria-label="Reports Tabs">
        <button
          role="tab"
          aria-selected={activeTab === "reports"}
          onClick={() => setActiveTab("reports")}
          className={`px-5 py-2.5 text-xs font-semibold border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "reports"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Privacy Briefs
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "scans"}
          onClick={() => setActiveTab("scans")}
          className={`px-5 py-2.5 text-xs font-semibold border-b-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            activeTab === "scans"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Scanning History
        </button>
      </div>

      {/* Active Tab: Reports Briefs */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground">Generated PDF Summaries</h3>
            <Button
              onClick={handleGenerateReport}
              className="rounded-xl h-9 text-xs font-semibold px-4 bg-primary text-primary-foreground hover:bg-primary/95 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Generate Live Brief
            </Button>
          </div>

          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Brief Document Name</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Created Date</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">File Size</TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsList.map((rep) => (
                    <TableRow key={rep.id} className="border-border/20 hover:bg-muted/10">
                      <TableCell className="px-6 py-4 text-xs font-bold text-foreground">
                        <div className="flex items-center space-x-2.5">
                          <FileText size={15} className="text-primary" aria-hidden="true" />
                          <span>{rep.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-xs text-muted-foreground">{rep.date}</TableCell>
                      <TableCell className="px-6 py-4 text-xs text-muted-foreground font-mono">{rep.size}</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(rep.name)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Download report ${rep.name}`}
                        >
                          <Download size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportsList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                        No PDF reports found. Click Generate to compile your first brief.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Tab: Scanning History */}
      {activeTab === "scans" && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
            <CardContent className="p-0">
              {scansLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center space-x-2">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Loading history logs...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Triggered Time</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Scan Mode</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Criteria Hash</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Status</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scansList.map((scan) => (
                      <TableRow key={scan.id} className="border-border/20 hover:bg-muted/10">
                        <TableCell className="px-6 py-4 text-xs font-bold text-foreground">
                          <div className="flex items-center space-x-2.5">
                            <Calendar size={15} className="text-zinc-500" aria-hidden="true" />
                            <span>{new Date(scan.triggered_at).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-xs text-muted-foreground capitalize">{scan.scan_type}</TableCell>
                        <TableCell className="px-6 py-4 text-xs font-mono text-muted-foreground">{scan.search_criteria_hash}</TableCell>
                        <TableCell className="px-6 py-4 text-xs">
                          <Badge className={`border-0 rounded-full text-[9px] font-bold px-2 py-0.5 uppercase ${
                            scan.status === "completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                          }`}>
                            {scan.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewScanDetails(scan)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label={`View details of scan triggered at ${new Date(scan.triggered_at).toLocaleString()}`}
                          >
                            <Eye size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {scansList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                          No historical scans logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Details View Modal */}
      {selectedScan && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-[#09090B] border border-border/80 rounded-2xl w-full max-w-xl p-6 relative shadow-premium overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
              <h3 id="modal-title" className="text-sm font-bold text-foreground font-heading">
                Scan Details Index ({selectedScan.search_criteria_hash})
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedScan(null)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close details modal"
              >
                <X size={16} />
              </Button>
            </div>

            {modalLoading ? (
              <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                Retrieving exposure logs...
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {selectedScanResults.length > 0 ? (
                  <div className="divide-y divide-border/20">
                    {selectedScanResults.map((res) => (
                      <div key={res.id} className="py-2.5 flex justify-between items-start text-xs text-left">
                        <div>
                          <p className="font-bold text-foreground leading-normal">{res.broker_name}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">{res.record_preview}</span>
                        </div>
                        <Badge className={`border-0 rounded-full text-[8px] font-bold px-2 py-0.5 uppercase ${
                          res.severity === "high" ? "bg-destructive/10 text-destructive" : res.severity === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-cyan-500/10 text-cyan-600"
                        }`}>
                          {res.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center space-y-2">
                    <CheckCircle size={22} className="text-emerald-500" aria-hidden="true" />
                    <p>Clean scan check. Zero exposures discovered.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
