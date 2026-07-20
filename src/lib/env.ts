export const config = {
  isClerkConfigured: Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_..."
  ),
  isSupabaseConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-supabase-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-supabase-anonymous-key"
  ),
  clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  posthogKey: process.env.POSTHOG_KEY || "",
  sentryDsn: process.env.SENTRY_DSN || ""
};
