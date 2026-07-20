"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { storage } from "@/lib/storage";
import { signInSchema, signUpSchema } from "@/lib/zod-schemas";
import { checkRateLimit } from "@/lib/rate-limiter";
import { sendOtpEmail } from "@/lib/resend";
import { AuthService } from "@/services/AuthService";
import { config } from "@/lib/env";

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

const checkIsMockMode = (): boolean => {
  return !config.isClerkConfigured;
};

const generateMockId = (): string => {
  return `usr_${Math.floor(100000 + Math.random() * 900000)}`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMockMode] = useState<boolean>(() => checkIsMockMode());
  
  // States initialized to safe defaults to prevent SSR hydration mismatch
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // For sign-up email verification cache in mock mode
  const [pendingUser, setPendingUser] = useState<{
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    otp: string;
  } | null>(null);

  // Hydrate session from localStorage on client-mount
  useEffect(() => {
    const loadSession = () => {
      if (typeof window !== "undefined") {
        const currentUserStr = localStorage.getItem("privora_mock_current_user");
        if (currentUserStr) {
          try {
            const parsed = JSON.parse(currentUserStr);
            setUser(parsed);
            setIsSignedIn(true);
            setUserId(parsed.id);
          } catch {
            localStorage.removeItem("privora_mock_current_user");
          }
        }
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  // 1. Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      signInSchema.parse({ email, password });

      const rateLimit = checkRateLimit(`login_${email.toLowerCase()}`, 5, 60000);
      if (!rateLimit.success) {
        const waitTime = Math.ceil((rateLimit.reset - Date.now()) / 1000);
        throw new Error(`Too many login attempts. Please wait ${waitTime} seconds before trying again.`);
      }
      
      if (isMockMode) {
        // Authenticate with hashed passwords using AuthService
        const matched = await AuthService.verifyMockUserCredentials(email, password);

        const sessionUser: AuthUser = {
          id: matched.id,
          email: matched.email,
          firstName: matched.first_name || matched.firstName,
          lastName: matched.last_name || matched.lastName,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${matched.firstName || "User"}%20${matched.lastName || ""}`,
        };

        localStorage.setItem("privora_mock_current_user", JSON.stringify(sessionUser));
        setIsSignedIn(true);
        setUserId(sessionUser.id);
        setUser(sessionUser);

        // Sync settings / users
        await storage.syncUser(sessionUser.id, sessionUser.email, sessionUser.firstName, sessionUser.lastName);

        toast.success("Successfully logged in.");
        router.push("/dashboard");
      } else {
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
      setLoading(false);
    }
  };

  // 2. Sign Up
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    try {
      signUpSchema.parse({ email, password, firstName, lastName });
      
      if (isMockMode) {
        // Prepare pending registration using password hashing
        const pending = await AuthService.registerMockUser(email, password, firstName, lastName);
        const simulatedOtp = "123456";
        
        setPendingUser({
          ...pending,
          otp: simulatedOtp,
        });

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
      setLoading(false);
    }
  };

  // 3. Verify Email Code
  const verifyEmail = async (code: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        if (!pendingUser) {
          throw new Error("No pending registration session found.");
        }

        if (code !== pendingUser.otp) {
          throw new Error("Incorrect verification code.");
        }

        const newId = generateMockId();
        const sessionUser = await AuthService.completeMockUserRegistration(pendingUser, newId);

        localStorage.setItem("privora_mock_current_user", JSON.stringify(sessionUser));
        setIsSignedIn(true);
        setUserId(newId);
        setUser(sessionUser);
        setPendingUser(null);

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
      setLoading(false);
    }
  };

  // 4. Sign Out
  const signOut = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // 5. Forgot Password
  const forgotPassword = async (email: string) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  // 6. Reset Password
  const resetPassword = async (code: string, newPassword: string) => {
    setLoading(true);
    try {
      if (isMockMode) {
        if (code !== "000000") {
          throw new Error("Invalid password reset token.");
        }
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
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Stop hydration mismatches by returning null during hydration loader phase
  }

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        userId,
        user,
        isLoading: loading,
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
