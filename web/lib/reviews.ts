import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { DailyCount, ReviewsFile } from "./types";

const DATA_PATH = path.join(process.cwd(), "..", "data", "reviews.json");

export async function getReviews(): Promise<ReviewsFile> {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw) as ReviewsFile;
}

/**
 * Bucket reviews into per-day counts (UTC days), zero-filling any days with no
 * reviews so the x-axis of the chart is continuous.
 */
export function getDailyCounts(
  reviews: ReviewsFile["reviews"],
  windowDays: number,
  generatedAt: string,
): DailyCount[] {
  // End day = the UTC day of generatedAt. Start day = windowDays-1 before that.
  const end = parseISO(generatedAt);
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  const startDay = addDays(endDay, -(windowDays - 1));

  const counts = new Map<string, number>();
  for (let d = startDay; d <= endDay; d = addDays(d, 1)) {
    counts.set(format(d, "yyyy-MM-dd"), 0);
  }

  for (const r of reviews) {
    const d = parseISO(r.date);
    const day = format(
      new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())),
      "yyyy-MM-dd",
    );
    if (counts.has(day)) {
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  return Array.from(counts, ([date, count]) => ({ date, count }));
}

export function daysBetween(a: string, b: string): number {
  return differenceInCalendarDays(parseISO(b), parseISO(a));
}
