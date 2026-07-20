"use client";

import React, { useState, useEffect } from "react";
import { User, CreditCard, Bell, Shield, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { storage } from "@/lib/storage";
import { settingsSchema } from "@/lib/zod-schemas";

export function SettingsPanel() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [scanFrequency, setScanFrequency] = useState<"weekly" | "monthly" | "quarterly">("monthly");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reportDelivery, setReportDelivery] = useState(true);
  const [autopilot, setAutopilot] = useState(false);
  const [isAlertsSaving, setIsAlertsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      try {
        const userSettings = await storage.getSettings(user.id);
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
      await storage.saveSettings(user.id, {
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
      
      await storage.saveSettings(user.id, {
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
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-heading">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1.5">
          Manage your scan profiles, notifications, and subscription tiers.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        {/* Sub Navigation Tabs */}
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-[#18181B]/5 border border-border rounded-lg mb-6" aria-label="Settings categories">
          <TabsTrigger value="profile" className="text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary">
            <User size={14} className="mr-1.5" aria-hidden="true" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary">
            <CreditCard size={14} className="mr-1.5" aria-hidden="true" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary">
            <Bell size={14} className="mr-1.5" aria-hidden="true" />
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
                    className="bg-[#09090B]/5 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="homeAddress" className="text-xs font-semibold text-muted-foreground">Home Address Target</label>
                  <Input
                    id="homeAddress"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="E.g. 123 Main St, New York, NY"
                    className="bg-[#09090B]/5 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="phoneNumber" className="text-xs font-semibold text-muted-foreground">Phone Registry Target</label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g. 555-0199"
                    className="bg-[#09090B]/5 border-border h-10 rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl h-10 text-xs font-semibold px-5 mt-2 bg-primary text-primary-foreground hover:bg-primary/95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" aria-hidden="true" />
                      Saving changes...
                    </>
                  ) : (
                    "Save Changes"
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
              <CardTitle className="text-base font-bold text-foreground">Subscription Status</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Manage payment tokens and premium autopilot features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                <div className="space-y-1.5 text-left">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider block">Current Plan</span>
                  <p className="text-sm font-bold text-foreground flex items-center">
                    <Shield size={14} className="mr-1.5 text-primary" aria-hidden="true" />
                    Privora Shield Autopilot Pro
                  </p>
                  <span className="text-[10px] text-muted-foreground block leading-none">
                    Renews automatically on August 20, 2026 ($29/month).
                  </span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 rounded-full border-0 font-bold text-[9px] px-2.5 py-0.5">
                  ACTIVE
                </Badge>
              </div>

              <div className="border-t border-border pt-4 text-left">
                <h4 className="text-xs font-bold text-foreground mb-2">Stripe Billing Portal</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                  Access Stripe billing console to modify credit cards, download historical receipts, or cancel autopilot coverage.
                </p>
                <Button variant="outline" className="rounded-xl h-9 text-xs font-semibold px-4 border-border focus-visible:ring-2 focus-visible:ring-primary">
                  Open Billing Console
                  <ExternalLink size={12} className="ml-1.5 text-zinc-500" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Alerts preferences tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/60 bg-card rounded-[22px] shadow-premium max-w-2xl text-left">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground">Alert Preferences & Scheduler</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Define data scanning intervals and dashboard alerts frequencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAlertsSave} className="space-y-6">
                
                {/* Autopilot toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/40 rounded-xl">
                  <div className="space-y-0.5 text-left flex-1">
                    <label htmlFor="autopilot" className="text-xs font-bold text-foreground cursor-pointer">Autopilot Sync Coverage</label>
                    <p className="text-[10px] text-muted-foreground">Continuous data sweeps. Earns +10 to Privacy Index.</p>
                  </div>
                  <input
                    id="autopilot"
                    type="checkbox"
                    checked={autopilot}
                    onChange={(e) => setAutopilot(e.target.checked)}
                    className="h-4.5 w-4.5 accent-primary rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                {/* Scan Frequency */}
                <div className="space-y-1.5">
                  <label htmlFor="scanFrequency" className="text-xs font-semibold text-muted-foreground">Autopilot Interval</label>
                  <select
                    id="scanFrequency"
                    value={scanFrequency}
                    onChange={(e: any) => setScanFrequency(e.target.value)}
                    disabled={!autopilot}
                    className="w-full bg-[#09090B]/5 border border-border h-10 rounded-xl text-xs text-foreground px-3 focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="weekly">Weekly check (High security)</option>
                    <option value="monthly">Monthly check (Standard)</option>
                    <option value="quarterly">Quarterly check (Low cost)</option>
                  </select>
                </div>

                {/* Email Alert toggles */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-left flex-1">
                      <label htmlFor="emailAlerts" className="text-xs font-bold text-foreground cursor-pointer">Immediate Email Leaks Alerts</label>
                      <p className="text-[9px] text-muted-foreground leading-none mt-1">Receive warning emails when new broker listings match profile.</p>
                    </div>
                    <input
                      id="emailAlerts"
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="h-4 w-4 accent-primary rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/30 pt-3">
                    <div className="text-left flex-1">
                      <label htmlFor="reportDelivery" className="text-xs font-bold text-foreground cursor-pointer">Monthly PDF Briefs Delivery</label>
                      <p className="text-[9px] text-muted-foreground leading-none mt-1">Receive monthly compiled PDF archives in your inbox.</p>
                    </div>
                    <input
                      id="reportDelivery"
                      type="checkbox"
                      checked={reportDelivery}
                      onChange={(e) => setReportDelivery(e.target.checked)}
                      className="h-4 w-4 accent-primary rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isAlertsSaving}
                  className="rounded-xl h-10 text-xs font-semibold px-5 mt-2 bg-primary text-primary-foreground hover:bg-primary/95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {isAlertsSaving ? (
                    <>
                      <Loader2 size={14} className="mr-2 animate-spin" aria-hidden="true" />
                      Saving preferences...
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
  );
}
