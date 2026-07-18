"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Scale, ShieldAlert, Cpu, HeartHandshake } from "lucide-react";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-xs text-muted-foreground mb-10 text-left">
          Last Updated: July 17, 2026. Effective Date: Immediate.
        </p>

        {/* Highlight Banner */}
        <div className="bg-card border border-border/60 p-4 rounded-xl shadow-premium text-left mb-8 flex items-start space-x-3">
          <ShieldAlert className="text-primary h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Agency Authorization</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By requesting an opt-out deletion in the Removal Center, you authorize Privora to act as your authorized representative to submit data removal requests to data brokers on your behalf.
            </p>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="space-y-8 text-left text-xs leading-relaxed text-muted-foreground">
          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <Scale className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">1. Agreement to Terms</h2>
            </div>
            <p>
              By registering an account and using the scanning portal, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must refrain from accessing the site or creating credentials.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">2. Scope of Services</h2>
            </div>
            <p>
              Privora operates scanning protocols to identify public directory exposures and submits manual/automated opt-out notifications. You acknowledge that Privora does not control the target registries. Data brokers operate independently and may reject, delay, or demand additional identity verifications.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <HeartHandshake className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">3. Limitations of Liability</h2>
            </div>
            <p>
              Privora provides services on an &quot;as is&quot; and &quot;as available&quot; basis. Under no circumstances will Privora be liable for damages resulting from data broker re-exposure listings, registry delays, or third-party registry vulnerabilities.
            </p>
          </section>
        </div>

        {/* Footer legal note */}
        <div className="border-t border-border/80 pt-8 mt-12 text-center text-[10px] text-muted-foreground">
          <span>© 2026 Privora Inc. All rights reserved. </span>
          <Link href="/privacy" className="text-primary hover:underline ml-2">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
