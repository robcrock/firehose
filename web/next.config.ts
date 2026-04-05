import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this directory — otherwise it walks up
  // and finds an unrelated lockfile in $HOME.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
