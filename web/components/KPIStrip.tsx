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

function formatVolumeSubtext(
  current: number | null,
  prior: number | null
): string {
  if (current === null || prior === null || prior === 0) return "Volume holding steady";
  const delta = ((current - prior) / prior) * 100;
  const sign = delta >= 0 ? "+" : "";
  const pctStr = `${sign}${Math.round(delta)}% vs last period`;
  if (Math.abs(delta) < 5) return `${pctStr} — volume holding steady`;
  if (delta > 0) return `${pctStr} — volume increasing`;
  return `${pctStr} — volume decreasing`;
}

function formatRatingSubtext(
  current: number | null,
  prior: number | null,
  avgRating: number
): string {
  const deltaStr = current !== null && prior !== null
    ? `${current >= prior ? "Up" : "Down"} ${Math.abs(current - prior).toFixed(1)} pts`
    : "";
  const range = avgRating < 3 ? "still in critical range" : avgRating < 4 ? "in warning range" : "looking healthy";
  return deltaStr ? `${deltaStr} — ${range}` : range;
}

function formatNegativeSubtext(
  current: number | null,
  prior: number | null
): string {
  if (current === null || prior === null || prior === 0) return "Improving but loud";
  const delta = ((current - prior) / prior) * 100;
  const sign = delta > 0 ? "Up" : "Down";
  const pctStr = `${sign} ${Math.abs(Math.round(delta))}%`;
  if (delta < 0) return `${pctStr} — improving but loud`;
  if (delta > 0) return `${pctStr} — getting louder`;
  return "Holding steady";
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

  const volumeSubtext = formatVolumeSubtext(currentTotalReviews, priorTotalReviews);
  const ratingSubtext = formatRatingSubtext(currentAvgRating, priorAvgRating, avgRating);
  const negativeSubtext = formatNegativeSubtext(currentNegativeCount, priorNegativeCount);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Voices in the pipe */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Voices in the pipe
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {totalReviews.toLocaleString()}
        </dd>
        <p className="mt-1.5 text-xs text-muted-foreground">{volumeSubtext}</p>
      </div>

      {/* Health signal */}
      <div className="bg-amber-50/50 rounded-xl border border-amber-200/60 border-l-4 border-l-amber-400 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Health signal
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {avgRating.toFixed(2)}
          <span className="text-base font-normal text-muted-foreground ml-1">
            / 5
          </span>
        </dd>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {ratingSubtext.includes("critical") ? (
            <>
              {ratingSubtext.replace(" — still in critical range", "")}
              <span className="text-amber-600"> — still in critical range</span>
            </>
          ) : ratingSubtext.includes("warning") ? (
            <>
              {ratingSubtext.replace(" — in warning range", "")}
              <span className="text-amber-600"> — in warning range</span>
            </>
          ) : (
            ratingSubtext
          )}
        </p>
      </div>

      {/* Pain in the feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Pain in the feed
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {negativePercentage}%
        </dd>
        <p className="mt-1.5 text-xs text-muted-foreground">{negativeSubtext}</p>
      </div>

      {/* Something happened */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Something happened
        </dt>
        <dd className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          {spikeCount}
          <span className="text-base font-normal text-muted-foreground">
            detected
          </span>
        </dd>
        <p className="mt-1.5 text-xs text-muted-foreground">Trend stable between spikes</p>
      </div>
    </div>
  );
}
