"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export default function ResetPassword() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!password) {
      tempErrors.password = "New password is required";
    } else if (password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword("000000", password);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
        <p className="text-sm text-zinc-400">Enter a secure new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-zinc-400">
            New Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            disabled={isLoading}
            className={`bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-10 ${
              errors.password ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-400">
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            disabled={isLoading}
            className={`bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-10 ${
              errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-10 mt-6 font-medium">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </div>
  );
}
