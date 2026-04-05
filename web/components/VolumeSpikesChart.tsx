"use client";

import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyCountWithSpike } from "@/lib/types";

type Props = {
  data: DailyCountWithSpike[];
  onRangeChange: (startDate: string, endDate: string) => void;
};

export function VolumeSpikesChart({ data, onRangeChange }: Props) {
  const handleBrushChange = (range: { startIndex?: number; endIndex?: number } | null) => {
    if (!range || range.startIndex == null || range.endIndex == null) return;
    const startDate = data[range.startIndex]?.date;
    const endDate = data[range.endIndex]?.date;
    if (startDate && endDate) onRangeChange(startDate, endDate);
  };

  // Count spikes
  const spikeCount = data.filter(d => d.isSpike).length;

  // Start the brush on the last ~14 days for a useful default
  const defaultStart = Math.max(0, data.length - 14);
  const defaultEnd = data.length - 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Review Volume</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Daily count with spike detection ({">"} 2x rolling avg)
          </p>
        </div>
        {spikeCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {spikeCount} spike{spikeCount > 1 ? "s" : ""} detected
          </span>
        )}
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(v: string) => v.slice(5)}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "count") return [value, "Reviews"];
                if (name === "rollingAvg") return [value.toFixed(1), "7-day Avg"];
                return [value, name];
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={8}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isSpike ? "#f59e0b" : "#2563eb"}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="rollingAvg"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Brush
              dataKey="date"
              height={24}
              stroke="#2563eb"
              travellerWidth={8}
              startIndex={defaultStart}
              endIndex={defaultEnd}
              onChange={handleBrushChange}
              tickFormatter={(v: string) => v.slice(5)}
              fill="#f9fafb"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
          <span className="text-xs text-gray-600">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span className="text-xs text-gray-600">Spike</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t border-dashed border-gray-400" />
          <span className="text-xs text-gray-600">Rolling Avg</span>
        </div>
      </div>
    </div>
  );
}
