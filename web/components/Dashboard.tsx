"use client";

import { useState } from "react";
import { ReviewsChart } from "./ReviewsChart";
import { ReviewsTable } from "./ReviewsTable";
import type { DailyCount, Review } from "@/lib/types";

type Props = {
  reviews: Review[];
  dailyCounts: DailyCount[];
};

export function Dashboard({ reviews, dailyCounts }: Props) {
  // Default range = last 14 days of the window.
  const defaultStart = dailyCounts[Math.max(0, dailyCounts.length - 14)]?.date ?? "";
  const defaultEnd = dailyCounts[dailyCounts.length - 1]?.date ?? "";

  const [range, setRange] = useState<{ start: string; end: string }>({
    start: defaultStart,
    end: defaultEnd,
  });

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <ReviewsChart
          data={dailyCounts}
          onRangeChange={(start, end) => setRange({ start, end })}
        />
      </div>
      <ReviewsTable reviews={reviews} startDate={range.start} endDate={range.end} />
    </>
  );
}
