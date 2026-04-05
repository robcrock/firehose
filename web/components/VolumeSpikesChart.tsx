"use client";

import { useEffect, useState, forwardRef } from "react";
import {
  Bar,
  Brush,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Label,
} from "recharts";
import { X } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DailyCountWithSpike } from "@/lib/types";
import { useFilter } from "@/lib/filter-context";

type Props = {
  data: DailyCountWithSpike[];
  onScrollToReviews: () => void;
};

export const VolumeSpikesChart = forwardRef<HTMLDivElement, Props>(
  function VolumeSpikesChart({ data, onScrollToReviews }, ref) {
    const [mounted, setMounted] = useState(false);
    const { filter, setTimeRange } = useFilter();

    useEffect(() => {
      setMounted(true);
    }, []);

    const handleBrushChange = (
      range: { startIndex?: number; endIndex?: number } | null
    ) => {
      if (!range || range.startIndex == null || range.endIndex == null) return;
      const startDate = data[range.startIndex]?.date;
      const endDate = data[range.endIndex]?.date;
      if (startDate && endDate) {
        setTimeRange({ start: startDate, end: endDate });
      }
    };

    const handleSpikeClick = (date: string) => {
      setTimeRange({ start: date, end: date });
      onScrollToReviews();
    };

    const clearTimeRange = () => {
      setTimeRange("90d");
    };

    // Check if a custom time range is active
    const hasCustomRange = typeof filter.timeRange === "object";

    // Count spikes
    const spikeCount = data.filter((d) => d.isSpike).length;
    const spikes = data.filter((d) => d.isSpike);

    // Default brush range
    const defaultStart = Math.max(0, data.length - 14);
    const defaultEnd = data.length - 1;

    // Calculate current brush indices based on filter
    let brushStartIndex = defaultStart;
    let brushEndIndex = defaultEnd;

    if (typeof filter.timeRange === "object") {
      const range = filter.timeRange;
      const startIdx = data.findIndex((d) => d.date >= range.start);
      const endIdx = data.findIndex((d) => d.date > range.end);
      if (startIdx !== -1) brushStartIndex = startIdx;
      if (endIdx !== -1) brushEndIndex = endIdx - 1;
      else if (startIdx !== -1) brushEndIndex = data.length - 1;
    }

    return (
      <div ref={ref} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Review Volume
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Daily count with spike detection ({">"} 2x rolling avg)
            </p>
          </div>
          <div className="flex items-center gap-3">
            {spikeCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {spikeCount} spike{spikeCount > 1 ? "s" : ""} detected
              </span>
            )}
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
        </div>

        {/* Spike Annotations */}
        {spikes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {spikes.slice(0, 5).map((spike) => {
              const multiplier = spike.rollingAvg > 0 
                ? (spike.count / spike.rollingAvg).toFixed(1) 
                : "N/A";
              const dateLabel = format(parseISO(spike.date), "M/d");
              return (
                <button
                  key={spike.date}
                  onClick={() => handleSpikeClick(spike.date)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs hover:bg-amber-100 transition-colors"
                >
                  <span className="font-medium text-amber-800">{dateLabel}</span>
                  <span className="text-amber-600">{spike.count} reviews</span>
                  <span className="text-amber-500">{multiplier}x avg</span>
                </button>
              );
            })}
            {spikes.length > 5 && (
              <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                +{spikes.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="w-full h-[260px]">
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={data}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
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
                  formatter={(value, name) => {
                    const v =
                      typeof value === "number" ? value : Number(value);
                    if (name === "count") return [v, "Reviews"];
                    if (name === "rollingAvg") return [v.toFixed(1), "7-day Avg"];
                    return [v, String(name)];
                  }}
                  labelFormatter={(label) => format(parseISO(label), "MMM d, yyyy")}
                />
                <Bar
                  dataKey="count"
                  radius={[2, 2, 0, 0]}
                  barSize={8}
                  onClick={(data) => {
                    const payload = data as { date?: string; isSpike?: boolean };
                    if (payload.isSpike && payload.date) {
                      handleSpikeClick(payload.date);
                    }
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isSpike ? "#f59e0b" : "#9ca3af"}
                      cursor={entry.isSpike ? "pointer" : "default"}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="rollingAvg"
                  stroke="#6b7280"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
                <Brush
                  dataKey="date"
                  height={20}
                  stroke="#2563eb"
                  travellerWidth={8}
                  startIndex={brushStartIndex}
                  endIndex={brushEndIndex}
                  onChange={handleBrushChange}
                  tickFormatter={(v: string) => v.slice(5)}
                  fill="#f9fafb"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-gray-400" />
            <span className="text-xs text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-xs text-gray-600">Spike (click to filter)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0 border-t border-dashed border-gray-500" />
            <span className="text-xs text-gray-600">7-day Rolling Avg</span>
          </div>
        </div>
      </div>
    );
  }
);
