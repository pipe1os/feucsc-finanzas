import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Development configuration ─────────────────────────
  allowedDevOrigins: ["192.168.1.13"],

  // ── Security hardening ────────────────────────────────
  poweredByHeader: false,

  // ── Performance optimizations ─────────────────────────
  experimental: {
    // Tree-shake barrel exports from large packages
    optimizePackageImports: [
      "recharts",
      "@heroui/react",
      "@heroui/styles",
      "motion/react",
      "lucide-react",
      "@supabase/supabase-js",
      "swr",
    ],
    // Inline critical CSS to eliminate render-blocking request
    inlineCss: true,
  },

  // ── Image optimization ────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // ── Security headers ──────────────────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://res.cloudinary.com data:; connect-src 'self' https://*.supabase.co https://api.cloudinary.com; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },

  // ── Compiler options ──────────────────────────────────
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },


};

export default nextConfig;