"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export default function VerifyEmail() {
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code) {
      setError("Verification code is required");
      return;
    } else if (code.trim().length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyEmail(code);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white">Verify Email</h1>
        <p className="text-sm text-zinc-400">We sent a 6-digit activation code to your email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label htmlFor="code" className="text-xs font-semibold text-zinc-400">
            Verification Code
          </label>
          <Input
            id="code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading}
            className={`bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-10 tracking-[0.5em] text-center text-lg ${
              error ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {error && <p className="text-xs text-destructive text-center lg:text-left mt-1">{error}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-10 mt-6 font-medium">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-zinc-400 mt-4">
        <span>Didn&apos;t receive a code? </span>
        <button
          onClick={() => {
            toast.success("Verification code re-sent.");
          }}
          className="text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
        >
          Resend Email
        </button>
      </div>
    </div>
  );
}
