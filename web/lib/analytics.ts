import { format, parseISO, startOfWeek, addDays } from "date-fns";
import type {
  ClassifiedReview,
  Review,
  WeeklySentiment,
  DailyCountWithSpike,
  AppStats,
  PhraseCount,
  CategoryCount,
  ReviewCategory,
} from "./types";

/**
 * Aggregate reviews into weekly sentiment buckets showing average rating trend.
 */
export function getWeeklySentiment(reviews: Review[]): WeeklySentiment[] {
  const weekMap = new Map<string, { sum: number; count: number; weekStart: string }>();

  for (const review of reviews) {
    const date = parseISO(review.date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const weekKey = format(weekStart, "yyyy-MM-dd");
    const weekLabel = format(weekStart, "MMM d");

    const existing = weekMap.get(weekKey);
    if (existing) {
      existing.sum += review.rating;
      existing.count += 1;
    } else {
      weekMap.set(weekKey, { sum: review.rating, count: 1, weekStart: weekKey });
    }
  }

  return Array.from(weekMap.entries())
    .map(([key, { sum, count, weekStart }]) => ({
      week: format(parseISO(weekStart), "MMM d"),
      weekStart,
      avgRating: Math.round((sum / count) * 100) / 100,
      count,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/**
 * Calculate daily counts with spike detection.
 * A spike is when the count is > 2x the 7-day rolling average.
 */
export function getDailyCountsWithSpikes(
  reviews: Review[],
  windowDays: number,
  generatedAt: string
): DailyCountWithSpike[] {
  const end = parseISO(generatedAt);
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  const startDay = addDays(endDay, -(windowDays - 1));

  // Build initial counts
  const counts = new Map<string, number>();
  for (let d = startDay; d <= endDay; d = addDays(d, 1)) {
    counts.set(format(d, "yyyy-MM-dd"), 0);
  }

  for (const r of reviews) {
    const d = parseISO(r.date);
    const day = format(
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
      "yyyy-MM-dd"
    );
    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  const dailyData = Array.from(counts, ([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate rolling averages and detect spikes
  return dailyData.map((day, index) => {
    // Calculate 7-day rolling average (previous 7 days, not including current)
    const lookbackStart = Math.max(0, index - 7);
    const lookbackEnd = index;
    const lookbackDays = dailyData.slice(lookbackStart, lookbackEnd);
    
    const rollingAvg = lookbackDays.length > 0
      ? lookbackDays.reduce((sum, d) => sum + d.count, 0) / lookbackDays.length
      : day.count;

    const isSpike = day.count > rollingAvg * 2 && day.count > 5; // Require minimum 5 reviews to be a spike

    return {
      ...day,
      isSpike,
      rollingAvg: Math.round(rollingAvg * 10) / 10,
    };
  });
}

/**
 * Get comparison statistics for each app.
 */
export function getAppComparison(reviews: ClassifiedReview[]): AppStats[] {
  const appMap = new Map<string, {
    displayName: string;
    sum: number;
    count: number;
    categories: Record<ReviewCategory, number>;
  }>();

  const defaultCategories = (): Record<ReviewCategory, number> => ({
    bug: 0,
    feature_request: 0,
    clinical_concern: 0,
    positive: 0,
    other: 0,
  });

  for (const review of reviews) {
    const existing = appMap.get(review.app);
    if (existing) {
      existing.sum += review.rating;
      existing.count += 1;
      existing.categories[review.category] += 1;
    } else {
      const categories = defaultCategories();
      categories[review.category] = 1;
      appMap.set(review.app, {
        displayName: review.appDisplayName,
        sum: review.rating,
        count: 1,
        categories,
      });
    }
  }

  return Array.from(appMap.entries())
    .map(([app, { displayName, sum, count, categories }]) => {
      const avgRating = Math.round((sum / count) * 100) / 100;
      // Pain score: higher volume of low ratings = more pain
      // Formula: (5 - avgRating) * count / 10
      const painScore = Math.round(((5 - avgRating) * count) / 10);
      
      return {
        app,
        displayName,
        avgRating,
        count,
        categoryBreakdown: categories,
        painScore,
      };
    })
    .sort((a, b) => b.painScore - a.painScore); // Sort by pain (highest first)
}

/**
 * Get category distribution across all reviews.
 */
export function getCategoryBreakdown(reviews: ClassifiedReview[]): CategoryCount[] {
  const counts: Record<ReviewCategory, number> = {
    bug: 0,
    feature_request: 0,
    clinical_concern: 0,
    positive: 0,
    other: 0,
  };

  for (const review of reviews) {
    counts[review.category] += 1;
  }

  const total = reviews.length;
  
  return Object.entries(counts)
    .map(([category, count]) => ({
      category: category as ReviewCategory,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Extract top recurring phrases from low-rated reviews.
 */
export function getTopPhrases(
  reviews: ClassifiedReview[],
  options: { maxRating?: number; limit?: number } = {}
): PhraseCount[] {
  const { maxRating = 2, limit = 15 } = options;
  
  const phraseMap = new Map<string, { count: number; apps: Set<string> }>();
  
  // Filter to low-rated reviews
  const lowRatedReviews = reviews.filter(r => r.rating <= maxRating);
  
  for (const review of lowRatedReviews) {
    for (const phrase of review.keyPhrases) {
      const normalizedPhrase = phrase.toLowerCase().trim();
      if (normalizedPhrase.length < 3) continue; // Skip very short phrases
      
      const existing = phraseMap.get(normalizedPhrase);
      if (existing) {
        existing.count += 1;
        existing.apps.add(review.appDisplayName);
      } else {
        phraseMap.set(normalizedPhrase, {
          count: 1,
          apps: new Set([review.appDisplayName]),
        });
      }
    }
  }

  return Array.from(phraseMap.entries())
    .map(([phrase, { count, apps }]) => ({
      phrase,
      count,
      apps: Array.from(apps),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Category display configuration
 */
export const CATEGORY_CONFIG: Record<ReviewCategory, { label: string; color: string; bgColor: string }> = {
  bug: { label: "Bug", color: "#dc2626", bgColor: "bg-red-100 text-red-800" },
  feature_request: { label: "Feature Request", color: "#2563eb", bgColor: "bg-blue-100 text-blue-800" },
  clinical_concern: { label: "Clinical Concern", color: "#7c3aed", bgColor: "bg-purple-100 text-purple-800" },
  positive: { label: "Positive", color: "#16a34a", bgColor: "bg-green-100 text-green-800" },
  other: { label: "Other", color: "#6b7280", bgColor: "bg-gray-100 text-gray-800" },
};
