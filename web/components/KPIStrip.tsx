"use client";

type Props = {
  totalReviews: number;
  avgRating: number;
  negativeCount: number;
  spikeCount: number;
  priorTotalReviews: number | null;
  priorAvgRating: number | null;
  priorNegativeCount: number | null;
  currentTotalReviews: number | null;
  currentAvgRating: number | null;
  currentNegativeCount: number | null;
};

function formatDeltaPercent(
  current: number | null,
  prior: number | null
): string | null {
  if (current === null || prior === null || prior === 0) return null;
  const delta = ((current - prior) / prior) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${Math.round(delta)}% vs prior period`;
}

function formatDeltaPts(
  current: number | null,
  prior: number | null
): string | null {
  if (current === null || prior === null) return null;
  const delta = current - prior;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} pts vs prior period`;
}

export function KPIStrip({
  totalReviews,
  avgRating,
  negativeCount,
  spikeCount,
  priorTotalReviews,
  priorAvgRating,
  priorNegativeCount,
  currentTotalReviews,
  currentAvgRating,
  currentNegativeCount,
}: Props) {
  const negativePercentage =
    totalReviews > 0
      ? ((negativeCount / totalReviews) * 100).toFixed(1)
      : "0";

  const totalDelta = formatDeltaPercent(currentTotalReviews, priorTotalReviews);
  const ratingDelta = formatDeltaPts(currentAvgRating, priorAvgRating);
  const negativeDelta = formatDeltaPercent(
    currentNegativeCount,
    priorNegativeCount
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Total Reviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Total Reviews
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {totalReviews.toLocaleString()}
        </dd>
        {totalDelta && (
          <p className="mt-1.5 text-xs text-muted-foreground">{totalDelta}</p>
        )}
      </div>

      {/* Avg Rating */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Avg Rating
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {avgRating.toFixed(2)}
          <span className="text-base font-normal text-muted-foreground ml-1">
            / 5
          </span>
        </dd>
        {ratingDelta && (
          <p className="mt-1.5 text-xs text-muted-foreground">{ratingDelta}</p>
        )}
      </div>

      {/* Negative Reviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Negative Reviews
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {negativeCount.toLocaleString()}
          <span className="text-base font-normal text-muted-foreground ml-2">
            {negativePercentage}%
          </span>
        </dd>
        {negativeDelta && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {negativeDelta}
          </p>
        )}
      </div>

      {/* Volume Spikes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Volume Spikes
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {spikeCount}
          <span className="text-base font-normal text-muted-foreground ml-2">
            Detected
          </span>
        </dd>
        <p className="mt-1.5 text-xs text-muted-foreground">Trend stable</p>
      </div>
    </div>
  );
}
