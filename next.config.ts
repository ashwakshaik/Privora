import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://img.clerk.com; frame-src 'self' https://js.stripe.com;",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/(fonts|images|icons|brand)/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
