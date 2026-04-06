"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ChevronDown, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { DailyCountWithSpike } from "@/lib/types";

type Props = {
  data: DailyCountWithSpike[];
  selectedDates: Set<string>;
  onDateToggle: (date: string) => void;
  onClearDates: () => void;
};

export function VolumeSpikesChart({
  data,
  selectedDates,
  onDateToggle,
  onClearDates,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [spikeMenuOpen, setSpikeMenuOpen] = useState(false);
  const [selectionMenuOpen, setSelectionMenuOpen] = useState(false);
  const spikeMenuRef = useRef<HTMLDivElement>(null);
  const selectionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        spikeMenuRef.current &&
        !spikeMenuRef.current.contains(e.target as Node)
      ) {
        setSpikeMenuOpen(false);
      }
      if (
        selectionMenuRef.current &&
        !selectionMenuRef.current.contains(e.target as Node)
      ) {
        setSelectionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const spikes = data.filter((d) => d.isSpike);
  const spikeCount = spikes.length;
  const hasSelection = selectedDates.size > 0;

  const handleBarClick = (payload: { date?: string }) => {
    if (!payload.date) return;
    onDateToggle(payload.date);
  };

  return (
    <>
      {/* Controls bar */}
      <div className="flex items-center justify-end gap-2 mb-3">
        {/* Selected days dropdown */}
        {hasSelection && (
          <div className="relative" ref={selectionMenuRef}>
            <button
              onClick={() => setSelectionMenuOpen(!selectionMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              {selectedDates.size} day{selectedDates.size > 1 ? "s" : ""}{" "}
              selected
              <ChevronDown
                className={`w-3 h-3 transition-transform ${selectionMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {selectionMenuOpen && (
              <div className="absolute top-full right-0 mt-1 z-20 w-max bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 gap-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Selected days
                  </span>
                  <button
                    onClick={() => {
                      onClearDates();
                      setSelectionMenuOpen(false);
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-[220px] overflow-y-auto pr-1">
                  {[...selectedDates].sort().map((date) => (
                    <button
                      key={date}
                      onClick={() => onDateToggle(date)}
                      className="flex w-full items-center justify-between gap-4 px-3 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                    >
                      <span className="font-medium text-foreground">
                        {format(parseISO(date), "MMM d, yyyy")}
                      </span>
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Spike dropdown */}
        {spikeCount > 0 && (
          <div className="relative" ref={spikeMenuRef}>
            <button
              onClick={() => setSpikeMenuOpen(!spikeMenuOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {spikeCount} spike{spikeCount > 1 ? "s" : ""} detected
              <ChevronDown
                className={`w-3 h-3 transition-transform ${spikeMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {spikeMenuOpen && (
              <div className="absolute top-full right-0 mt-1 z-20 w-max bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                <div className="px-3 py-2 border-b border-gray-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Filter by spike
                  </span>
                </div>
                {spikes.map((spike) => {
                  const multiplier =
                    spike.rollingAvg > 0
                      ? (spike.count / spike.rollingAvg).toFixed(1)
                      : "N/A";
                  const isChecked = selectedDates.has(spike.date);
                  return (
                    <button
                      key={spike.date}
                      onClick={() => onDateToggle(spike.date)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                    >
                      <Checkbox
                        checked={isChecked}
                        tabIndex={-1}
                        className="pointer-events-none"
                      />
                      <div className="flex-1 text-left">
                        <span className="font-medium text-foreground">
                          {format(parseISO(spike.date), "MMM d, yyyy")}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {spike.count} reviews · {multiplier}x avg
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full flex-1">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
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
                  if (name === "rollingAvg")
                    return [v.toFixed(1), "7-day Avg"];
                  return [v, String(name)];
                }}
                labelFormatter={(label) =>
                  format(parseISO(label), "MMM d, yyyy")
                }
              />
              <Bar
                dataKey="count"
                radius={[2, 2, 0, 0]}
                barSize={8}
                cursor="pointer"
                onClick={(data) =>
                  handleBarClick(data as { date?: string })
                }
              >
                {data.map((entry, index) => {
                  const isDimmed =
                    hasSelection && !selectedDates.has(entry.date);
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isSpike ? "#f59e0b" : "#9ca3af"}
                      opacity={isDimmed ? 0.15 : 0.8}
                      style={{ transition: "opacity 150ms ease" }}
                    />
                  );
                })}
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
          <span className="text-xs text-gray-600">Spike</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0 border-t border-dashed border-gray-500" />
          <span className="text-xs text-gray-600">7-day Rolling Avg</span>
        </div>
      </div>
    </>
  );
}
