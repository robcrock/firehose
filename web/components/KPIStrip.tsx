"use client";

import { useFilter } from "@/lib/filter-context";

type Props = {
  totalReviews: number;
  avgRating: number;
  negativeCount: number;
  spikeCount: number;
  onScrollToSpikes: () => void;
};

export function KPIStrip({
  totalReviews,
  avgRating,
  negativeCount,
  spikeCount,
  onScrollToSpikes,
}: Props) {
  const { reset, setRatingBucket, filter } = useFilter();

  const negativePercentage = totalReviews > 0 
    ? ((negativeCount / totalReviews) * 100).toFixed(1) 
    : "0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Reviews - clears all filters */}
      <button
        onClick={reset}
        className="group bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 group-hover:text-blue-600">
          Total Reviews
        </dt>
        <dd className="mt-1 text-[32px] font-semibold text-gray-900 tabular-nums">
          {totalReviews.toLocaleString()}
        </dd>
      </button>

      {/* Avg Rating - sets ratingBucket="1-2" */}
      <button
        onClick={() => setRatingBucket(filter.ratingBucket === "1-2" ? "all" : "1-2")}
        className={`group bg-white rounded-xl border p-6 text-left hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          filter.ratingBucket === "1-2" 
            ? "border-blue-400 ring-1 ring-blue-200" 
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 group-hover:text-blue-600">
          Avg Rating
        </dt>
        <dd className="mt-1 text-[32px] font-semibold text-gray-900 tabular-nums">
          {avgRating.toFixed(2)}
          <span className="text-base font-normal text-gray-400 ml-1">/ 5</span>
        </dd>
      </button>

      {/* Negative Reviews - sets ratingBucket="1-2" */}
      <button
        onClick={() => setRatingBucket(filter.ratingBucket === "1-2" ? "all" : "1-2")}
        className={`group bg-white rounded-xl border p-6 text-left hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
          filter.ratingBucket === "1-2" 
            ? "border-blue-400 ring-1 ring-blue-200" 
            : "border-gray-200 hover:border-blue-300"
        }`}
      >
        <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 group-hover:text-red-600">
          Negative Reviews
        </dt>
        <dd className="mt-1 text-[32px] font-semibold text-red-600 tabular-nums">
          {negativeCount.toLocaleString()}
          <span className="text-base font-normal text-gray-400 ml-1">
            ({negativePercentage}%)
          </span>
        </dd>
      </button>

      {/* Volume Spikes - scrolls to Zone 5 */}
      <button
        onClick={onScrollToSpikes}
        className="group bg-white rounded-xl border border-gray-200 p-6 text-left hover:border-amber-300 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-500 group-hover:text-amber-600">
          Volume Spikes
        </dt>
        <dd className="mt-1 text-[32px] font-semibold text-amber-600 tabular-nums">
          {spikeCount}
          <span className="text-base font-normal text-gray-400 ml-1">
            detected
          </span>
        </dd>
      </button>
    </div>
  );
}
