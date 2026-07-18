import { z } from "zod";

// 1. User Authentication Schemas
export const signInSchema = z.object({
  email: z.string().email("Invalid email address format."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address format."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required.")
});

// 2. Privacy Scan Criteria Schemas
export const scanInputSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  city: z.string().min(2, "City must be at least 2 characters."),
  state: z.string()
    .min(2, "State must be a 2-letter abbreviation.")
    .max(2, "State must be a 2-letter abbreviation.")
    .regex(/^[A-Za-z]{2}$/, "State must contain only letters."),
  email: z.string().email("Invalid email address format.")
});

// 3. User Profile / Settings Schemas
export const settingsSchema = z.object({
  scan_email: z.string().email("Invalid email address format.").optional().or(z.literal("")),
  home_address: z.string().max(200, "Address is too long.").optional(),
  phone_number: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be in E.164 international format (e.g. +15551234567).")
    .optional()
    .or(z.literal("")),
  autopilot_enabled: z.boolean().optional()
});
