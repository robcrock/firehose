"use client";

import type { PhraseCount } from "@/lib/types";

type Props = {
  data: PhraseCount[];
};

export function TopPhrasesPanel({ data }: Props) {
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
        {data.slice(0, 10).map((phrase, index) => (
          <div key={phrase.phrase} className="group">
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
          </div>
        ))}
      </div>
    </div>
  );
}
