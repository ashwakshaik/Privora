"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { ScanService } from "@/services/ScanService";
import { checkRateLimit } from "@/lib/rate-limiter";

interface ScanResultItem {
  broker_name: string;
  severity: "high" | "medium" | "low";
  record_preview: string;
  matched: string;
}

export function ScanConsole() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [scanState, setScanState] = useState<"idle" | "scanning" | "completed">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("");
  const [results, setResults] = useState<ScanResultItem[]>([]);
  const [score, setScore] = useState(100);

  const runMockScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please fill in first and last name fields.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to perform a scan.");
      return;
    }

    // Rate Limit check: Max 3 scans per minute
    const rateLimit = checkRateLimit(user.id, 3, 60000);
    if (!rateLimit.success) {
      const waitTime = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      toast.error(`Rate limit exceeded. Please wait ${waitTime} seconds before initiating another scan.`);
      return;
    }

    setScanState("scanning");
    setScanProgress(0);
    setResults([]);

    try {
      // Call ScanService (Issue 8)
      const scanOutput = await ScanService.runScan(
        user.id,
        firstName,
        lastName,
        city,
        state,
        user.email,
        (log, progress) => {
          setCurrentLog(log);
          setScanProgress(progress);
        }
      );

      const mappedResults: ScanResultItem[] = scanOutput.results.map((r: any) => ({
        broker_name: r.broker_name,
        severity: r.severity,
        record_preview: r.record_preview,
        matched: r.severity === "high" 
          ? (r.record_preview.includes("St") ? "Primary Home Address" : "Contact Phone Number")
          : (r.record_preview.includes("@") ? "Contact Email Address" : "Associated Relative Record")
      }));

      setResults(mappedResults);
      setScore(scanOutput.score);
      setScanState("completed");
      toast.success(`Privacy scan completed. ${scanOutput.exposuresFound} exposures found.`);
    } catch (err: unknown) {
      setScanState("idle");
      if (err instanceof Error) {
        if (err.name === "ZodError" || "issues" in err) {
          const zodErr = err as unknown as { issues: Array<{ message: string }> };
          const messages = zodErr.issues.map((i) => i.message).join(" ");
          toast.error(messages);
        } else {
          toast.error(err.message || "Scan execution failed. Please check network logs.");
        }
      } else {
        toast.error("Scan execution failed. Please check network logs.");
      }
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-heading">Privacy Scan</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Search 80+ data brokers to locate exposed personal directories.
        </p>
      </div>

      {/* Form State */}
      {scanState === "idle" && (
        <Card className="border-border/60 bg-card max-w-2xl mx-auto rounded-[22px] shadow-premium">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Search Criteria</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground">
              Submit basic query attributes. Search intent is encrypted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={runMockScan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground">First Name</label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="bg-muted/20 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground">Last Name</label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="bg-muted/20 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label htmlFor="city" className="text-xs font-semibold text-muted-foreground">City (Optional)</label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Los Angeles"
                    className="bg-muted/20 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-xs font-semibold text-muted-foreground">State (Optional)</label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    className="bg-muted/20 border-border h-10 rounded-xl uppercase focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl mt-6 border-0 shadow-lg shadow-primary/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                Scan exposed records
                <ArrowRight size={16} className="ml-2" aria-hidden="true" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Progress Scanning State */}
      {scanState === "scanning" && (
        <Card className="border-border/60 bg-card max-w-xl mx-auto rounded-[22px] shadow-premium p-8 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-sm">
            <Loader2 size={28} className="text-primary animate-spin" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-foreground">Searching Registries...</h3>
            <p className="text-xs text-muted-foreground truncate px-4">{currentLog}</p>
          </div>
          <div className="space-y-2.5 max-w-sm mx-auto">
            <Progress value={scanProgress} className="h-2 bg-muted/40 rounded-full" />
            <span className="text-[10px] font-mono text-zinc-500 font-bold block">{scanProgress}% COMPLETE</span>
          </div>
        </Card>
      )}

      {/* Completed State */}
      {scanState === "completed" && (
        <div className="space-y-8 animate-fade-in">
          {/* Results Summary Card */}
          <Card className="border-border/60 bg-card max-w-3xl mx-auto rounded-[22px] shadow-premium relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-destructive via-amber-500 to-emerald-500" />
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <CheckCircle2 size={18} className="text-emerald-500" aria-hidden="true" />
                  <h3 className="text-base font-bold text-foreground">Scan Complete</h3>
                </div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Privora has discovered {results.length} exposed record directories across 85 data brokers. Autopilot removal is recommended.
                </p>
              </div>

              {/* Dynamic Score indicator */}
              <div className="h-24 w-24 rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center relative shadow-inner">
                <div className="h-20 w-20 rounded-full border-4 border-destructive bg-card flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-foreground">{score}%</span>
                  <span className="text-[8px] text-destructive font-bold uppercase mt-0.5 leading-none">Score</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exposures Table */}
          {results.length > 0 ? (
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm font-bold text-foreground">Identified Exposures</CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground">Exposed directories displaying personal data on search indexes.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Data Broker</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Exposure Node</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6">Exposed Preview</TableHead>
                      <TableHead className="text-xs font-bold text-muted-foreground h-11 px-6 text-right">Risk Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((res, index) => (
                      <TableRow key={index} className="border-border/20 hover:bg-muted/10">
                        <TableCell className="px-6 py-4 text-xs font-bold text-foreground">{res.broker_name}</TableCell>
                        <TableCell className="px-6 py-4 text-xs text-muted-foreground">{res.matched}</TableCell>
                        <TableCell className="px-6 py-4 text-xs font-mono text-muted-foreground">{res.record_preview}</TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Badge className={`border-0 rounded-full text-[9px] font-bold px-2.5 py-0.5 uppercase ${
                            res.severity === "high" ? "bg-destructive/10 text-destructive" : res.severity === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-cyan-500/10 text-cyan-600"
                          }`}>
                            {res.severity}
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
                <CheckCircle2 size={20} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">No exposures found</h3>
                <p className="text-xs text-muted-foreground">Your digital footprint is completely shielded on major brokers databases.</p>
              </div>
            </Card>
          )}

          {/* Action triggers */}
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
