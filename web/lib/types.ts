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
