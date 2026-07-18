"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export default function ForgotPassword() {
  const router = useRouter();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email) {
      setError("Email is required");
      return;
    } else if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
        <p className="text-sm text-zinc-400">Enter your email to receive a recovery reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-zinc-400">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
            className={`bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-10 ${
              error ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-10 mt-6 font-medium">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link
          href="/sign-in"
          className="inline-flex items-center text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
