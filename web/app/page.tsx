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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-6">
          <h1 className="text-display font-semibold tracking-tight text-foreground">
            Firehose
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed flex items-center gap-1.5">
            What users are saying about Libre — last {data.windowDays} days
            <span className="mx-1 text-border">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-muted-foreground/80">live</span>
            </span>
          </p>
        </header>

        <Dashboard
          reviews={classifiedReviews}
          weeklySentiment={weeklySentiment}
          dailyCountsWithSpikes={dailyCountsWithSpikes}
          appComparison={appComparison}
          categoryBreakdown={categoryBreakdown}
          topPhrases={topPhrases}
          windowDays={data.windowDays}
          generatedAt={data.generatedAt}
        />
      </main>
    </div>
  );
}
