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
          Pain Points
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No phrases found in low-rated reviews.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col max-h-[380px] overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          Pain Points
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pl-6 pr-4 pb-6">
        {data.map((phrase) => (
          <div key={phrase.phrase} className="py-3 space-y-1.5">
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {phrase.phrase
                  .split(" ")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
              <span className="text-sm font-medium text-muted-foreground tabular-nums ml-3">
                {phrase.count}x
              </span>
            </div>
            <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full"
                style={{ width: `${(phrase.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
