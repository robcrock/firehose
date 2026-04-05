"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { X } from "lucide-react";
import type { CategoryCount, ReviewCategory } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/analytics";
import { useFilter } from "@/lib/filter-context";

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

export function CategoryBreakdownChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const { filter, toggleCategory, setCategories } = useFilter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = (category: ReviewCategory) => {
    toggleCategory(category);
  };

  const clearCategories = () => {
    setCategories([]);
  };

  const isSelected = (category: ReviewCategory) =>
    filter.categories.includes(category);

  const hasActiveFilter = filter.categories.length > 0;

  const chartData = data.map((d) => ({
    ...d,
    label: CATEGORY_LABELS[d.category] || d.category,
    color: CATEGORY_CONFIG[d.category]?.color || "#6b7280",
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Category Distribution
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Click to filter</p>
        </div>
        {hasActiveFilter && (
          <button
            onClick={clearCategories}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>
      <div className="w-full h-[200px]">
        {mounted && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value, _name, item) => {
                  const payload = (item as { payload?: { percentage: number } })
                    .payload;
                  const pct = payload?.percentage;
                  return [
                    pct != null ? `${value} (${pct}%)` : String(value),
                    "Reviews",
                  ];
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                barSize={24}
                cursor="pointer"
                onClick={(data) => {
                  const payload = (
                    data as { payload?: { category: ReviewCategory } }
                  ).payload;
                  if (payload) handleCategoryClick(payload.category);
                }}
                label={{
                  position: "right",
                  fontSize: 10,
                  fill: "#6b7280",
                  formatter: (value: number) => value,
                }}
              >
                {chartData.map((entry, index) => {
                  const selected = isSelected(entry.category);
                  const dimmed = hasActiveFilter && !selected;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={dimmed ? 0.25 : 1}
                      className="transition-opacity duration-200"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
        {chartData.map((d) => {
          const selected = isSelected(d.category as ReviewCategory);
          const dimmed = hasActiveFilter && !selected;
          return (
            <button
              key={d.category}
              onClick={() => handleCategoryClick(d.category as ReviewCategory)}
              className={`flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded px-1 -mx-1 ${
                dimmed ? "opacity-25" : ""
              }`}
              aria-pressed={selected}
            >
              <div
                className={`w-2.5 h-2.5 rounded-sm transition-all ${
                  selected ? "ring-2 ring-offset-1 ring-blue-500" : ""
                }`}
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-gray-600">
                {d.label} ({d.percentage}%)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
