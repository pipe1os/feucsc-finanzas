import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Development configuration ─────────────────────────
  allowedDevOrigins: ["192.168.1.13"],

  // ── Performance optimizations ─────────────────────────
  experimental: {
    // Tree-shake barrel exports from large packages
    optimizePackageImports: [
      "recharts",
      "@heroui/react",
      "@heroui/styles",
    ],
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

  // ── Compiler options ──────────────────────────────────
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
};

export default nextConfig;