export type Review = {
  id: string;
  app: string;
  appDisplayName: string;
  platform: "mobile";
  os: "ios" | "android";
  rating: number;
  title: string | null;
  body: string;
  author: string | null;
  date: string; // ISO 8601 UTC
  url: string | null;
};

export type AppConfig = {
  slug: string;
  displayName: string;
  os: "ios" | "android";
  storeId: string;
};

export type ReviewsFile = {
  generatedAt: string;
  windowDays: number;
  apps: AppConfig[];
  reviews: Review[];
};

export type DailyCount = {
  date: string; // YYYY-MM-DD
  count: number;
};

// Review categories for AI classification
export type ReviewCategory = 'bug' | 'feature_request' | 'clinical_concern' | 'positive' | 'other';

// Extended review with AI-generated classification
export type ClassifiedReview = Review & {
  category: ReviewCategory;
  keyPhrases: string[];
  sentiment: 'negative' | 'neutral' | 'positive';
};

// Weekly sentiment aggregation for trend chart
export type WeeklySentiment = {
  week: string;        // YYYY-Www format or display label
  weekStart: string;   // YYYY-MM-DD for sorting
  avgRating: number;
  count: number;
};

// Daily counts with spike detection
export type DailyCountWithSpike = DailyCount & {
  isSpike: boolean;
  rollingAvg: number;
};

// App comparison statistics
export type AppStats = {
  app: string;
  displayName: string;
  avgRating: number;
  count: number;
  categoryBreakdown: Record<ReviewCategory, number>;
  painScore: number; // Higher = more pain (low rating * high volume)
};

// Phrase frequency for top phrases panel
export type PhraseCount = {
  phrase: string;
  count: number;
  apps: string[];
};

// Category distribution for breakdown chart
export type CategoryCount = {
  category: ReviewCategory;
  count: number;
  percentage: number;
};

// Chart filter types for click-to-filter interaction
export type ChartFilterType = 'category' | 'app' | 'week' | 'phrase';

export type ChartFilter = {
  type: ChartFilterType;
  value: string;
  label: string; // Human-readable label for display
};

// Extended reviews file with classification
export type ClassifiedReviewsFile = {
  generatedAt: string;
  classifiedAt: string;
  windowDays: number;
  apps: AppConfig[];
  reviews: ClassifiedReview[];
};

// Global dashboard filter state (consumed via React Context).
// All fields are additive AND-filters; empty arrays mean "no constraint".
export type FilterState = {
  timeRange: "7d" | "30d" | "90d" | { start: string; end: string };
  apps: string[];                          // app slugs; [] = all
  os: "all" | "ios" | "android";
  categories: ReviewCategory[];            // [] = all
  ratingBucket: "all" | "1-2" | "3" | "4-5";
  activeKeyword: string | null;            // free-text keyword / phrase
};

export const DEFAULT_FILTER_STATE: FilterState = {
  timeRange: "90d",
  apps: [],
  os: "all",
  categories: [],
  ratingBucket: "all",
  activeKeyword: null,
};
