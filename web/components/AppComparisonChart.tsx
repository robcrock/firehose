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
import type { AppStats } from "@/lib/types";

type Props = {
  data: AppStats[];
};

// Color scale from green (low pain) to red (high pain)
function getPainColor(painScore: number, maxPain: number): string {
  const ratio = painScore / maxPain;
  if (ratio < 0.33) return "#22c55e"; // green
  if (ratio < 0.66) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function AppComparisonChart({ data }: Props) {
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
          <div
            key={app.app}
            className="p-3 rounded-lg border border-gray-100 bg-gray-50/50"
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
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
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
              formatter={(value: number, name: string, props: { payload: AppStats }) => {
                const payload = props.payload;
                return [
                  `${value} (Avg: ${payload.avgRating.toFixed(1)}, ${payload.count} reviews)`,
                  "Pain Score",
                ];
              }}
            />
            <Bar dataKey="painScore" radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.painColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
