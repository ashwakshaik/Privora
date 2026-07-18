import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Brand Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                privora
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Autonomous privacy dashboard designed to discover, track, and request removals of personal records across data brokers.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              </li>
            </ul>
          </div>

          {/* Security Links */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Security & Privacy
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">Zero-Knowledge Info</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">About Us</span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">Contact Support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground space-y-4 sm:space-y-0">
          <p>© {currentYear} Privora Inc. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Built with absolute data respect</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
