"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useFilter } from "@/lib/filter-context";
import type { ReviewCategory, AppStats } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/analytics";

type Props = {
  apps: AppStats[];
  totalFilteredCount: number;
};

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
] as const;

const OS_OPTIONS = [
  { value: "all", label: "All platforms" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
] as const;

const RATING_OPTIONS = [
  { value: "all", label: "All ratings" },
  { value: "1-2", label: "1-2 stars" },
  { value: "3", label: "3 stars" },
  { value: "4-5", label: "4-5 stars" },
] as const;

const CATEGORY_ORDER: ReviewCategory[] = [
  "bug",
  "feature_request",
  "clinical_concern",
  "positive",
  "other",
];

type DropdownProps = {
  label: string;
  value: string;
  isActive?: boolean;
  children: React.ReactNode;
};

function Dropdown({ label, value, isActive, children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          isActive
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        }`}
      >
        <span className="font-medium">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {children}
        </div>
      )}
    </div>
  );
}

type MultiSelectDropdownProps = {
  label: string;
  selectedCount: number;
  placeholder: string;
  children: React.ReactNode;
};

function MultiSelectDropdown({
  selectedCount,
  placeholder,
  children,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = selectedCount > 0;
  const displayText = isActive ? `${selectedCount} selected` : placeholder;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
          isActive
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
        }`}
      >
        <span className="font-medium">{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-20 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {children}
        </div>
      )}
    </div>
  );
}

export function GlobalFilterBar({ apps, totalFilteredCount }: Props) {
  const {
    filter,
    setTimeRange,
    toggleApp,
    setApps,
    setOS,
    toggleCategory,
    setCategories,
    setRatingBucket,
    setKeyword,
    reset,
    hasActiveFilters,
    filterSummary,
  } = useFilter();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const timeRangeLabel =
    typeof filter.timeRange === "string"
      ? TIME_RANGE_OPTIONS.find((o) => o.value === filter.timeRange)?.label || filter.timeRange
      : `${filter.timeRange.start} - ${filter.timeRange.end}`;

  const osLabel = OS_OPTIONS.find((o) => o.value === filter.os)?.label || "All platforms";
  const ratingLabel = RATING_OPTIONS.find((o) => o.value === filter.ratingBucket)?.label || "All ratings";

  return (
    <div
      className={`sticky top-0 z-10 bg-gray-50 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 py-3">
        {/* Time Range */}
        <Dropdown
          label="Time"
          value={timeRangeLabel}
          isActive={typeof filter.timeRange === "object"}
        >
          {TIME_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                filter.timeRange === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>

        {/* Apps Multi-Select */}
        <MultiSelectDropdown
          label="Apps"
          selectedCount={filter.apps.length}
          placeholder="All apps"
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <button
              onClick={() => setApps([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
          {apps.map((app) => (
            <button
              key={app.app}
              onClick={() => toggleApp(app.app)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  filter.apps.includes(app.app)
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {filter.apps.includes(app.app) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={filter.apps.includes(app.app) ? "text-blue-700 font-medium" : "text-gray-700"}>
                {app.displayName.replace(/FreeStyle\s*/gi, "").replace(/\s*\(US\)/gi, "")}
              </span>
            </button>
          ))}
        </MultiSelectDropdown>

        {/* Platform */}
        <Dropdown label="Platform" value={osLabel} isActive={filter.os !== "all"}>
          {OS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOS(opt.value as typeof filter.os)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                filter.os === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>

        {/* Categories Multi-Select */}
        <MultiSelectDropdown
          label="Category"
          selectedCount={filter.categories.length}
          placeholder="All categories"
        >
          <div className="px-3 py-2 border-b border-gray-100">
            <button
              onClick={() => setCategories([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  filter.categories.includes(cat)
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300"
                }`}
              >
                {filter.categories.includes(cat) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: CATEGORY_CONFIG[cat].color }}
              />
              <span className={filter.categories.includes(cat) ? "text-blue-700 font-medium" : "text-gray-700"}>
                {CATEGORY_CONFIG[cat].label}
              </span>
            </button>
          ))}
        </MultiSelectDropdown>

        {/* Rating */}
        <Dropdown label="Rating" value={ratingLabel} isActive={filter.ratingBucket !== "all"}>
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRatingBucket(opt.value as typeof filter.ratingBucket)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                filter.ratingBucket === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>

        {/* Active Keyword Chip */}
        {filter.activeKeyword && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white">
            <span className="font-medium">{`"${filter.activeKeyword}"`}</span>
            <button
              onClick={() => setKeyword(null)}
              className="p-0.5 hover:bg-blue-700 rounded"
              aria-label="Clear keyword filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Summary + Clear */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900 tabular-nums">
              {totalFilteredCount.toLocaleString()}
            </span>{" "}
            reviews
            {filterSummary && (
              <span className="text-gray-400"> · {filterSummary}</span>
            )}
          </span>
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
