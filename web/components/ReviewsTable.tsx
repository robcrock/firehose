"use client";

import { useMemo, useState } from "react";
import type { ClassifiedReview, ReviewCategory, ChartFilter } from "@/lib/types";
import { X } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/analytics";

type Props = {
  reviews: ClassifiedReview[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (inclusive)
  chartFilter: ChartFilter | null;
  onClearChartFilter: () => void;
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

function CategoryBadge({ category }: { category: ReviewCategory }) {
  const config = CATEGORY_CONFIG[category];
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.bgColor}`}
    >
      {config.label}
    </span>
  );
}

const ALL_CATEGORIES: ReviewCategory[] = ['bug', 'feature_request', 'clinical_concern', 'positive', 'other'];

export function ReviewsTable({ reviews, startDate, endDate, chartFilter, onClearChartFilter }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<ReviewCategory | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'lowest' | 'highest'>('newest');

  const filtered = useMemo(() => {
    let result = reviews.filter((r) => {
      const day = r.date.slice(0, 10);
      return day >= startDate && day <= endDate;
    });

    // Apply chart filter (from clicking chart elements)
    if (chartFilter) {
      switch (chartFilter.type) {
        case 'category':
          result = result.filter(r => r.category === chartFilter.value);
          break;
        case 'app':
          result = result.filter(r => r.app === chartFilter.value);
          break;
        case 'week': {
          // Filter reviews from the selected week (7-day window starting from weekStart)
          const weekStart = new Date(chartFilter.value);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          result = result.filter(r => {
            const reviewDate = new Date(r.date.slice(0, 10));
            return reviewDate >= weekStart && reviewDate < weekEnd;
          });
          break;
        }
        case 'phrase':
          result = result.filter(r =>
            r.keyPhrases.some(p => p.toLowerCase() === chartFilter.value.toLowerCase())
          );
          break;
      }
    }

    // Filter by category buttons (stacks with chart filter)
    if (selectedCategory !== 'all') {
      result = result.filter(r => r.category === selectedCategory);
    }

    // Sort
    return result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.date.localeCompare(a.date);
        case 'oldest':
          return a.date.localeCompare(b.date);
        case 'lowest':
          return a.rating - b.rating || b.date.localeCompare(a.date);
        case 'highest':
          return b.rating - a.rating || b.date.localeCompare(a.date);
        default:
          return 0;
      }
    });
  }, [reviews, startDate, endDate, chartFilter, selectedCategory, sortOrder]);

  // Calculate category counts for filter buttons
  const categoryCounts = useMemo(() => {
    const counts: Record<ReviewCategory | 'all', number> = {
      all: 0,
      bug: 0,
      feature_request: 0,
      clinical_concern: 0,
      positive: 0,
      other: 0,
    };
    
    reviews.forEach(r => {
      const day = r.date.slice(0, 10);
      if (day >= startDate && day <= endDate) {
        counts.all += 1;
        counts[r.category] += 1;
      }
    });
    
    return counts;
  }, [reviews, startDate, endDate]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {filtered.length.toLocaleString()} reviews
          </h2>
          <p className="text-xs text-gray-500 tabular-nums">
            {startDate} &rarr; {endDate}
          </p>
        </div>

        {/* Active Chart Filter Badge */}
        {chartFilter && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              Filtered by {chartFilter.type}: <strong>{chartFilter.label}</strong>
            </span>
            <button
              onClick={onClearChartFilter}
              className="ml-1 p-0.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Clear filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({categoryCounts.all})
            </button>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_CONFIG[cat].label} ({categoryCounts[cat]})
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
            className="ml-auto px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="lowest">Lowest rated</option>
            <option value="highest">Highest rated</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
          No reviews in this range{selectedCategory !== 'all' ? ` for "${CATEGORY_CONFIG[selectedCategory].label}"` : ''}.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filtered.map((r) => (
            <li key={r.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <Stars rating={r.rating} />
                <span className="font-medium text-gray-700">{r.appDisplayName}</span>
                <OSBadge os={r.os} />
                <CategoryBadge category={r.category} />
                <span className="ml-auto tabular-nums">{r.date.slice(0, 10)}</span>
              </div>
              {r.title && (
                <p className="mt-2 text-sm font-semibold text-gray-900">{r.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{r.body}</p>
              {r.author && (
                <p className="mt-2 text-xs text-gray-400">— {r.author}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
