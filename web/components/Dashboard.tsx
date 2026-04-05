"use client";

import { useRef, useMemo, useCallback } from "react";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { KPIStrip } from "./KPIStrip";
import { SentimentTrendChart } from "./SentimentTrendChart";
import { CategoryBreakdownChart } from "./CategoryBreakdownChart";
import { VolumeSpikesChart } from "./VolumeSpikesChart";
import { TopPhrasesPanel } from "./TopPhrasesPanel";
import { AppComparisonChart } from "./AppComparisonChart";
import { ReviewsTable } from "./ReviewsTable";
import { FilterProvider, useFilter } from "@/lib/filter-context";
import {
  filterReviews,
  getWeeklySentiment,
  getDailyCountsWithSpikes,
  getAppComparison,
  getCategoryBreakdown,
  getTopPhrases,
} from "@/lib/analytics";
import type {
  ClassifiedReview,
  WeeklySentiment,
  DailyCountWithSpike,
  AppStats,
  CategoryCount,
  PhraseCount,
} from "@/lib/types";

type DashboardContentProps = {
  reviews: ClassifiedReview[];
  weeklySentiment: WeeklySentiment[];
  dailyCountsWithSpikes: DailyCountWithSpike[];
  appComparison: AppStats[];
  categoryBreakdown: CategoryCount[];
  topPhrases: PhraseCount[];
  windowDays: number;
  generatedAt: string;
};

function DashboardContent({
  reviews,
  weeklySentiment: initialWeeklySentiment,
  dailyCountsWithSpikes: initialDailyCountsWithSpikes,
  appComparison: initialAppComparison,
  categoryBreakdown: initialCategoryBreakdown,
  topPhrases: initialTopPhrases,
  windowDays,
  generatedAt,
}: DashboardContentProps) {
  const { filter } = useFilter();
  const volumeChartRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Filter reviews based on FilterState
  const filteredReviews = useMemo(() => {
    return filterReviews(reviews, filter);
  }, [reviews, filter]);

  // Recompute analytics for filtered reviews
  const weeklySentiment = useMemo(() => {
    return getWeeklySentiment(filteredReviews);
  }, [filteredReviews]);

  const dailyCountsWithSpikes = useMemo(() => {
    return getDailyCountsWithSpikes(filteredReviews, windowDays, generatedAt);
  }, [filteredReviews, windowDays, generatedAt]);

  const appComparison = useMemo(() => {
    return getAppComparison(filteredReviews);
  }, [filteredReviews]);

  const categoryBreakdown = useMemo(() => {
    return getCategoryBreakdown(filteredReviews);
  }, [filteredReviews]);

  const topPhrases = useMemo(() => {
    return getTopPhrases(filteredReviews, { maxRating: 2, limit: 15 });
  }, [filteredReviews]);

  // KPI calculations
  const totalReviews = filteredReviews.length;
  const avgRating =
    totalReviews > 0
      ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
  const negativeCount = filteredReviews.filter((r) => r.rating <= 2).length;
  const spikeCount = dailyCountsWithSpikes.filter((d) => d.isSpike).length;

  const scrollToSpikes = useCallback(() => {
    volumeChartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const scrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="space-y-6">
      {/* Zone 1: Global Filter Bar */}
      <GlobalFilterBar
        apps={initialAppComparison}
        totalFilteredCount={totalReviews}
      />

      {/* Zone 2: KPI Strip */}
      <KPIStrip
        totalReviews={totalReviews}
        avgRating={avgRating}
        negativeCount={negativeCount}
        spikeCount={spikeCount}
        onScrollToSpikes={scrollToSpikes}
      />

      {/* Zone 3: Overview - Trends + Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SentimentTrendChart data={weeklySentiment} />
        <CategoryBreakdownChart data={categoryBreakdown} />
      </div>

      {/* Zone 4: Zoom - Diagnostic Drill-downs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppComparisonChart data={appComparison} allReviews={filteredReviews} />
        <TopPhrasesPanel data={topPhrases} onScrollToReviews={scrollToReviews} />
      </div>

      {/* Zone 5: Volume & Anomaly Detection */}
      <VolumeSpikesChart
        ref={volumeChartRef}
        data={dailyCountsWithSpikes}
        onScrollToReviews={scrollToReviews}
      />

      {/* Zone 6: Review List */}
      <ReviewsTable ref={reviewsRef} reviews={reviews} />
    </div>
  );
}

type Props = {
  reviews: ClassifiedReview[];
  weeklySentiment: WeeklySentiment[];
  dailyCountsWithSpikes: DailyCountWithSpike[];
  appComparison: AppStats[];
  categoryBreakdown: CategoryCount[];
  topPhrases: PhraseCount[];
  windowDays: number;
  generatedAt: string;
};

export function Dashboard(props: Props) {
  return (
    <FilterProvider>
      <DashboardContent {...props} />
    </FilterProvider>
  );
}
