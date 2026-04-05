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
import { ChevronDown, X } from "lucide-react";
import type { AppStats, ClassifiedReview, PhraseCount, WeeklySentiment } from "@/lib/types";
import { useFilter } from "@/lib/filter-context";
import { getAppPainPoints, getWeeklySentiment } from "@/lib/analytics";

type Props = {
  data: AppStats[];
  allReviews: ClassifiedReview[];
};

// Color scale from green (low pain) to red (high pain)
function getPainColor(painScore: number, maxPain: number): string {
  const ratio = painScore / maxPain;
  if (ratio < 0.33) return "#22c55e"; // green
  if (ratio < 0.66) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function MiniTrendChart({ data }: { data: WeeklySentiment[] }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || data.length === 0) return null;

  const minRating = Math.min(...data.map((d) => d.avgRating));
  const maxRating = Math.max(...data.map((d) => d.avgRating));
  const range = maxRating - minRating || 1;

  return (
    <svg className="w-full h-8" viewBox={`0 0 ${data.length * 10} 32`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.5"
        points={data
          .map((d, i) => {
            const x = i * 10 + 5;
            const y = 30 - ((d.avgRating - minRating) / range) * 24;
            return `${x},${y}`;
          })
          .join(" ")}
      />
    </svg>
  );
}

type AppDrawerProps = {
  app: AppStats;
  painPoints: PhraseCount[];
  miniTrendData: WeeklySentiment[];
  onFilterToApp: () => void;
};

function AppDrawer({ app, painPoints, miniTrendData, onFilterToApp }: AppDrawerProps) {
  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
      <div className="grid grid-cols-2 gap-4">
        {/* Pain Points */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Top Pain Points
          </h4>
          {painPoints.length === 0 ? (
            <p className="text-sm text-gray-400">No pain points found</p>
          ) : (
            <ul className="space-y-1.5">
              {painPoints.slice(0, 5).map((p) => (
                <li key={p.phrase} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate">{p.phrase}</span>
                  <span className="text-gray-400 tabular-nums ml-2">{p.count}x</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Mini Trend */}
        <div>
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Sentiment Trend
          </h4>
          <div className="bg-white rounded border border-gray-100 p-2">
            <MiniTrendChart data={miniTrendData} />
          </div>
        </div>
      </div>
      <button
        onClick={onFilterToApp}
        className="mt-4 w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Filter to this app
      </button>
    </div>
  );
}

export function AppComparisonChart({ data, allReviews }: Props) {
  const [mounted, setMounted] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const { filter, toggleApp, setApps } = useFilter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const maxPain = Math.max(...data.map((d) => d.painScore), 1);

  const chartData = data.map((d) => ({
    ...d,
    shortName: d.displayName
      .replace(/FreeStyle\s*/gi, "")
      .replace(/\s*\(US\)/gi, ""),
    painColor: getPainColor(d.painScore, maxPain),
  }));

  const hasActiveFilter = filter.apps.length > 0;

  const isSelected = (app: string) => filter.apps.includes(app);
  
  const clearApps = () => {
    setApps([]);
  };

  const handleRowClick = (app: string) => {
    setExpandedApp(expandedApp === app ? null : app);
  };

  const handleFilterToApp = (app: string) => {
    setApps([app]);
    setExpandedApp(null);
  };

  // Get pain points for expanded app
  const getPainPointsForApp = (appSlug: string): PhraseCount[] => {
    return getAppPainPoints(allReviews, appSlug, 5, 2);
  };

  // Get mini trend data for expanded app
  const getMiniTrendForApp = (appSlug: string): WeeklySentiment[] => {
    const appReviews = allReviews.filter((r) => r.app === appSlug);
    return getWeeklySentiment(appReviews).slice(-8); // Last 8 weeks
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">App Comparison</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Pain score = (5 - avg rating) x volume / 10
          </p>
        </div>
        {hasActiveFilter && (
          <button
            onClick={clearApps}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>

      {/* App Rows with Inline Drawers */}
      <div className="space-y-2">
        {chartData.map((app) => {
          const selected = isSelected(app.app);
          const dimmed = hasActiveFilter && !selected;
          const isExpanded = expandedApp === app.app;

          return (
            <div key={app.app}>
              <button
                onClick={() => handleRowClick(app.app)}
                className={`w-full p-3 rounded-lg border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isExpanded
                    ? "border-blue-300 bg-blue-50/50"
                    : dimmed
                    ? "border-gray-100 bg-gray-50/30 opacity-25"
                    : "border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-100/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Pain Score Badge */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: app.painColor }}
                    title={`Pain score: ${app.painScore}`}
                  >
                    {app.painScore}
                  </div>

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {app.shortName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {app.avgRating.toFixed(1)} avg
                      </span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-500">
                        {app.count} reviews
                      </span>
                    </div>
                  </div>

                  {/* Pain Bar */}
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(app.painScore / maxPain) * 100}%`,
                        backgroundColor: app.painColor,
                      }}
                    />
                  </div>

                  {/* Rating Badge */}
                  <div
                    className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${
                      app.avgRating >= 4
                        ? "bg-green-100 text-green-800"
                        : app.avgRating >= 3
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {app.avgRating.toFixed(1)}
                  </div>

                  {/* Expand Icon */}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Inline Drawer */}
              {isExpanded && (
                <AppDrawer
                  app={app}
                  painPoints={getPainPointsForApp(app.app)}
                  miniTrendData={getMiniTrendForApp(app.app)}
                  onFilterToApp={() => handleFilterToApp(app.app)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Bar Chart */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="w-full h-[80px]">
          {mounted && (
            <ResponsiveContainer width="100%" height={80}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fontSize: 9, fill: "#6b7280" }}
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
                  formatter={(value, _name, item) => {
                    const payload = (item as { payload?: AppStats }).payload;
                    if (!payload) return [String(value), "Pain Score"];
                    return [
                      `${value} (Avg: ${payload.avgRating.toFixed(1)}, ${
                        payload.count
                      } reviews)`,
                      "Pain Score",
                    ];
                  }}
                />
                <Bar
                  dataKey="painScore"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                  cursor="pointer"
                  onClick={(data) => {
                    const payload = (data as { payload?: AppStats }).payload;
                    if (payload) toggleApp(payload.app);
                  }}
                >
                  {chartData.map((entry, index) => {
                    const dimmed = hasActiveFilter && !isSelected(entry.app);
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.painColor}
                        opacity={dimmed ? 0.25 : 1}
                        className="transition-opacity duration-200"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
