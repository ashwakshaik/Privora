"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { hashPassword } from "@/services/AuthService";

export function SignInForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const tempErrors: typeof errors = {};
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!email) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-zinc-400">Enter details below to access your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Email */}
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
            className={`bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-10 focus-visible:ring-2 focus-visible:ring-primary ${
              errors.email ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
            required
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-400">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              className={`bg-zinc-900 border-zinc-800 text-white placeholder-zinc-500 h-10 pr-10 focus-visible:ring-2 focus-visible:ring-primary ${
                errors.password ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-0.5"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        {/* Actions Submit */}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full h-10 mt-6 font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Alternative SSO */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#09090B] px-2 text-zinc-500">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={async () => {
          setIsLoading(true);
          try {
            // Register user with Hashed password if they don't exist
            const usersStr = localStorage.getItem("privora_mock_users") || "[]";
            const users = JSON.parse(usersStr);
            const passwordHash = await hashPassword("password123");
            if (!users.some((u: { email: string }) => u.email === "ashwak@gmail.com")) {
              users.push({
                id: "usr_ashwak123",
                email: "ashwak@gmail.com",
                password: passwordHash,
                firstName: "Ashwak",
                lastName: "User",
                created_at: new Date().toISOString(),
              });
              localStorage.setItem("privora_mock_users", JSON.stringify(users));
            }
            await signIn("ashwak@gmail.com", "password123");
          } catch {
            setIsLoading(false);
          }
        }}
        disabled={isLoading}
        className="w-full border-zinc-850 bg-zinc-900/40 text-white hover:bg-zinc-800/50 h-10 focus-visible:ring-2 focus-visible:ring-primary"
      >
        Google Account
      </Button>

      <div className="text-center text-xs text-zinc-400 mt-4">
        <span>Don&apos;t have an account? </span>
        <Link href="/sign-up" className="text-primary hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          Create Account
        </Link>
      </div>
    </div>
  );
}
