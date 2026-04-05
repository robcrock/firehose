"use client";

import { useState } from "react";
import { SentimentTrendChart } from "./SentimentTrendChart";
import { CategoryBreakdownChart } from "./CategoryBreakdownChart";
import { VolumeSpikesChart } from "./VolumeSpikesChart";
import { TopPhrasesPanel } from "./TopPhrasesPanel";
import { AppComparisonChart } from "./AppComparisonChart";
import { ReviewsTable } from "./ReviewsTable";
import type {
  ClassifiedReview,
  WeeklySentiment,
  DailyCountWithSpike,
  AppStats,
  CategoryCount,
  PhraseCount,
  ChartFilter,
} from "@/lib/types";

type Props = {
  reviews: ClassifiedReview[];
  weeklySentiment: WeeklySentiment[];
  dailyCountsWithSpikes: DailyCountWithSpike[];
  appComparison: AppStats[];
  categoryBreakdown: CategoryCount[];
  topPhrases: PhraseCount[];
};

export function Dashboard({
  reviews,
  weeklySentiment,
  dailyCountsWithSpikes,
  appComparison,
  categoryBreakdown,
  topPhrases,
}: Props) {
  // Default range = last 14 days of the window.
  const defaultStart =
    dailyCountsWithSpikes[Math.max(0, dailyCountsWithSpikes.length - 14)]?.date ?? "";
  const defaultEnd =
    dailyCountsWithSpikes[dailyCountsWithSpikes.length - 1]?.date ?? "";

  const [range, setRange] = useState<{ start: string; end: string }>({
    start: defaultStart,
    end: defaultEnd,
  });

  // Chart filter state - clicking chart elements filters the review list
  const [chartFilter, setChartFilter] = useState<ChartFilter | null>(null);

  // Toggle filter: clicking same element clears it, clicking different element sets it
  const handleChartFilter = (filter: ChartFilter | null) => {
    if (
      chartFilter &&
      filter &&
      chartFilter.type === filter.type &&
      chartFilter.value === filter.value
    ) {
      setChartFilter(null);
    } else {
      setChartFilter(filter);
    }
  };

  const clearChartFilter = () => setChartFilter(null);

  return (
    <div className="space-y-6">
      {/* Insight Charts Grid - 2x2 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SentimentTrendChart 
          data={weeklySentiment} 
          selectedFilter={chartFilter}
          onFilterChange={handleChartFilter}
        />
        <CategoryBreakdownChart 
          data={categoryBreakdown} 
          selectedFilter={chartFilter}
          onFilterChange={handleChartFilter}
        />
        <AppComparisonChart 
          data={appComparison} 
          selectedFilter={chartFilter}
          onFilterChange={handleChartFilter}
        />
        <TopPhrasesPanel 
          data={topPhrases} 
          selectedFilter={chartFilter}
          onFilterChange={handleChartFilter}
        />
      </div>

      {/* Volume Chart with Spike Detection */}
      <VolumeSpikesChart
        data={dailyCountsWithSpikes}
        onRangeChange={(start, end) => setRange({ start, end })}
      />

      {/* Reviews Table */}
      <ReviewsTable
        reviews={reviews}
        startDate={range.start}
        endDate={range.end}
        chartFilter={chartFilter}
        onClearChartFilter={clearChartFilter}
      />
    </div>
  );
}
