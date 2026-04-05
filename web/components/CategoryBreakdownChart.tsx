"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryCount } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/analytics";

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
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
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
              formatter={(value: number, name: string, props: { payload: { percentage: number } }) => [
                `${value} (${props.payload.percentage}%)`,
                "Reviews",
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
        {chartData.map(d => (
          <div key={d.category} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-gray-600">
              {d.label} ({d.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
