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
import type { CategoryCount, ChartFilter, ReviewCategory } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/analytics";

type Props = {
  data: CategoryCount[];
  selectedFilter: ChartFilter | null;
  onFilterChange: (filter: ChartFilter | null) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bugs",
  feature_request: "Features",
  clinical_concern: "Clinical",
  positive: "Positive",
  other: "Other",
};

export function CategoryBreakdownChart({ data, selectedFilter, onFilterChange }: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategoryClick = (category: ReviewCategory) => {
    onFilterChange({
      type: 'category',
      value: category,
      label: CATEGORY_LABELS[category] || category,
    });
  };

  const isSelected = (category: ReviewCategory) =>
    selectedFilter?.type === 'category' && selectedFilter.value === category;

  const isOtherSelected = selectedFilter?.type === 'category';

  const chartData = data.map(d => ({
    ...d,
    label: CATEGORY_LABELS[d.category] || d.category,
    color: CATEGORY_CONFIG[d.category]?.color || "#6b7280",
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Review Categories</h3>
        <span className="text-xs text-gray-500">Distribution breakdown</span>
      </div>
      <div className="w-full h-[200px]">
        {mounted && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
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
                const payload = (item as { payload?: { percentage: number } }).payload;
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
                const payload = (data as { payload?: { category: ReviewCategory } }).payload;
                if (payload) handleCategoryClick(payload.category);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={isOtherSelected && !isSelected(entry.category) ? 0.3 : 1}
                  className="transition-opacity duration-200"
                />
              ))}
            </Bar>
          </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
        {chartData.map(d => (
          <button
            key={d.category}
            onClick={() => handleCategoryClick(d.category as ReviewCategory)}
            className={`flex items-center gap-1.5 transition-opacity duration-200 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded ${
              isOtherSelected && !isSelected(d.category as ReviewCategory) ? 'opacity-30' : ''
            }`}
            aria-pressed={isSelected(d.category as ReviewCategory)}
          >
            <div 
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-gray-600">
              {d.label} ({d.percentage}%)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
