"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#09090B] text-white">
      {/* Left Pane (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0B0A0F] via-[#12101F] to-[#09090B] border-r border-zinc-800/40 relative overflow-hidden">
        {/* Background glow animations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

        {/* Top Header Logo */}
        <Link href="/" className="flex items-center space-x-2.5 z-10 w-fit">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            privora
          </span>
        </Link>

        {/* Center message */}
        <div className="space-y-6 z-10 max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold tracking-tight leading-tight text-zinc-100"
          >
            Your digital boundary, monitored in real-time.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm text-zinc-400 leading-relaxed"
          >
            Join thousands of privacy-conscious users who secure their addresses, phone records, and email registries from automated data brokers databases.
          </motion.p>
        </div>

        {/* Bottom indicator footer */}
        <div className="text-xs text-zinc-500 z-10">
          <span>Protected by AES-256 Zero-Knowledge Sync</span>
        </div>
      </div>

      {/* Right Pane (Auth Forms) */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#09090B] relative">
        <div className="w-full max-w-sm">
          {/* Mobile view Logo link */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                privora
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
