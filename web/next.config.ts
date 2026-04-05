import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this directory
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
