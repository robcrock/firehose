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
} from "recharts";
import type { DailyCount } from "@/lib/types";

type Props = {
  data: DailyCount[];
  onRangeChange: (startDate: string, endDate: string) => void;
};

export function ReviewsChart({ data, onRangeChange }: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const handleBrushChange = (range: { startIndex?: number; endIndex?: number } | null) => {
    if (!range || range.startIndex == null || range.endIndex == null) return;
    const startDate = data[range.startIndex]?.date;
    const endDate = data[range.endIndex]?.date;
    if (startDate && endDate) onRangeChange(startDate, endDate);
  };

  // Start the brush on the last ~14 days for a useful default.
  const defaultStart = Math.max(0, data.length - 14);
  const defaultEnd = data.length - 1;

  return (
    <div className="w-full h-[320px]">
      {mounted && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={(v: string) => v.slice(5)}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
            }}
            formatter={(value) => [value, "reviews"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Brush
            dataKey="date"
            height={28}
            stroke="#2563eb"
            travellerWidth={8}
            startIndex={defaultStart}
            endIndex={defaultEnd}
            onChange={handleBrushChange}
            tickFormatter={(v: string) => v.slice(5)}
          />
        </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
