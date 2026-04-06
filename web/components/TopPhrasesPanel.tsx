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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-5">
        <h3 className="text-title font-semibold tracking-tight text-foreground">
          Top Pain Points
        </h3>
      </div>

      <div className="divide-y divide-border max-h-[480px] overflow-y-auto pr-3">
        {data.map((phrase) => (
          <div key={phrase.phrase} className="py-4 first:pt-0 space-y-1.5">
            {/* Phrase name + count */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-bold text-foreground">
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
