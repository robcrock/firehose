"use client";

import { useMemo, useState, forwardRef, useEffect } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ClassifiedReview, ReviewCategory } from "@/lib/types";
import { CATEGORY_CONFIG, filterReviews } from "@/lib/analytics";
import { useFilter } from "@/lib/filter-context";

type Props = {
  reviews: ClassifiedReview[];
  selectedDates?: Set<string>;
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

const ALL_CATEGORIES: ReviewCategory[] = [
  "bug",
  "feature_request",
  "clinical_concern",
  "positive",
  "other",
];

type SortOrder = "newest" | "oldest" | "lowest" | "highest";

// Triage state management via localStorage
function useTriagedReviews() {
  const [triaged, setTriaged] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem("triaged_reviews");
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        setTriaged(new Set(ids));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const toggleTriage = (id: string) => {
    setTriaged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("triaged_reviews", JSON.stringify([...next]));
      return next;
    });
  };

  return { triaged, toggleTriage };
}

type ReviewCardProps = {
  review: ClassifiedReview;
  isTriaged: boolean;
  onToggleTriage: () => void;
};

function ReviewCard({ review, isTriaged, onToggleTriage }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = review.body.length > 200;
  const displayBody = needsTruncation && !expanded 
    ? review.body.slice(0, 200) + "..." 
    : review.body;

  return (
    <li className={`py-4 first:pt-0 last:pb-0 ${isTriaged ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <Stars rating={review.rating} />
        <span className="font-medium text-gray-700">{review.appDisplayName}</span>
        <OSBadge os={review.os} />
        <CategoryBadge category={review.category} />
        <span className="ml-auto tabular-nums">
          {format(parseISO(review.date), "MMM d, yyyy")}
        </span>
      </div>
      {review.title && (
        <p className="mt-2 text-sm font-semibold text-gray-900">{review.title}</p>
      )}
      <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
        {displayBody}
        {needsTruncation && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>
      <div className="flex items-center justify-between mt-3">
        {review.author && (
          <p className="text-xs text-gray-400">- {review.author}</p>
        )}
        <button
          onClick={onToggleTriage}
          className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            isTriaged
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Check className={`w-3.5 h-3.5 ${isTriaged ? "text-green-600" : "text-gray-400"}`} />
          {isTriaged ? "Triaged" : "Mark as triaged"}
        </button>
      </div>
    </li>
  );
}

export const ReviewsTable = forwardRef<HTMLDivElement, Props>(
  function ReviewsTable({ reviews, selectedDates }, ref) {
    const { filter, filterSummary, toggleCategory, setCategories } = useFilter();
    const [localCategory, setLocalCategory] = useState<ReviewCategory | "all">("all");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const { triaged, toggleTriage } = useTriagedReviews();

    // First apply global FilterState
    const globalFiltered = useMemo(() => {
      return filterReviews(reviews, filter);
    }, [reviews, filter]);

    // Then apply date filter + local category filter (additive on top of global)
    const filtered = useMemo(() => {
      let result = globalFiltered;

      // Apply selected dates filter from volume chart
      if (selectedDates && selectedDates.size > 0) {
        result = result.filter((r) => selectedDates.has(r.date.slice(0, 10)));
      }

      // Apply local category filter
      if (localCategory !== "all") {
        result = result.filter((r) => r.category === localCategory);
      }

      // Sort
      return result.sort((a, b) => {
        switch (sortOrder) {
          case "newest":
            return b.date.localeCompare(a.date);
          case "oldest":
            return a.date.localeCompare(b.date);
          case "lowest":
            return a.rating - b.rating || b.date.localeCompare(a.date);
          case "highest":
            return b.rating - a.rating || b.date.localeCompare(a.date);
          default:
            return 0;
        }
      });
    }, [globalFiltered, localCategory, sortOrder, selectedDates]);

    // Calculate category counts for the local filter tabs
    const categoryCounts = useMemo(() => {
      const counts: Record<ReviewCategory | "all", number> = {
        all: globalFiltered.length,
        bug: 0,
        feature_request: 0,
        clinical_concern: 0,
        positive: 0,
        other: 0,
      };

      globalFiltered.forEach((r) => {
        counts[r.category] += 1;
      });

      return counts;
    }, [globalFiltered]);

    return (
      <div ref={ref} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-4">
          {/* Category Tab Strip */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setLocalCategory("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  localCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({categoryCounts.all})
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocalCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    localCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {CATEGORY_CONFIG[cat].label} ({categoryCounts[cat]})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="ml-auto px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="lowest">Lowest rated</option>
              <option value="highest">Highest rated</option>
            </select>
          </div>
        </div>

        {/* Review List */}
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
            No reviews match the current filters.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 flex-1 overflow-y-auto pr-3">
            {filtered.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                isTriaged={triaged.has(r.id)}
                onToggleTriage={() => toggleTriage(r.id)}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }
);
