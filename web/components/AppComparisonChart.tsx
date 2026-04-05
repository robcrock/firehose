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
import type { AppStats, ChartFilter } from "@/lib/types";

type Props = {
  data: AppStats[];
  selectedFilter: ChartFilter | null;
  onFilterChange: (filter: ChartFilter | null) => void;
};

// Color scale from green (low pain) to red (high pain)
function getPainColor(painScore: number, maxPain: number): string {
  const ratio = painScore / maxPain;
  if (ratio < 0.33) return "#22c55e"; // green
  if (ratio < 0.66) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function AppComparisonChart({ data, selectedFilter, onFilterChange }: Props) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAppClick = (app: string, displayName: string) => {
    onFilterChange({
      type: 'app',
      value: app,
      label: displayName,
    });
  };

  const isSelected = (app: string) =>
    selectedFilter?.type === 'app' && selectedFilter.value === app;

  const isOtherSelected = selectedFilter?.type === 'app';

  const maxPain = Math.max(...data.map(d => d.painScore), 1);
  
  const chartData = data.map(d => ({
    ...d,
    shortName: d.displayName.replace(/FreeStyle\s*/gi, "").replace(/\s*\(US\)/gi, ""),
    painColor: getPainColor(d.painScore, maxPain),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">App Comparison</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Pain score = (5 - avg rating) x volume / 10
          </p>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {chartData.slice(0, 4).map(app => (
          <button
            key={app.app}
            onClick={() => handleAppClick(app.app, app.displayName)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
              isSelected(app.app)
                ? 'border-blue-300 bg-blue-50/50 ring-1 ring-blue-200'
                : isOtherSelected
                ? 'border-gray-100 bg-gray-50/50 opacity-40'
                : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-100/50'
            }`}
            aria-pressed={isSelected(app.app)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate" title={app.displayName}>
                  {app.shortName}
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-0.5">
                  {app.avgRating.toFixed(1)}
                  <span className="text-xs font-normal text-gray-400 ml-0.5">/ 5</span>
                </p>
              </div>
              <div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: app.painColor }}
                title={`Pain score: ${app.painScore}`}
              >
                {app.painScore}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {app.count} reviews
            </p>
          </button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="w-full h-[120px]">
        {mounted && (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value, _name, item) => {
                const payload = (item as { payload?: AppStats }).payload;
                if (!payload) return [String(value), "Pain Score"];
                return [
                  `${value} (Avg: ${payload.avgRating.toFixed(1)}, ${payload.count} reviews)`,
                  "Pain Score",
                ];
              }}
            />
            <Bar 
              dataKey="painScore" 
              radius={[0, 4, 4, 0]} 
              barSize={16}
              cursor="pointer"
              onClick={(data) => {
                const payload = (data as { payload?: AppStats }).payload;
                if (payload) handleAppClick(payload.app, payload.displayName);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.painColor}
                  opacity={isOtherSelected && !isSelected(entry.app) ? 0.3 : 1}
                  className="transition-opacity duration-200"
                />
              ))}
            </Bar>
          </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
