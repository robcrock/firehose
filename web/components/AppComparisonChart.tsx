"use client";

import { Star, ChevronRight } from "lucide-react";
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
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          App Comparison
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border rounded-md px-2.5 py-1">
          Health Score
        </span>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 px-3 first:rounded-l-md last:rounded-r-md">
              App
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 px-3">
              Pain Score
            </th>
            <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 px-3">
              Avg Rating
            </th>
            <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-2.5 px-3 first:rounded-l-md last:rounded-r-md">
              Reviews
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((app) => (
            <tr
              key={app.app}
              className="border-b border-border last:border-b-0 transition-colors hover:bg-gray-50/80 cursor-default"
            >
              <td className="py-4 px-3">
                <span className="text-sm font-medium text-foreground">
                  {app.shortName}
                </span>
              </td>
              <td className="py-4 px-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-foreground tabular-nums">
                    {app.painScore}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {app.severityLabel}
                  </span>
                </div>
              </td>
              <td className="py-4 px-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-muted-foreground fill-muted-foreground" />
                  <span className="text-sm text-foreground tabular-nums">
                    {app.avgRating.toFixed(1)}
                  </span>
                </div>
              </td>
              <td className="py-4 px-3 text-right">
                <span className="text-sm text-foreground tabular-nums">
                  {app.count}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer link */}
      <div className="mt-4 flex justify-center">
        <div className="w-full bg-gray-50 rounded-md py-3 flex justify-center">
          <button className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
            View detailed comparison
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
