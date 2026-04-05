import { Dashboard } from "@/components/Dashboard";
import { getReviews, getClassifiedReviews } from "@/lib/reviews";
import {
  getWeeklySentiment,
  getDailyCountsWithSpikes,
  getAppComparison,
  getCategoryBreakdown,
  getTopPhrases,
} from "@/lib/analytics";

// Read reviews.json at build time and serve the result as a static page.
// New data requires a redeploy (either a push to main, or Vercel's "Redeploy"
// button) — matches the manual-refresh workflow.
export const dynamic = "force-static";

export default async function Home() {
  const data = await getReviews();
  const classifiedReviews = await getClassifiedReviews();

  // Compute all analytics at build time
  const weeklySentiment = getWeeklySentiment(data.reviews);
  const dailyCountsWithSpikes = getDailyCountsWithSpikes(
    data.reviews,
    data.windowDays,
    data.generatedAt
  );
  const appComparison = getAppComparison(classifiedReviews);
  const categoryBreakdown = getCategoryBreakdown(classifiedReviews);
  const topPhrases = getTopPhrases(classifiedReviews, { maxRating: 2, limit: 15 });

  const totalReviews = data.reviews.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : data.reviews.reduce((s, r) => s + r.rating, 0) / totalReviews;

  // Count spikes for header
  const spikeCount = dailyCountsWithSpikes.filter((d) => d.isSpike).length;

  // Count negative reviews (1-2 stars)
  const negativeCount = data.reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Product Feedback Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                FreeStyle Libre app reviews from the last {data.windowDays} days
                <span className="mx-2">·</span>
                <span className="text-gray-400">
                  Updated {data.generatedAt.slice(0, 10)}
                </span>
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Total Reviews
              </dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
                {totalReviews.toLocaleString()}
              </dd>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Avg Rating
              </dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">
                {avgRating.toFixed(2)}
                <span className="text-sm font-normal text-gray-400 ml-1">/ 5</span>
              </dd>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Negative Reviews
              </dt>
              <dd className="mt-1 text-2xl font-bold text-red-600 tabular-nums">
                {negativeCount.toLocaleString()}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  ({((negativeCount / totalReviews) * 100).toFixed(1)}%)
                </span>
              </dd>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Volume Spikes
              </dt>
              <dd className="mt-1 text-2xl font-bold text-amber-600 tabular-nums">
                {spikeCount}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  detected
                </span>
              </dd>
            </div>
          </div>
        </header>

        <Dashboard
          reviews={classifiedReviews}
          weeklySentiment={weeklySentiment}
          dailyCountsWithSpikes={dailyCountsWithSpikes}
          appComparison={appComparison}
          categoryBreakdown={categoryBreakdown}
          topPhrases={topPhrases}
        />
      </main>
    </div>
  );
}
