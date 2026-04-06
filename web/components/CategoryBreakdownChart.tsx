"use client";

import { useState } from "react";
import type { CategoryCount } from "@/lib/types";

type Props = {
  data: CategoryCount[];
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bugs",
  feature_request: "Features",
  clinical_concern: "Clinical",
  other: "Other",
};

// Monochrome grayscale ramp — darkest for largest actionable category, lighter for smaller
const GRAY_PALETTE = [
  "#1a1a1a",
  "#525252",
  "#a3a3a3",
  "#d4d4d4",
];

export function CategoryBreakdownChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Merge "positive" into "other"
  const merged = data.reduce<Record<string, number>>((acc, d) => {
    const key = d.category === "positive" ? "other" : d.category;
    acc[key] = (acc[key] ?? 0) + d.count;
    return acc;
  }, {});

  const total = Object.values(merged).reduce((sum, c) => sum + c, 0);

  // Separate "other" from actionable categories, sort actionable by count desc
  const actionable = Object.entries(merged)
    .filter(([cat]) => cat !== "other")
    .sort(([, a], [, b]) => b - a);

  const otherCount = merged["other"] ?? 0;

  // Build chart data: actionable categories sorted desc, then "other" pinned at the end
  const chartData = [
    ...actionable.map(([cat, count], i) => ({
      category: cat,
      count,
      label: CATEGORY_LABELS[cat] || cat,
      fill: GRAY_PALETTE[i] ?? GRAY_PALETTE[GRAY_PALETTE.length - 1],
      percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      widthPct: total > 0 ? (count / total) * 100 : 0,
    })),
    {
      category: "other",
      count: otherCount,
      label: "Other",
      fill: GRAY_PALETTE[GRAY_PALETTE.length - 1],
      percentage: total > 0 ? Number(((otherCount / total) * 100).toFixed(1)) : 0,
      widthPct: total > 0 ? (otherCount / total) * 100 : 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-h-[380px] flex flex-col overflow-hidden">
      <div className="mb-4">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          Category Distribution
        </h3>
      </div>

      {/* Stacked horizontal bar */}
      <div className="flex w-full h-3 rounded-full overflow-hidden">
        {chartData.map((d, i) => {
          const isActive = activeIndex === i;
          const isDimmed = activeIndex !== null && !isActive;
          return (
            <div
              key={d.category}
              className="h-full transition-opacity duration-150 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${d.widthPct}%`,
                backgroundColor: d.fill,
                opacity: isDimmed ? 0.25 : 1,
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-0.5">
        {chartData.map((d, i) => {
          const isActive = activeIndex === i;
          const isDimmed = activeIndex !== null && !isActive;
          return (
            <div
              key={d.category}
              className="flex items-center justify-between rounded-md px-2 py-2 -mx-2 cursor-default transition-colors hover:bg-gray-50"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full transition-opacity duration-150"
                  style={{
                    backgroundColor: d.fill,
                    opacity: isDimmed ? 0.3 : 1,
                  }}
                />
                <span
                  className="text-sm transition-colors duration-150"
                  style={{
                    color: isDimmed ? "#d4d4d4" : "#1a1a1a",
                  }}
                >
                  {d.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {d.percentage}%
                  </span>
                )}
                <span
                  className="text-sm font-semibold tabular-nums transition-colors duration-150"
                  style={{
                    color: isDimmed ? "#d4d4d4" : "#1a1a1a",
                  }}
                >
                  {d.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
