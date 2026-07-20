"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 1. Reusable Premium Loading Spinner
interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  label?: string;
}

export function LoadingSpinner({ className, size = 32, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="text-primary animate-pulse" size={size} aria-hidden="true" />
      </motion.div>
      {label && <p className="text-sm text-muted-foreground mt-3 animate-pulse">{label}</p>}
    </div>
  );
}

// 2. Reusable Premium Empty State Component
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <Inbox className="h-10 w-10 text-muted-foreground" aria-hidden="true" />,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card/30 max-w-md mx-auto",
        className
      )}
    >
      <div className="p-3 bg-muted rounded-full mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 focus-visible:ring-2 focus-visible:ring-primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// 3. Reusable Premium Error State Component
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "An error occurred",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-destructive/20 rounded-xl bg-destructive/5 max-w-md mx-auto",
        className
      )}
    >
      <div className="p-3 bg-destructive/10 text-destructive rounded-full mb-4">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="mt-5 border-destructive/20 hover:bg-destructive/5 text-destructive focus-visible:ring-2 focus-visible:ring-primary" size="sm">
          Retry Action
        </Button>
      )}
    </div>
  );
}
