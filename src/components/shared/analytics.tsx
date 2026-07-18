"use client";

import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Define a type-safe window extension interface
interface CustomWindow extends Window {
  posthog?: {
    init: (key: string, config: Record<string, unknown>) => void;
    capture: (name: string, properties?: Record<string, unknown>) => void;
  };
  _posthog_q?: Array<[string, Record<string, unknown>]>;
  _posthog_k?: string;
  _posthog_c?: Record<string, unknown>;
}

// Define lightweight analytics helper
export const telemetry = {
  event: (name: string, properties?: Record<string, unknown>) => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (posthogKey && typeof window !== "undefined") {
      const customWin = window as unknown as CustomWindow;
      if (customWin.posthog) {
        try {
          customWin.posthog.capture(name, properties);
        } catch (err) {
          console.error("[PostHog Telemetry Error] Failed to capture event:", err);
        }
      }
    } else {
      console.log(`[Telemetry Event] ${name}:`, properties || {});
    }
  }
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (posthogKey && typeof window !== "undefined") {
      const customWin = window as unknown as CustomWindow;

      // Dynamically load PostHog script
      if (!customWin.posthog) {
        customWin._posthog_q = [];
        customWin.posthog = {
          init: (k: string, c: Record<string, unknown>) => {
            customWin._posthog_k = k;
            customWin._posthog_c = c;
          },
          capture: (n: string, p?: Record<string, unknown>) => {
            if (customWin._posthog_q) {
              customWin._posthog_q.push([n, p || {}]);
            }
          }
        };

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://us-assets.i.posthog.com/static/array.js";
        document.head.appendChild(script);

        script.onload = () => {
          if (customWin.posthog && typeof customWin.posthog.init === "function") {
            customWin.posthog.init(posthogKey, {
              api_host: posthogHost,
              person_profiles: "identified_only",
              capture_pageview: false
            });
            
            // Flush queued events
            const q = customWin._posthog_q || [];
            while (q.length > 0) {
              const item = q.shift();
              if (item && customWin.posthog) {
                const [n, p] = item;
                customWin.posthog.capture(n, p);
              }
            }
          }
        };
      }
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      telemetry.event("$pageview", {
        $current_url: window.location.href,
        pathname: pathname,
        search: searchParams?.toString() || ""
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
