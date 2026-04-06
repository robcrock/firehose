"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklySentiment } from "@/lib/types";

type Props = {
  data: WeeklySentiment[];
};

export function SentimentTrendChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full flex-1 min-h-[200px]">
      {mounted && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0.01} />
              </linearGradient>
            </defs>
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
              interval={1}
            />
            <YAxis
              domain={[0, 5]}
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
            <Area
              type="monotone"
              dataKey="avgRating"
              stroke="#1a1a1a"
              strokeWidth={2}
              fill="url(#ratingFill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#1a1a1a",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
