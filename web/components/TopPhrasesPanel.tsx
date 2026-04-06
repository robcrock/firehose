"use client";

import type { PhraseCount } from "@/lib/types";

type Props = {
  data: PhraseCount[];
  onScrollToReviews: () => void;
};

export function TopPhrasesPanel({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-title font-semibold tracking-tight text-foreground mb-2">
          Top Pain Points
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No phrases found in low-rated reviews.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const displayedPhrases = data.slice(0, 7);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-5">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          Top Pain Points
        </h3>
      </div>

      <div className="space-y-4">
        {displayedPhrases.map((phrase) => (
          <div key={phrase.phrase} className="space-y-1.5">
            {/* Phrase name + count */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {phrase.phrase
                    .split(" ")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {phrase.apps.join(", ")}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums ml-3">
                {phrase.count}x
              </span>
            </div>
            {/* Bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full"
                style={{ width: `${(phrase.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Analyze CTA */}
      <div className="mt-6">
        <button className="w-full py-3 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-gray-50 transition-colors">
          Analyze all {data.length} phrases
        </button>
      </div>
    </div>
  );
}
