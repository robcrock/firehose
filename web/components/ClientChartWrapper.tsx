"use client";

import { useEffect, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallbackHeight?: string;
};

/**
 * Wrapper that defers chart rendering until after mount to avoid
 * Recharts ResponsiveContainer SSR dimension warnings.
 */
export function ClientChartWrapper({ children, fallbackHeight = "200px" }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="animate-pulse bg-gray-100 rounded-lg" 
        style={{ height: fallbackHeight }}
      />
    );
  }

  return <>{children}</>;
}
