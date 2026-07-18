"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, EyeOff, Server, FileCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-foreground relative overflow-hidden bg-aurora py-16 px-4 sm:px-6 lg:px-8">
      {/* Background ambient glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">
        {/* Back navigation */}
        <Link href="/sign-in" className="inline-flex items-center space-x-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </Link>

        {/* Brand Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">privora</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-foreground font-heading tracking-tight mb-3 text-left">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground mb-10 text-left">
          Last Updated: July 17, 2026. Effective Date: Immediate.
        </p>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
          <div className="bg-card border border-border/60 p-4 rounded-xl shadow-premium">
            <div className="flex items-center space-x-2.5 mb-2">
              <Lock className="text-primary h-4.5 w-4.5" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Zero Knowledge Sync</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We encrypt all search queries client-side. Your inputs are never stored in plain text or shared with directory brokers.
            </p>
          </div>
          <div className="bg-card border border-border/60 p-4 rounded-xl shadow-premium">
            <div className="flex items-center space-x-2.5 mb-2">
              <EyeOff className="text-secondary h-4.5 w-4.5" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">No Data Selling</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Privora does not sell, trade, or monetize your search profiles or personal descriptors. Our business model is subscription-only.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-left text-xs leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <Server className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">1. Information We Collect</h2>
            </div>
            <p>
              When you use our Privacy Scan, we collect the search parameters you input: First Name, Last Name, City, State, and Email Address. This information is processed in real time solely to query data broker databases.
            </p>
            <p>
              Additionally, we store account settings, opt-out request histories, and activity logs to support dashboard sync interfaces.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <Lock className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">2. How We Secure Your Data</h2>
            </div>
            <p>
              We enforce end-to-end security measures. Raw query names are hashed using cryptographic hashes before index submissions. All database states are secured by Row Level Security (RLS) policies in Supabase, preventing cross-tenant information access.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileCheck className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">3. Deletion Rights (GDPR / CCPA)</h2>
            </div>
            <p>
              You maintain full ownership of your data. You can delete your account, removal records, and search histories at any time through your settings panel. This immediately purges all corresponding entries from our tables.
            </p>
          </section>
        </div>

        {/* Footer legal note */}
        <div className="border-t border-border/80 pt-8 mt-12 text-center text-[10px] text-muted-foreground">
          <span>© 2026 Privora Inc. All rights reserved. </span>
          <Link href="/terms" className="text-primary hover:underline ml-2">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
