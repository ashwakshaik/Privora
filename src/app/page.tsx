"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  CheckCircle,
  Eye,
  Lock,
  Trash2,
  ChevronDown,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default function Home() {
  const [emailInput, setEmailInput] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const features = [
    {
      icon: Shield,
      title: "Digital Privacy Twin",
      description:
        "Creates a digital twin of your privacy posture, mapping score histories, breach timelines, and security improvements over time.",
    },
    {
      icon: Search,
      title: "Continuous Sweep Engine",
      description:
        "Automated daily checking across active domains, email breach registries, SSL expiry alerts, and reputation databases.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Diagnostics",
      description:
        "Provides actionable diagnostic resolutions for SPF/DMARC flags, password exposures, and zero-day threat advisories.",
    },
    {
      icon: Lock,
      title: "Secret Credentials Scanner",
      description:
        "Identifies Firebase configurations, AWS keys, Google API credentials, and committed .env configurations inside repositories.",
    },
    {
      icon: CheckCircle,
      title: "Gamified Privacy Journeys",
      description:
        "Earn achievements (like Privacy Expert) as you implement recommended security fixes and lift your privacy score.",
    },
    {
      icon: Eye,
      title: "Browser Shield Extension",
      description:
        "Extension pops displaying SSL configuration grades, Safe Browsing reputations, and full-page phishing overrides.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Map Your Digital Twin",
      description: "Initialize your posture profile mapping email indices and active domains.",
    },
    {
      num: "02",
      title: "Diagnose Real-time Scores",
      description: "Analyze live indicators covering DMARC, SSL handshakes, and leaked password databases.",
    },
    {
      num: "03",
      title: "Automate Protection",
      description: "Enable daily scheduler cron sweeps, continuous monitoring, and instant alert workflows.",
    },
  ];

  const faqs = [
    {
      q: "What is a data broker?",
      a: "Data brokers are companies that scrape and collect personal profiles (addresses, phone numbers, connections, property files) from public records and retail sources to package and resell them online.",
    },
    {
      q: "How does Privora automate removals?",
      a: "Privora identifies which brokers host your data and submits official opt-out forms under privacy legislations (like CCPA/GDPR), completing verifications automatically.",
    },
    {
      q: "How long do removals take to resolve?",
      a: "Most brokers remove records within 7 to 14 days of receiving opt-out requests, though compliance times can vary by broker.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden bg-gradient-to-b from-card/30 via-background to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tag badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-6"
            >
              <Sparkles size={12} />
              <span>Privora Autopilot v1.0 Launch</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-muted-foreground max-w-4xl mx-auto leading-tight"
            >
              The AI-Powered Digital Privacy Operating System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed"
            >
              Privora continuously monitors, analyzes, protects, and improves your online privacy. Map your Digital Twin to track score evolutions and secure leaks automatically.
            </motion.p>

            {/* Email form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter email to build your Digital Twin"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="h-11 rounded-lg border-input"
              />
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button className="h-11 w-full sm:w-auto shadow-lg shadow-primary/10">
                  Deploy Digital Twin
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* 2. Dashboard Preview Mock */}
        <section className="py-12 bg-background border-y border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
              className="border border-border bg-card rounded-xl p-6 shadow-2xl"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-mono text-muted-foreground">PRIVORA SHIELD ACTIVE: MONITORING DIGITAL TWIN</span>
                </div>
                <div className="flex space-x-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
                {/* Score Widget */}
                <div className="border border-border rounded-lg p-5 bg-background flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Privacy Index</span>
                  <div className="h-28 w-28 rounded-full border-4 border-dashed border-emerald-500/20 flex items-center justify-center mt-3 animate-spin-slow">
                    <div className="h-24 w-24 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-card">
                      <span className="text-2xl font-extrabold text-foreground">95%</span>
                      <span className="text-[9px] text-emerald-500 font-semibold">Protected</span>
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div className="md:col-span-2 border border-border rounded-lg p-5 bg-background space-y-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Security Diagnostics</span>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                      <span className="text-foreground font-semibold">SSL Certificate Verification</span>
                      <span className="text-emerald-500">[ PASS - Grade A+ ]</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                      <span className="text-foreground font-semibold">DNS SPF & DMARC Alignment</span>
                      <span className="text-emerald-500">[ PASS ]</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                      <span className="text-foreground font-semibold">HIBP Credential Leaks Scan</span>
                      <span className="text-emerald-500">[ 0 Exposed Registries ]</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section id="features" className="py-20 md:py-28 bg-card/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The Privacy Operating System Modules
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
              Deploying 20 core security intelligence modules to map, monitor, and shield your online footprint.
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left"
            >
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card className="border border-border/80 bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 h-full">
                      <CardContent className="p-6 space-y-4">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg w-fit">
                          <Icon size={20} />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 4. How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Opt-out Automation Process
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
              How Privora retrieves, matches, and requests deletes of exposed directories.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
              {steps.map((step, idx) => (
                <div key={idx} className="relative space-y-4 p-6 border border-border/40 rounded-xl bg-card/10">
                  <div className="text-3xl font-extrabold text-primary/10 font-mono absolute top-4 right-6">
                    {step.num}
                  </div>
                  <h3 className="text-base font-semibold text-foreground pt-4">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. FAQ Section */}
        <section id="faq" className="py-20 bg-card/10 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-center text-foreground sm:text-4xl">
              Common Inquiries
            </h2>

            <div className="mt-12 space-y-4">
              {faqs.map((faq, idx) => {
                const isActive = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-border rounded-lg bg-card/40 overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setActiveFaq(isActive ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`text-muted-foreground transition-transform duration-200 ${
                          isActive ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isActive && (
                      <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-background to-card/20 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Secure Your Online Perimeter Today
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Build your digital twin and configure daily security monitoring checks across your digital assets.
            </p>
            <div className="pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 shadow-xl shadow-primary/10">
                  Protect Your Footprint
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
