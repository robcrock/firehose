import { Dashboard } from "@/components/Dashboard";
import { getDailyCounts, getReviews } from "@/lib/reviews";

// Read reviews.json at build time and serve the result as a static page.
// New data requires a redeploy (either a push to main, or Vercel's "Redeploy"
// button) — matches the manual-refresh workflow.
export const dynamic = "force-static";

export default async function Home() {
  const data = await getReviews();
  const dailyCounts = getDailyCounts(data.reviews, data.windowDays, data.generatedAt);

  const totalReviews = data.reviews.length;
  const avgRating =
    totalReviews === 0
      ? 0
      : data.reviews.reduce((s, r) => s + r.rating, 0) / totalReviews;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Firehose
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              FreeStyle Libre app reviews · last {data.windowDays} days · generated{" "}
              {data.generatedAt.slice(0, 10)}
            </p>
          </div>
          <dl className="flex gap-6 text-right">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Reviews
              </dt>
              <dd className="mt-0.5 text-2xl font-semibold text-gray-900 tabular-nums">
                {totalReviews.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                Avg rating
              </dt>
              <dd className="mt-0.5 text-2xl font-semibold text-gray-900 tabular-nums">
                {avgRating.toFixed(2)}
              </dd>
            </div>
          </dl>
        </header>

        <Dashboard reviews={data.reviews} dailyCounts={dailyCounts} />
      </main>
    </div>
  );
}
