"use client";

import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import type { PhraseCount } from "@/lib/types";
import { useFilter } from "@/lib/filter-context";

type Props = {
  data: PhraseCount[];
  onScrollToReviews: () => void;
};

export function TopPhrasesPanel({ data, onScrollToReviews }: Props) {
  const [showAll, setShowAll] = useState(false);
  const { filter, setKeyword, toggleApp } = useFilter();

  const handlePhraseClick = (phrase: string) => {
    // Toggle: if same phrase is active, clear it
    if (filter.activeKeyword === phrase) {
      setKeyword(null);
    } else {
      setKeyword(phrase);
      onScrollToReviews();
    }
  };

  const handleAppChipClick = (app: string) => {
    toggleApp(app);
  };

  const clearKeyword = () => {
    setKeyword(null);
  };

  const isSelected = (phrase: string) => filter.activeKeyword === phrase;
  const hasActiveFilter = filter.activeKeyword !== null;

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          Top Pain Points
        </h3>
        <p className="text-sm text-gray-500">
          No phrases found in low-rated reviews.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const displayedPhrases = showAll ? data : data.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Top Pain Points
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">From 1-2 star reviews</p>
        </div>
        {hasActiveFilter && (
          <button
            onClick={clearKeyword}
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <X className="w-3 h-3" />
            Clear filter
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedPhrases.map((phrase) => {
          const selected = isSelected(phrase.phrase);
          const dimmed = hasActiveFilter && !selected;

          return (
            <button
              key={phrase.phrase}
              onClick={() => handlePhraseClick(phrase.phrase)}
              className={`group w-full text-left rounded-lg p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                selected
                  ? "bg-blue-50 ring-1 ring-blue-200"
                  : dimmed
                  ? "opacity-25 hover:opacity-40 bg-gray-50"
                  : "hover:bg-gray-50"
              }`}
              aria-pressed={selected}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-800 font-medium truncate flex-1 mr-2">
                  {phrase.phrase}
                </span>
                <span className="text-xs text-gray-500 tabular-nums">
                  {phrase.count}x
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${(phrase.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {phrase.apps.slice(0, 2).map((app) => (
                    <button
                      key={app}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAppChipClick(app);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                        filter.apps.some(
                          (a) =>
                            a.toLowerCase().includes(app.toLowerCase()) ||
                            app.toLowerCase().includes(a.toLowerCase())
                        )
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={app}
                    >
                      {app.split(" ").slice(0, 2).join(" ")}
                    </button>
                  ))}
                  {phrase.apps.length > 2 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      +{phrase.apps.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Show All / Show Less toggle */}
      {data.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
        >
          {showAll ? (
            <>
              Show less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show all {data.length} phrases <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
