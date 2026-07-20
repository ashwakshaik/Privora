"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, ArrowRight, CheckCircle2, Loader2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { checkRateLimit } from "@/lib/rate-limiter";

interface FindingItem {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendation: string;
}

interface ScanResultResponse {
  provider: string;
  status: "success" | "error";
  score: number;
  severity: string;
  findings: FindingItem[];
  metadata: Record<string, any>;
}

export function ScanConsole() {
  const { user } = useAuth();
  const [scanType, setScanType] = useState<"email" | "website" | "domain" | "password">("email");
  const [queryVal, setQueryVal] = useState("");

  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("");
  const [overallScore, setOverallScore] = useState(100);
  const [overallSeverity, setOverallSeverity] = useState("low");
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [aiBrief, setAiBrief] = useState<{ summary: string; recommendations: string[] } | null>(null);

  // Scan Rating Feedback States
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const submitFeedback = async () => {
    if (!user || rating === 0) return;
    setSubmittingFeedback(true);
    try {
      const res = await fetch("/api/feedback/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          scanId: "manual_scan",
          rating,
          comment,
          helpful: helpful !== null ? helpful : undefined
        })
      });

      if (!res.ok) throw new Error("Could not log rating feedback.");
      toast.success("Feedback submitted. Thank you!");
      setRating(0);
      setComment("");
      setHelpful(null);
    } catch (err: any) {
      toast.error(err.message || "Feedback submittal failed.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryVal.trim()) {
      toast.error("Please enter a target query to scan.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to execute scans.");
      return;
    }

    // Rate limits verification: max 5 scans per minute
    const limit = checkRateLimit(`scan_query_${user.id}`, 5, 60000);
    if (!limit.success) {
      const wait = Math.ceil((limit.reset - Date.now()) / 1000);
      toast.error(`Rate limit reached. Please wait ${wait} seconds.`);
      return;
    }

    setScanState("scanning");
    setScanProgress(10);
    setCurrentLog("Querying search cache directories...");

    // Simulated progress logs
    const logs = [
      "Contacting security API nodes...",
      "Retrieving compromise metadata databases...",
      "Resolving WHOIS bootstrap registrations...",
      "Analyzing SSL certificate chains...",
      "Validating host SPF and DMARC alignments...",
      "Querying phishing threat matrices...",
      "Aggregating Risk Index counts..."
    ];

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (currentStep < logs.length) {
        setCurrentLog(logs[currentStep]);
        setScanProgress((prev) => Math.min(prev + 12, 90));
        currentStep++;
      }
    }, 450);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: scanType,
          target: queryVal,
          userId: user.id
        })
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Execution error encountered.");
      }

      const payload = await res.json();

      setScanProgress(100);
      setOverallScore(payload.score);
      setOverallSeverity(payload.severity);
      
      const allFindings = (payload.results || []).flatMap((r: ScanResultResponse) => r.findings);
      setFindings(allFindings);
      setAiBrief(payload.aiBrief);
      setScanState("completed");
      toast.success("Security sweep complete.");
    } catch (err: any) {
      clearInterval(progressInterval);
      setScanState("idle");
      toast.error(err.message || "Threat scan failed.");
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-heading">Privacy & Threat Scan</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Scan Emails, Websites, Domains, and Passwords against real-world threat directories.
        </p>
      </div>

      {/* Mode Selectors */}
      {scanState === "idle" && (
        <div className="flex space-x-1 border-b border-border" role="tablist" aria-label="Scan types">
          {(["email", "website", "domain", "password"] as const).map((type) => (
            <button
              key={type}
              role="tab"
              aria-selected={scanType === type}
              onClick={() => {
                setScanType(type);
                setQueryVal("");
              }}
              className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                scanType === type
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {type} Check
            </button>
          ))}
        </div>
      )}

      {/* Input console */}
      {scanState === "idle" && (
        <Card className="border-border/60 bg-card rounded-[22px] shadow-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">
              {scanType === "email" && "Scan Email Breaches"}
              {scanType === "website" && "Verify Website Reputation & SSL"}
              {scanType === "domain" && "Check Domain DNS & WHOIS"}
              {scanType === "password" && "Check Password Leaks"}
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              {scanType === "email" && "Finds compromised email configurations."}
              {scanType === "website" && "Detects phishing, malware, and SSL configuration issues."}
              {scanType === "domain" && "Validates SPF/DMARC policies and registration history."}
              {scanType === "password" && "Secure k-anonymity leakage verification."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScanSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="queryInput" className="text-xs font-semibold text-muted-foreground">
                  {scanType === "email" && "Target Email Address"}
                  {scanType === "website" && "Website Address (URL)"}
                  {scanType === "domain" && "Domain Name"}
                  {scanType === "password" && "Secret Password"}
                </label>
                <Input
                  id="queryInput"
                  type={scanType === "password" ? "password" : "text"}
                  value={queryVal}
                  onChange={(e) => setQueryVal(e.target.value)}
                  placeholder={
                    scanType === "email" ? "user@example.com" :
                    scanType === "website" ? "https://example.com" :
                    scanType === "domain" ? "example.com" : "Enter a password"
                  }
                  className="bg-muted/20 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl mt-6 border-0 shadow-lg shadow-primary/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                Scan Target
                <ArrowRight size={16} className="ml-2" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Progress Loader */}
      {scanState === "scanning" && (
        <Card className="border-border/60 bg-card rounded-[22px] shadow-premium p-8 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
            <Loader2 size={28} className="text-primary animate-spin" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">Running Security Scan...</h3>
            <p className="text-xs text-muted-foreground truncate px-4">{currentLog}</p>
          </div>
          <div className="space-y-2.5 max-w-sm mx-auto">
            <Progress value={scanProgress} className="h-2 bg-muted/40 rounded-full" />
            <span className="text-[10px] font-mono text-zinc-500 font-bold block">{scanProgress}% COMPLETE</span>
          </div>
        </Card>
      )}

      {/* Results View */}
      {scanState === "completed" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Index summary banner */}
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-destructive via-amber-500 to-emerald-500" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <CheckCircle2 size={18} className="text-emerald-500" aria-hidden="true" />
                  <h3 className="text-base font-bold text-foreground">Scan Finished</h3>
                </div>
                <p className="text-xs text-muted-foreground max-w-md">
                  We completed live query checks for <strong className="text-foreground">{queryVal}</strong>. The unified security perimeter status is evaluated below.
                </p>
              </div>

              {/* Index Score Badge */}
              <div className="h-24 w-24 rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center relative shadow-inner">
                <div className={`h-20 w-20 rounded-full border-4 bg-card flex flex-col items-center justify-center ${
                  overallSeverity === "critical" || overallSeverity === "high" ? "border-destructive" :
                  overallSeverity === "medium" ? "border-amber-500" : "border-emerald-500"
                }`}>
                  <span className="text-lg font-black text-foreground">{overallScore}%</span>
                  <span className="text-[8px] text-zinc-500 font-bold uppercase mt-0.5 leading-none">Index</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Security Brief */}
          {aiBrief && (
            <Card className="border-border/60 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-[22px] shadow-premium p-6 text-left">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles size={16} className="text-primary animate-pulse" aria-hidden="true" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">AI Security Guidelines</h3>
              </div>
              <p className="text-xs text-foreground leading-relaxed mb-4">{aiBrief.summary}</p>
              <div className="space-y-2">
                {aiBrief.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-muted-foreground">
                    <ShieldCheck size={14} className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Findings Table */}
          {findings.length > 0 ? (
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm font-bold text-foreground">Identified Exposures</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">Exposed directories displaying personal data on search indexes.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Vulnerability Type</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Description</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6 text-right">Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.map((finding, index) => (
                      <TableRow key={index} className="border-border/20 hover:bg-muted/10">
                        <TableCell className="px-6 py-4 text-xs font-bold text-foreground">{finding.type}</TableCell>
                        <TableCell className="px-6 py-4 text-xs text-muted-foreground">{finding.description}</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Badge className={`border-0 rounded-full text-[9px] font-bold px-2.5 py-0.5 uppercase ${
                            finding.severity === "critical" || finding.severity === "high" 
                              ? "bg-destructive/10 text-destructive" 
                              : finding.severity === "medium" 
                                ? "bg-amber-500/10 text-amber-600" 
                                : "bg-cyan-500/10 text-cyan-600"
                          }`}>
                            {finding.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Perimeter Fully Secured</h3>
                <p className="text-xs text-muted-foreground">Active scans resolved zero vulnerability triggers.</p>
              </div>
            </Card>
          )}

          {/* Scan Results Rating Form */}
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Rate Scan Results</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs text-muted-foreground">How accurate was this scan?</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-base focus-visible:ring-2 focus-visible:ring-primary cursor-pointer transition-colors border-0 bg-transparent ${
                        rating >= star ? "text-amber-500" : "text-zinc-600 hover:text-amber-400"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-xs text-muted-foreground">Was this report helpful?</span>
                <button
                  type="button"
                  onClick={() => setHelpful(true)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    helpful === true ? "bg-emerald-500/10 text-emerald-500 border-emerald-500" : "border-border text-muted-foreground bg-transparent"
                  }`}
                >
                  Yes, helpful
                </button>
                <button
                  type="button"
                  onClick={() => setHelpful(false)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition-all ${
                    helpful === false ? "bg-destructive/10 text-destructive border-destructive" : "border-border text-muted-foreground bg-transparent"
                  }`}
                >
                  No, incorrect
                </button>
              </div>

              <div className="space-y-1.5">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us how we can improve this threat analysis..."
                  className="w-full bg-muted/20 border border-border rounded-xl p-3 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  rows={2}
                />
              </div>

              <Button
                onClick={submitFeedback}
                disabled={rating === 0 || submittingFeedback}
                className="h-9 px-4 bg-primary text-white text-xs font-semibold rounded-xl border-0 cursor-pointer"
              >
                {submittingFeedback ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => setScanState("idle")}
              variant="outline"
              className="rounded-xl h-11 text-xs font-semibold px-6 border-border focus-visible:ring-2 focus-visible:ring-primary"
            >
              Perform another scan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
