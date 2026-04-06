"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import type { CategoryCount } from "@/lib/types";

type Props = {
  data: CategoryCount[];
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bugs",
  feature_request: "Features",
  clinical_concern: "Clinical",
  positive: "Positive",
  other: "Other",
};

// Monochrome grayscale ramp — darkest for largest category, lighter for smaller
const GRAY_PALETTE = [
  "#1a1a1a",
  "#525252",
  "#a3a3a3",
  "#d4d4d4",
  "#e5e5e5",
];

export function CategoryBreakdownChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Sort descending by count so largest category gets the darkest shade
  const sorted = [...data].sort((a, b) => b.count - a.count);

  const chartData = sorted.map((d, i) => ({
    ...d,
    label: CATEGORY_LABELS[d.category] || d.category,
    fill: GRAY_PALETTE[i] ?? GRAY_PALETTE[GRAY_PALETTE.length - 1],
  }));

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const activeEntry = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-2">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          Category Distribution
        </h3>
      </div>

      {/* Donut */}
      <div className="w-full flex justify-center">
        {mounted && (
          <div className="relative w-[200px] h-[200px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  strokeWidth={0}
                  isAnimationActive={false}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {chartData.map((entry, index) => {
                    const isActive = activeIndex === index;
                    const isDimmed = activeIndex !== null && !isActive;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        opacity={isDimmed ? 0.3 : 1}
                        stroke={isActive ? entry.fill : "none"}
                        strokeWidth={isActive ? 4 : 0}
                        style={{ transition: "opacity 150ms ease" }}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeEntry ? (
                <>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {activeEntry.percentage}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {activeEntry.label}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {total.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total
                  </span>
                </>
              )}
            </div>
          </div>
        )}
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
