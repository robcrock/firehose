import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root; use cwd here (not import.meta) so the compiled config loads cleanly.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
