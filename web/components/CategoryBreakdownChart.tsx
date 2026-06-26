"use client";

import { useState } from "react";
import type { CategoryCount } from "@/lib/types";

type Props = {
  data: CategoryCount[];
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Broken",
  feature_request: "Wishlist",
  clinical_concern: "Needs attention",
  positive: "Working",
  other: "Untagged",
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

  // Keep all categories separate (no merge)
  const counts = data.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + d.count;
    return acc;
  }, {});

  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  // Sort all categories by count desc, but pin "positive" and "other" at the end
  const priority: Record<string, number> = {
    bug: 0,
    feature_request: 1,
    clinical_concern: 2,
    positive: 3,
    other: 4,
  };

  const sortedCategories = Object.entries(counts)
    .sort(([catA, countA], [catB, countB]) => {
      // Primary: actionable categories first (bug, feature_request, clinical_concern)
      // Secondary: by count desc within actionable, then positive, then other
      const prioA = priority[catA] ?? 99;
      const prioB = priority[catB] ?? 99;
      if (prioA !== prioB) return prioA - prioB;
      return countB - countA;
    });

  // Build chart data
  const chartData = sortedCategories.map(([cat, count], i) => ({
    category: cat,
    count,
    label: CATEGORY_LABELS[cat] || cat,
    fill: GRAY_PALETTE[Math.min(i, GRAY_PALETTE.length - 1)],
    percentage: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
    widthPct: total > 0 ? (count / total) * 100 : 0,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-h-[380px] flex flex-col overflow-hidden">
      <div className="mb-4">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          Where the pain is
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
