"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import type { AppStats, ClassifiedReview } from "@/lib/types";

type Props = {
  data: AppStats[];
  allReviews: ClassifiedReview[];
};

function getSeverityLabel(painScore: number, maxPain: number): string {
  const ratio = painScore / maxPain;
  if (ratio >= 0.66) return "Critical";
  if (ratio >= 0.33) return "Warning";
  return "Stable";
}

export function AppComparisonChart({ data }: Props) {
  const maxPain = Math.max(...data.map((d) => d.painScore), 1);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const rows = [...data]
    .sort((a, b) => b.painScore - a.painScore)
    .map((d) => ({
      ...d,
      shortName: d.displayName
        .replace(/FreeStyle\s*/gi, "")
        .replace(/\s*\(US\)/gi, ""),
      severityLabel: getSeverityLabel(d.painScore, maxPain),
    }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-1.5 mb-4 relative">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          App Comparison
        </h3>
        <div
          className="relative"
          onMouseEnter={() => setTooltipOpen(true)}
          onMouseLeave={() => setTooltipOpen(false)}
        >
          <button
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="How is health status determined?"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          {tooltipOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-20 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-muted-foreground leading-relaxed">
              Health status is based on a pain score: (5 − avg rating) × volume ÷ 10. Apps scoring in the top third are <span className="font-semibold text-foreground">Critical</span>, middle third <span className="font-semibold text-foreground">Warning</span>, and bottom third <span className="font-semibold text-foreground">Stable</span>.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        {rows.map((app) => (
          <div
            key={app.app}
            className="flex items-center justify-between rounded-md px-2 py-2 -mx-2 cursor-default transition-colors hover:bg-gray-50"
          >
            <span className="text-sm text-foreground">
              {app.shortName}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {app.avgRating.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-foreground min-w-[52px] text-right">
                {app.severityLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
