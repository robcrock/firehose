"use client";

import type { PhraseCount, ChartFilter } from "@/lib/types";

type Props = {
  data: PhraseCount[];
  selectedFilter: ChartFilter | null;
  onFilterChange: (filter: ChartFilter | null) => void;
};

export function TopPhrasesPanel({ data, selectedFilter, onFilterChange }: Props) {
  const handlePhraseClick = (phrase: string) => {
    onFilterChange({
      type: 'phrase',
      value: phrase,
      label: `"${phrase}"`,
    });
  };

  const isSelected = (phrase: string) =>
    selectedFilter?.type === 'phrase' && selectedFilter.value === phrase;

  const isOtherSelected = selectedFilter?.type === 'phrase';

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Top Recurring Phrases</h3>
        <p className="text-sm text-gray-500">No phrases found in low-rated reviews.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Top Pain Points</h3>
        <span className="text-xs text-gray-500">From 1-2 star reviews</span>
      </div>
      <div className="space-y-2.5">
        {data.slice(0, 10).map((phrase) => (
          <button
            key={phrase.phrase}
            onClick={() => handlePhraseClick(phrase.phrase)}
            className={`group w-full text-left rounded-lg p-2 -m-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
              isSelected(phrase.phrase)
                ? 'bg-blue-50 ring-1 ring-blue-200'
                : isOtherSelected
                ? 'opacity-40 hover:opacity-60'
                : 'hover:bg-gray-50'
            }`}
            aria-pressed={isSelected(phrase.phrase)}
          >
            <div className="flex items-center justify-between mb-1">
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
              <div className="flex gap-1">
                {phrase.apps.slice(0, 2).map(app => (
                  <span
                    key={app}
                    className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                    title={app}
                  >
                    {app.split(" ").slice(0, 2).join(" ")}
                  </span>
                ))}
                {phrase.apps.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                    +{phrase.apps.length - 2}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
