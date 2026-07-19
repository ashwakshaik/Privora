"use client";

import React, { useState, useEffect } from "react";
import { User, CreditCard, Bell, Shield, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardShell } from "@/components/shared/dashboard-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { db } from "@/lib/supabase";
import { settingsSchema } from "@/lib/zod-schemas";

export default function SettingsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Scheduler & Alert Preferences States
  const [scanFrequency, setScanFrequency] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reportDelivery, setReportDelivery] = useState(true);
  const [autopilot, setAutopilot] = useState(false);
  const [isAlertsSaving, setIsAlertsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      try {
        const userSettings = await db.getSettings(user.id);
        setEmail(userSettings.scan_email || user.email);
        setAddress(userSettings.home_address || "");
        setPhone(userSettings.phone_number || "");
        setScanFrequency(userSettings.scan_frequency || "monthly");
        setEmailAlerts(userSettings.email_alerts_enabled !== false);
        setReportDelivery(userSettings.report_delivery_enabled !== false);
        setAutopilot(userSettings.autopilot_enabled || false);
      } catch (err) {
        console.error("Failed to load user settings:", err);
      }
    };

    loadSettings();
  }, [user]);

  const handleAlertsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsAlertsSaving(true);
    try {
      await db.saveSettings(user.id, {
        autopilot_enabled: autopilot,
        scan_frequency: scanFrequency,
        email_alerts_enabled: emailAlerts,
        report_delivery_enabled: reportDelivery,
      });
      toast.success("Alert preferences and scheduler updated.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save alert preferences.");
    } finally {
      setIsAlertsSaving(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      settingsSchema.parse({ scan_email: email, home_address: address, phone_number: phone });
      
      await db.saveSettings(user.id, {
        scan_email: email,
        home_address: address,
        phone_number: phone
      });
      toast.success("Profile attributes updated successfully.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "ZodError" || "issues" in err) {
          const zodErr = err as unknown as { issues: Array<{ message: string }> };
          const messages = zodErr.issues.map((i) => i.message).join(" ");
          toast.error(messages);
        } else {
          toast.error(err.message || "Failed to save profile attributes.");
        }
      } else {
        toast.error("Failed to save profile attributes.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-heading">Settings</h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Manage your scan profiles, notifications, and subscription tiers.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          {/* Sub Navigation Tabs */}
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-[#18181B]/5 border border-border rounded-lg mb-6">
            <TabsTrigger value="profile" className="text-xs font-semibold">
              <User size={14} className="mr-1.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="text-xs font-semibold">
              <CreditCard size={14} className="mr-1.5" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs font-semibold">
              <Bell size={14} className="mr-1.5" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* 1. Profile Tab Content */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium max-w-2xl text-left">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Privacy Search Profile</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Parameters used in data search queries. Hashed before submission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="scanEmail" className="text-xs font-semibold text-muted-foreground">Scan Target Email</label>
                    <Input
                      id="scanEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#09090B]/5 border-border h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="homeAddress" className="text-xs font-semibold text-muted-foreground">Verification Home Address</label>
                    <Input
                      id="homeAddress"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-[#09090B]/5 border-border h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phoneNumber" className="text-xs font-semibold text-muted-foreground">Verification Phone Number</label>
                    <Input
                      id="phoneNumber"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#09090B]/5 border-border h-10 rounded-xl"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="h-10 mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90 font-semibold shadow-premium">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. Billing Tab Content */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium max-w-2xl text-left">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Subscription Plan</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Monitor billing periods and invoices sync via Stripe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 border border-primary/20 bg-primary/5 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Active Plan: Privora Pro Autopilot</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">$19/mo billed monthly</p>
                  </div>
                  <span className="text-[9px] bg-primary text-white font-bold px-2 py-0.5 rounded uppercase">
                    Paid
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-foreground">Stripe Portal Controls</h4>
                  <Button
                    onClick={() => {
                      toast.success("Redirecting to Stripe portal sandbox...");
                    }}
                    variant="outline"
                    className="h-9 text-xs rounded-xl border-border text-foreground hover:bg-muted/50"
                  >
                    Open Billing Portal
                    <ExternalLink size={12} className="ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Notifications Tab Content */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/60 bg-card rounded-[22px] shadow-premium max-w-2xl text-left">
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">Scan Scheduler & Alert Preferences</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Toggle automated scanning, scan frequencies, and email notification parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAlertsSave} className="space-y-6">
                  {/* Autopilot Checkbox */}
                  <div className="flex items-start space-x-3 py-1">
                    <input
                      id="autopilotCheckbox"
                      type="checkbox"
                      checked={autopilot}
                      onChange={(e) => setAutopilot(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-zinc-200 bg-[#09090B]/5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <label htmlFor="autopilotCheckbox" className="text-xs font-bold text-foreground cursor-pointer">Enable Autopilot Mode</label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Authorizes Privora to automatically query databases and submit deletions continuously.
                      </p>
                    </div>
                  </div>

                  {/* Scan Frequency */}
                  <div className="space-y-1.5 max-w-xs">
                    <label htmlFor="scanFrequencySelect" className="text-xs font-semibold text-muted-foreground">Automatic Scan Frequency</label>
                    <select
                      id="scanFrequencySelect"
                      value={scanFrequency}
                      disabled={!autopilot}
                      onChange={(e) => setScanFrequency(e.target.value as "weekly" | "monthly" | "quarterly")}
                      className="w-full bg-[#09090B]/5 border border-border rounded-xl h-10 px-3 text-xs text-foreground focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="weekly">Weekly Sweep Scan</option>
                      <option value="monthly">Monthly Sweep Scan</option>
                      <option value="quarterly">Quarterly Sweep Scan</option>
                    </select>
                  </div>

                  {/* Email Exposure Alerts */}
                  <div className="flex items-start space-x-3 py-1 border-t border-border/40 pt-4">
                    <input
                      id="emailAlertsCheckbox"
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-zinc-200 bg-[#09090B]/5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <label htmlFor="emailAlertsCheckbox" className="text-xs font-bold text-foreground cursor-pointer">Email New Exposure Alerts</label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Send a message when scan cycles find your PII on a new broker registry.
                      </p>
                    </div>
                  </div>

                  {/* Report Delivery */}
                  <div className="flex items-start space-x-3 py-1">
                    <input
                      id="reportDeliveryCheckbox"
                      type="checkbox"
                      checked={reportDelivery}
                      onChange={(e) => setReportDelivery(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-zinc-200 bg-[#09090B]/5 text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <label htmlFor="reportDeliveryCheckbox" className="text-xs font-bold text-foreground cursor-pointer">Monthly PDF Reports Delivery</label>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Dispatch transactional email with secure download link when reports are ready.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" disabled={isAlertsSaving} className="h-10 mt-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white border-0 hover:opacity-90 font-semibold shadow-premium">
                    {isAlertsSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Preferences...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
