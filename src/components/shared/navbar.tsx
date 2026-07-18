"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:opacity-90 transition-opacity">
            <Shield className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            privora
          </span>
        </Link>

        {/* Desktop NavLinks */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="shadow-lg shadow-primary/10">
              Start Free Scan
            </Button>
          </Link>
        </div>

        {/* Mobile Nav Button */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg h-9 w-9"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground py-1.5 transition-colors block"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-border pt-4 flex flex-col space-y-2">
            <Link href="/sign-in" onClick={() => setIsOpen(false)} className="w-full">
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" onClick={() => setIsOpen(false)} className="w-full">
              <Button size="sm" className="w-full">
                Start Free Scan
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
