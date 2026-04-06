"use client";

import { useEffect, useState } from "react";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { X } from "lucide-react";
import type { WeeklySentiment } from "@/lib/types";
import { useFilter } from "@/lib/filter-context";

type Props = {
  data: WeeklySentiment[];
};

export function SentimentTrendChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const { filter, setTimeRange } = useFilter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if a custom time range is active from this chart
  const hasCustomRange = typeof filter.timeRange === "object";

  const handleBrushChange = (range: { startIndex?: number; endIndex?: number } | null) => {
    if (!range || range.startIndex == null || range.endIndex == null) return;
    const startDate = data[range.startIndex]?.weekStart;
    const endDate = data[range.endIndex]?.weekStart;
    if (startDate && endDate) {
      // Add 6 days to end date to cover the full week
      const endWeekDate = new Date(endDate);
      endWeekDate.setDate(endWeekDate.getDate() + 6);
      const endWeekStr = endWeekDate.toISOString().slice(0, 10);
      setTimeRange({ start: startDate, end: endWeekStr });
    }
  };

  const clearTimeRange = () => {
    setTimeRange("90d");
  };

  // Calculate average across all weeks for reference line
  const overallAvg =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.avgRating, 0) / data.length
      : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-title font-semibold tracking-tight text-foreground">
            Sentiment Trend
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Weekly average rating
          </p>
        </div>
        {hasCustomRange && (
          <button
            onClick={clearTimeRange}
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
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => {
                  const v = typeof value === "number" ? value : Number(value);
                  return [v.toFixed(2), "Avg Rating"];
                }}
                labelFormatter={(label, payload) => {
                  const count = payload?.[0]?.payload?.count;
                  return `Week of ${label}${count ? ` (${count} reviews)` : ""}`;
                }}
              />
              <ReferenceLine
                y={overallAvg}
                stroke="#9ca3af"
                strokeDasharray="4 4"
                label={{
                  value: `Avg: ${overallAvg.toFixed(1)}`,
                  position: "right",
                  fontSize: 10,
                  fill: "#9ca3af",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgRating"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: "#2563eb" }}
                activeDot={{ r: 5, fill: "#1d4ed8", stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Brush
                dataKey="week"
                height={20}
                stroke="#2563eb"
                travellerWidth={8}
                startIndex={0}
                endIndex={data.length - 1}
                onChange={handleBrushChange}
                fill="#f9fafb"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
