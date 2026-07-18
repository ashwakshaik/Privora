"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, X, Shield, Radar, ShieldAlert, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const tourCompleted = localStorage.getItem("privora_tour_completed");
      return !tourCompleted;
    }
    return false;
  });
  const [step, setStep] = useState(1);

  const handleComplete = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("privora_tour_completed", "true");
    }
    setIsOpen(false);
  };

  const stepsData = [
    {
      title: "Welcome to Privora",
      icon: <Shield size={32} className="text-primary animate-pulse" />,
      desc: "Your data privacy is our priority. Let's do a quick 4-step walkthrough of Privora to show you how to scan leaks and secure your online identity."
    },
    {
      title: "1. Privacy Scan Engine",
      icon: <Radar size={32} className="text-blue-500 rotate-animation" />,
      desc: "Go to the Privacy Scan page, enter your name and city, and scan 80+ data brokers. We will discover exposed email listings, phone numbers, and home addresses."
    },
    {
      title: "2. Automatic Removal Center",
      icon: <ShieldAlert size={32} className="text-destructive animate-bounce" />,
      desc: "Whenever exposures are found, they are listed in your Removal Center. Simply click 'Queue Deletion' to authorize automated opt-out submissions."
    },
    {
      title: "3. Continuous Autopilot Mode",
      icon: <BadgeCheck size={32} className="text-emerald-500 animate-pulse" />,
      desc: "Enable Autopilot Mode to automatically credit your Privacy Index Score and monitor public registries for re-exposure listings indefinitely."
    }
  ];

  if (!isOpen) return null;

  const currentStepData = stepsData[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="bg-[#09090B] border border-border rounded-2xl w-full max-w-sm p-6 relative shadow-premium overflow-hidden text-center">
        {/* Ambient background glows */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleComplete}
          className="absolute top-4 right-4 h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
          aria-label="Skip onboarding tour"
        >
          <X size={15} />
        </Button>

        {/* Tour Step Illustration Icon */}
        <div className="h-16 w-16 bg-muted/10 rounded-2xl border border-border flex items-center justify-center mx-auto mb-5">
          {currentStepData.icon}
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-foreground font-heading mb-2">
          {currentStepData.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed px-2 mb-6">
          {currentStepData.desc}
        </p>

        {/* Navigation Step Indicators */}
        <div className="flex items-center justify-between mt-6">
          {/* Step circles */}
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-150 ${
                  step === s ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="h-8 text-xs font-semibold px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 flex items-center cursor-pointer"
            >
              Next Step
              <ArrowRight size={13} className="ml-1.5" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="h-8 text-xs font-semibold px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-white border-0 flex items-center cursor-pointer"
            >
              Get Started
              <Sparkles size={13} className="ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
