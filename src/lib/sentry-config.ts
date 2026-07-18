/**
 * Sentry runtime monitoring handler configuration.
 * Captures exceptions and reports them if configured, fallback to console log.
 */
export function captureException(error: unknown, context?: Record<string, unknown>) {
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (sentryDsn) {
    // If Sentry is installed and initialized at window, forward error
    interface WindowWithSentry extends Window {
      Sentry?: {
        captureException: (error: unknown, options?: { extra?: Record<string, unknown> }) => void;
      };
    }
    const windowObject = typeof window !== "undefined" ? (window as unknown as WindowWithSentry) : null;
    if (windowObject && windowObject.Sentry) {
      try {
        windowObject.Sentry.captureException(error, { extra: context });
        return;
      } catch (err) {
        console.error("[Sentry captureException Error]:", err);
      }
    }
  }

  // Fallback dev environment logging
  console.group("Telemetry Exception Monitored");
  console.error("Exception details:", error);
  if (context) {
    console.log("Exception context:", context);
  }
  console.groupEnd();
}
