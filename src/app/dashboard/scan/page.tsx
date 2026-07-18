"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { runPrivacyScan } from "@/lib/scan-engine";
import { db } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limiter";

interface ScanResultItem {
  broker_name: string;
  severity: "high" | "medium" | "low";
  record_preview: string;
  matched: string;
}

export default function PrivacyScanPage() {
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
      const scanOutput = await runPrivacyScan(
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

      // Map to view-compatible structure
      const mappedResults: ScanResultItem[] = scanOutput.results.map((r: { broker_name: string; severity: "high" | "medium" | "low"; record_preview: string }) => ({
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
    <DashboardShell>
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
                      className="bg-muted/20 border-border h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground">Last Name</label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="bg-muted/20 border-border h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="city" className="text-xs font-semibold text-muted-foreground">City</label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Los Angeles"
                      className="bg-muted/20 border-border h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="state" className="text-xs font-semibold text-muted-foreground">State</label>
                    <Input
                      id="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      maxLength={2}
                      className="bg-muted/20 border-border h-10 rounded-xl uppercase"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90 font-semibold shadow-premium">
                  <Search size={15} className="mr-2" />
                  Initiate Search Scan
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Scanning State */}
        {scanState === "scanning" && (
          <Card className="border-border/60 bg-card max-w-2xl mx-auto rounded-[22px] shadow-premium py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="space-y-3 w-full max-w-md">
                <h3 className="text-base font-bold text-foreground">Scanning Broker Databases...</h3>
                <Progress value={scanProgress} className="h-2 w-full bg-muted rounded-full" />
                <p className="text-[10px] text-primary font-mono mt-2 animate-pulse">{currentLog}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed State */}
        {scanState === "completed" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-destructive/5 border border-destructive/10 rounded-2xl p-5">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-destructive/10 text-destructive rounded-full">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Vulnerabilities Identified</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {results.length} profiles matching your parameters were found. Privacy Score is {score}%.
                  </p>
                </div>
              </div>
              <Button onClick={() => setScanState("idle")} variant="outline" size="sm" className="h-9 rounded-xl border-border text-foreground hover:bg-muted/50">
                Scan Again
              </Button>
            </div>

            {/* Results Table */}
            <Card className="border-border/60 bg-card rounded-[22px] overflow-hidden shadow-premium">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-[#18181B]/5 hover:bg-muted/10">
                      <TableHead className="text-zinc-500 text-xs font-semibold py-3 px-6">Broker</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold">Severity</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold">Data Exposed</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold">Exposed Preview</TableHead>
                      <TableHead className="text-zinc-500 text-xs font-semibold text-right pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((res, idx) => (
                      <TableRow key={idx} className="border-b border-border hover:bg-muted/10">
                        <TableCell className="font-bold text-foreground py-4 px-6">{res.broker_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              res.severity === "high"
                                ? "destructive"
                                : "secondary"
                            }
                            className="rounded-full text-[9px] font-bold px-2 py-0.5 uppercase"
                          >
                            {res.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{res.matched}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{res.record_preview}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button
                            size="sm"
                            className="h-8 text-xs rounded-xl shadow-sm bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90 font-semibold"
                            onClick={async () => {
                              try {
                                if (user) {
                                  await db.updateRemovalRequestStatus(
                                    user.id,
                                    res.broker_name,
                                    "processing",
                                    "Removal authorized by user. Opt-out transmission queued."
                                  );
                                  toast.success(`Opt-out request queued for ${res.broker_name}.`);
                                }
                              } catch (e) {
                                toast.error("Failed to authorize removal request.");
                              }
                            }}
                          >
                            Queue Removal
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
