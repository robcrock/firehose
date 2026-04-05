"use client";

import { useMemo } from "react";
import type { Review } from "@/lib/types";

type Props = {
  reviews: Review[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (inclusive)
};

function Stars({ rating }: { rating: number }) {
  return (
    <span
      aria-label={`${rating} out of 5 stars`}
      className="inline-flex gap-0.5 text-amber-500 text-xs leading-none tabular-nums"
    >
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function OSBadge({ os }: { os: "ios" | "android" }) {
  const label = os === "ios" ? "iOS" : "Android";
  const cls =
    os === "ios"
      ? "bg-gray-100 text-gray-800 ring-gray-200"
      : "bg-green-50 text-green-800 ring-green-200";
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

export function ReviewsTable({ reviews, startDate, endDate }: Props) {
  const filtered = useMemo(
    () =>
      reviews.filter((r) => {
        const day = r.date.slice(0, 10);
        return day >= startDate && day <= endDate;
      }),
    [reviews, startDate, endDate],
  );

  if (filtered.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
        No reviews in this range.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          {filtered.length.toLocaleString()} reviews
        </h2>
        <p className="text-xs text-gray-500 tabular-nums">
          {startDate} &rarr; {endDate}
        </p>
      </div>
      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {filtered.map((r) => (
          <li key={r.id} className="p-4 hover:bg-gray-50">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Stars rating={r.rating} />
              <span className="font-medium text-gray-700">{r.appDisplayName}</span>
              <OSBadge os={r.os} />
              <span className="ml-auto tabular-nums">{r.date.slice(0, 10)}</span>
            </div>
            {r.title && (
              <p className="mt-2 text-sm font-semibold text-gray-900">{r.title}</p>
            )}
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{r.body}</p>
            {r.author && (
              <p className="mt-2 text-xs text-gray-500">— {r.author}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
