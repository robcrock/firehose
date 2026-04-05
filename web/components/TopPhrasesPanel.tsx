"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import { useFilter } from "@/lib/filter-context";
import type { PhraseCount } from "@/lib/types";

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
						type="button"
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

					const rowClass = `group w-full rounded-lg p-3 transition-all duration-200 ${
						selected
							? "bg-blue-50 ring-1 ring-blue-200"
							: dimmed
								? "opacity-25 hover:opacity-40 bg-gray-50"
								: "hover:bg-gray-50"
					}`;

					return (
						<div key={phrase.phrase} className={rowClass}>
							<button
								type="button"
								aria-pressed={selected}
								onClick={() => handlePhraseClick(phrase.phrase)}
								className="w-full text-left flex items-center justify-between mb-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
							>
								<span className="text-sm text-gray-800 font-medium truncate flex-1 mr-2">
									{phrase.phrase}
								</span>
								<span className="text-xs text-gray-500 tabular-nums">
									{phrase.count}x
								</span>
							</button>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => handlePhraseClick(phrase.phrase)}
									className="flex-1 h-1.5 min-h-[6px] bg-gray-100 rounded-full overflow-hidden p-0 border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
									aria-label={`Filter by phrase: ${phrase.phrase}`}
								>
									<div
										className="h-full bg-red-500 rounded-full transition-all"
										style={{ width: `${(phrase.count / maxCount) * 100}%` }}
									/>
								</button>
								<div className="flex gap-1 shrink-0">
									{phrase.apps.slice(0, 2).map((app) => (
										<button
											type="button"
											key={app}
											onClick={() => handleAppChipClick(app)}
											className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
												filter.apps.some(
													(a) =>
														a.toLowerCase().includes(app.toLowerCase()) ||
														app.toLowerCase().includes(a.toLowerCase()),
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
						</div>
					);
				})}
			</div>

			{/* Show All / Show Less toggle */}
			{data.length > 10 && (
				<button
					type="button"
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
