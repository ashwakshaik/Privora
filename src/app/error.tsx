"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console or error reporter
    console.error("Unhandled client boundary error caught:", error);
  }, [error]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full bg-card border border-border rounded-[24px] p-8 shadow-2xl space-y-6">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle size={24} aria-hidden="true" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error was encountered in this view module. The error has been logged automatically.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="rounded-xl h-10 text-xs font-semibold px-5"
          >
            Go to Homepage
          </Button>
          <Button 
            onClick={() => reset()}
            className="rounded-xl h-10 text-xs font-semibold px-5 shadow-lg shadow-primary/10"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
