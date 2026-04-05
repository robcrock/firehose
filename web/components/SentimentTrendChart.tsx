"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { WeeklySentiment } from "@/lib/types";
import { ClientChartWrapper } from "./ClientChartWrapper";

type Props = {
  data: WeeklySentiment[];
};

export function SentimentTrendChart({ data }: Props) {
  // Calculate average across all weeks for reference line
  const overallAvg = data.length > 0
    ? data.reduce((sum, d) => sum + d.avgRating, 0) / data.length
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Sentiment Trend</h3>
        <span className="text-xs text-gray-500">Weekly average rating</span>
      </div>
      <ClientChartWrapper fallbackHeight="200px">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
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
              formatter={(value: number) => [value.toFixed(2), "Avg Rating"]}
              labelFormatter={(label) => `Week of ${label}`}
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
              dot={{ fill: "#2563eb", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#2563eb" }}
              isAnimationActive={false}
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </ClientChartWrapper>
    </div>
  );
}
