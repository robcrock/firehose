"use client";

import { useRef, useMemo, useCallback, useState } from "react";
import { GlobalFilterBar } from "./GlobalFilterBar";
import { KPIStrip } from "./KPIStrip";
import { TabbedChartCard } from "./TabbedChartCard";
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
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  const handleDateSelect = useCallback(
    (date: string) => {
      setSelectedDates((prev) => {
        const next = new Set(prev);
        if (next.has(date)) {
          next.delete(date);
        } else {
          next.add(date);
        }
        return next;
      });
    },
    []
  );

  const clearSelectedDates = useCallback(() => {
    setSelectedDates(new Set());
  }, []);

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

  // Prior period KPIs: split filtered reviews into first half (prior) and
  // second half (current) by date, then compare. This always works regardless
  // of how much historical data is available.
  const priorPeriodKPIs = useMemo(() => {
    if (filteredReviews.length < 4) return null;

    const sorted = [...filteredReviews].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
    const mid = Math.floor(sorted.length / 2);
    const priorHalf = sorted.slice(0, mid);

    const priorTotal = priorHalf.length;
    const priorAvg =
      priorTotal > 0
        ? priorHalf.reduce((sum, r) => sum + r.rating, 0) / priorTotal
        : 0;
    const priorNegative = priorHalf.filter((r) => r.rating <= 2).length;

    return {
      totalReviews: priorTotal,
      avgRating: priorAvg,
      negativeCount: priorNegative,
    };
  }, [filteredReviews]);

  // Current half KPIs (second half of the sorted filtered reviews)
  const currentHalfKPIs = useMemo(() => {
    if (filteredReviews.length < 4) return null;

    const sorted = [...filteredReviews].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
    const mid = Math.floor(sorted.length / 2);
    const currentHalf = sorted.slice(mid);

    const currentTotal = currentHalf.length;
    const currentAvg =
      currentTotal > 0
        ? currentHalf.reduce((sum, r) => sum + r.rating, 0) / currentTotal
        : 0;
    const currentNegative = currentHalf.filter((r) => r.rating <= 2).length;

    return {
      totalReviews: currentTotal,
      avgRating: currentAvg,
      negativeCount: currentNegative,
    };
  }, [filteredReviews]);

  const scrollToSpikes = useCallback(() => {
    volumeChartRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const scrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="space-y-6">
      {/* Filter bar portals into the header slot */}
      <GlobalFilterBar
        apps={initialAppComparison}
        totalFilteredCount={totalReviews}
      />

      {/* Zone 1: KPI Strip */}
      <KPIStrip
        totalReviews={totalReviews}
        avgRating={avgRating}
        negativeCount={negativeCount}
        spikeCount={spikeCount}
        priorTotalReviews={priorPeriodKPIs?.totalReviews ?? null}
        priorAvgRating={priorPeriodKPIs?.avgRating ?? null}
        priorNegativeCount={priorPeriodKPIs?.negativeCount ?? null}
        currentTotalReviews={currentHalfKPIs?.totalReviews ?? null}
        currentAvgRating={currentHalfKPIs?.avgRating ?? null}
        currentNegativeCount={currentHalfKPIs?.negativeCount ?? null}
      />

      {/* Zone 3: Charts + Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-3" ref={volumeChartRef}>
          <TabbedChartCard
            tabs={[
              { id: "sentiment", label: "Sentiment Trend" },
              { id: "volume", label: "Review Volume" },
            ]}
            defaultTab="sentiment"
          >
            {(activeTab) =>
              activeTab === "sentiment" ? (
                <SentimentTrendChart data={weeklySentiment} />
              ) : (
                <VolumeSpikesChart
                  data={dailyCountsWithSpikes}
                  selectedDates={selectedDates}
                  onDateToggle={handleDateSelect}
                  onClearDates={clearSelectedDates}
                />
              )
            }
          </TabbedChartCard>
        </div>
        <div className="flex flex-col gap-6">
          <CategoryBreakdownChart data={categoryBreakdown} />
          <AppComparisonChart data={appComparison} allReviews={filteredReviews} />
        </div>
      </div>

      {/* Zone 4: Reviews + Top Pain Points */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-h-[100vh]">
        <div className="md:col-span-3 min-h-0">
          <ReviewsTable ref={reviewsRef} reviews={reviews} selectedDates={selectedDates} />
        </div>
        <div className="min-h-0">
          <TopPhrasesPanel data={topPhrases} onScrollToReviews={scrollToReviews} />
        </div>
      </div>
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
