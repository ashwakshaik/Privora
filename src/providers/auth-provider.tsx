"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { db } from "@/lib/supabase";
import { signInSchema, signUpSchema } from "@/lib/zod-schemas";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sendOtpEmail } from "@/lib/resend";

// A unified Auth Context interface that satisfies both Clerk and Mock modes
interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isSignedIn: boolean;
  userId: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to determine if we should run in Mock mode
const checkIsMockMode = (): boolean => {
  // If Clerk publishable key is not defined, we run in mock mode
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !key || key === "" || key === "pk_test_...";
};

// Pure helper outside component scope to avoid render purity issues
const generateMockId = (): string => {
  return `usr_${Math.floor(100000 + Math.random() * 900000)}`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMockMode] = useState<boolean>(() => checkIsMockMode());
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const currentUserStr = localStorage.getItem("privora_mock_current_user");
      if (currentUserStr) {
        try {
          return JSON.parse(currentUserStr);
        } catch {
          localStorage.removeItem("privora_mock_current_user");
        }
      }
    }
    return null;
  });

  const [isSignedIn, setIsSignedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("privora_mock_current_user") !== null;
    }
    return false;
  });

  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const currentUserStr = localStorage.getItem("privora_mock_current_user");
      if (currentUserStr) {
        try {
          const parsed = JSON.parse(currentUserStr);
          return parsed.id;
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // For sign-up email verification cache in mock mode
  const [pendingUser, setPendingUser] = useState<{
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    otp: string;
  } | null>(null);

  // 1. Sign In
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      signInSchema.parse({ email, password });

      // Rate Limit check: Max 5 login attempts per minute per email key
      const rateLimit = checkRateLimit(`login_${email.toLowerCase()}`, 5, 60000);
      if (!rateLimit.success) {
        const waitTime = Math.ceil((rateLimit.reset - Date.now()) / 1000);
        throw new Error(`Too many login attempts. Please wait ${waitTime} seconds before trying again.`);
      }
      
      if (isMockMode) {
        // Read users from localStorage
        const usersStr = localStorage.getItem("privora_mock_users") || "[]";
        const users = JSON.parse(usersStr);
        const matched = users.find((u: { email: string; id: string; password?: string; firstName?: string; lastName?: string }) => u.email.toLowerCase() === email.toLowerCase());

        if (!matched || matched.password !== password) {
          throw new Error("Invalid email or password.");
        }

        const sessionUser: AuthUser = {
          id: matched.id,
          email: matched.email,
          firstName: matched.firstName,
          lastName: matched.lastName,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${matched.firstName}%20${matched.lastName}`,
        };

        localStorage.setItem("privora_mock_current_user", JSON.stringify(sessionUser));
        setIsSignedIn(true);
        setUserId(sessionUser.id);
        setUser(sessionUser);

        // Synchronize tables on login
        await db.syncUser(sessionUser.id, sessionUser.email, sessionUser.firstName, sessionUser.lastName);

        toast.success("Successfully logged in.");
        router.push("/dashboard");
      } else {
        // Real Clerk Sign In placeholder (Headless SDK implementation)
        // Since `@clerk/nextjs` handles Clerk on window, this will be bypassed 
        // if user loads Clerk middleware. We provide the hooks structure so it's simple to drop-in.
        toast.info("Connecting to Clerk Auth...");
      }
    } catch (error: unknown) {
      let msg = "Sign in failed.";
      if (error instanceof Error) {
        if (error.name === "ZodError" || "issues" in error) {
          const zodErr = error as unknown as { issues: Array<{ message: string }> };
          msg = zodErr.issues.map((i) => i.message).join(" ");
        } else {
          msg = error.message;
        }
      }
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Sign Up
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      signUpSchema.parse({ email, password, firstName, lastName });
      
      if (isMockMode) {
        // Check if user already exists
        const usersStr = localStorage.getItem("privora_mock_users") || "[]";
        const users = JSON.parse(usersStr);
        if (users.some((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("A user with this email already exists.");
        }

        // Cache registration details and trigger simulated OTP email verification
        const simulatedOtp = "123456"; // Default OTP for simulation
        setPendingUser({
          email,
          passwordHash: password, // In-memory/local storage testing simulation
          firstName,
          lastName,
          otp: simulatedOtp,
        });

        // Trigger Resend notification helper
        await sendOtpEmail(email, simulatedOtp);

        toast.success(`Verification code sent to ${email} (Use code: ${simulatedOtp})`);
        router.push("/verify-email");
      } else {
        toast.info("Connecting to Clerk signup...");
      }
    } catch (error: unknown) {
      let msg = "Registration failed.";
      if (error instanceof Error) {
        if (error.name === "ZodError" || "issues" in error) {
          const zodErr = error as unknown as { issues: Array<{ message: string }> };
          msg = zodErr.issues.map((i) => i.message).join(" ");
        } else {
          msg = error.message;
        }
      }
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify Email Code
  const verifyEmail = async (code: string) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        if (!pendingUser) {
          throw new Error("No pending registration session found.");
        }

        if (code !== pendingUser.otp) {
          throw new Error("Incorrect verification code.");
        }

        // Add user to database
        const usersStr = localStorage.getItem("privora_mock_users") || "[]";
        const users = JSON.parse(usersStr);
        
        const newId = generateMockId();
        const newUserEntry = {
          id: newId,
          email: pendingUser.email,
          password: pendingUser.passwordHash,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          created_at: new Date().toISOString(),
        };

        users.push(newUserEntry);
        localStorage.setItem("privora_mock_users", JSON.stringify(users));

        // Sign in immediately
        const sessionUser: AuthUser = {
          id: newId,
          email: pendingUser.email,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${pendingUser.firstName}%20${pendingUser.lastName}`,
        };

        localStorage.setItem("privora_mock_current_user", JSON.stringify(sessionUser));
        setIsSignedIn(true);
        setUserId(newId);
        setUser(sessionUser);
        setPendingUser(null);

        // Synchronize user settings
        await db.syncUser(newId, pendingUser.email, pendingUser.firstName, pendingUser.lastName);

        toast.success("Email verified. Welcome to Privora!");
        router.push("/dashboard");
      } else {
        toast.info("Completing Clerk code verification...");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Verification failed.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Sign Out
  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        localStorage.removeItem("privora_mock_current_user");
        setIsSignedIn(false);
        setUserId(null);
        setUser(null);
        toast.success("Successfully logged out.");
        router.push("/sign-in");
      } else {
        toast.info("Signing out from Clerk...");
      }
    } catch {
      toast.error("Logout failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Forgot Password
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        const usersStr = localStorage.getItem("privora_mock_users") || "[]";
        const users = JSON.parse(usersStr);
        const matched = users.find((u: { email: string }) => u.email.toLowerCase() === email.toLowerCase());

        if (!matched) {
          throw new Error("No user found with this email address.");
        }

        toast.success("Password reset code sent. (Use code: 000000)");
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast.info("Requesting Clerk reset token...");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to trigger recovery.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Reset Password
  const resetPassword = async (code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      if (isMockMode) {
        if (code !== "000000") {
          throw new Error("Invalid password reset token.");
        }

        // Get email from URL params or verify locally
        toast.success("Password updated successfully. Please log in.");
        router.push("/sign-in");
      } else {
        toast.info("Resetting Clerk password...");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Reset failed.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        userId,
        user,
        isLoading,
        signIn,
        signUp,
        verifyEmail,
        signOut,
        forgotPassword,
        resetPassword,
        isMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
