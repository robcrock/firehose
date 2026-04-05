import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// #region agent log
{
  const lucidePkg = path.join(__dirname, "node_modules", "lucide-react", "package.json");
  const lucidePackageJsonExists = fs.existsSync(lucidePkg);
  void fetch("http://127.0.0.1:7684/ingest/f546371d-0e3c-47fa-afe5-6c60188821fa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "c7b8f1" },
    body: JSON.stringify({
      sessionId: "c7b8f1",
      runId: "post-fix",
      hypothesisId: "H1-H2",
      location: "next.config.ts:lucide-check",
      message: "node_modules lucide-react presence",
      data: { lucidePackageJsonExists, lucidePkg },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this directory — otherwise it walks up
  // and finds an unrelated lockfile in $HOME.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
