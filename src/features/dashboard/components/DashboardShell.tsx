"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MockBanner } from "@/components/shared/mock-banner";

const WelcomeTour = dynamic(() => import("./WelcomeTour").then(m => m.WelcomeTour), { ssr: false });
const FeedbackModal = dynamic(() => import("./FeedbackModal").then(m => m.FeedbackModal), { ssr: false });

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoading, isSignedIn, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Avoid flashing layout during redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden bg-aurora">
      {/* 0. Mock warning alert banner at the very top */}
      <MockBanner />

      <div className="flex-1 flex relative overflow-hidden">
        <WelcomeTour />
        <FeedbackModal />
        
        {/* 1. Desktop Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          className="hidden md:flex border-r border-border/60 shadow-sm"
        />

        {/* 2. Main Workspace Layout */}
        <div className="flex-1 flex flex-col min-w-0 z-10">
          {/* Top Glass Header Bar */}
          <header className="sticky top-0 z-20 h-16 glass-nav px-6 flex items-center justify-between">
            {/* Left Section: Mobile Menu Trigger / Breadcrumbs */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden h-9 w-9 rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              <Link href="/dashboard" className="md:hidden flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="text-sm font-bold text-foreground">privora</span>
              </Link>
              <span className="hidden md:inline text-xs font-semibold text-muted-foreground">
                Workspace / Overview
              </span>
            </div>

            {/* Right Section: Tool toggles, notifications, profile */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Avatar className="h-8 w-8 border border-border shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.firstName ? user.firstName.substring(0, 2).toUpperCase() : "PR"}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div 
              className="md:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
            >
              <Sidebar
                isCollapsed={false}
                setIsCollapsed={() => {}}
                className="w-64 h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 h-9 w-9 z-40 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close menu"
              >
                <X size={20} />
              </Button>
            </div>
          )}

          {/* 3. Page Content Area */}
          <main
            className={cn(
              "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
