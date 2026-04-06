"use client";

import { useState } from "react";
import { SlidersHorizontal, Download, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useFilter } from "@/lib/filter-context";
import type { ReviewCategory, AppStats } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Props = {
  apps: AppStats[];
  totalFilteredCount: number;
};

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
] as const;

const OS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
] as const;

const RATING_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1-2", label: "1-2 ★" },
  { value: "3", label: "3 ★" },
  { value: "4-5", label: "4-5 ★" },
] as const;

const CATEGORY_ORDER: ReviewCategory[] = [
  "bug",
  "feature_request",
  "clinical_concern",
  "positive",
  "other",
];

/* ── Segmented Control ─────────────────────────────────── */

type SegmentedControlProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex items-center rounded-lg border border-input bg-background p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Multi-Select Popover ──────────────────────────────── */

type MultiSelectPopoverProps = {
  label: string;
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
};

function MultiSelectPopover({
  label,
  activeCount,
  onClear,
  children,
}: MultiSelectPopoverProps) {
  const triggerLabel =
    activeCount > 0 ? `${label} (${activeCount})` : label;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant={activeCount > 0 ? "default" : "outline"}
            size="sm"
          >
            {triggerLabel}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
        <Separator />
        <div className="p-1">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Filter Panel ──────────────────────────────────────── */

type FilterPanelProps = {
  open: boolean;
  apps: AppStats[];
};

function FilterPanel({ open, apps }: FilterPanelProps) {
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
  } = useFilter();

  const [keywordDraft, setKeywordDraft] = useState(filter.activeKeyword ?? "");

  if (!open) return null;

  return (
    <div className="border-t border-border pt-4 pb-2 mt-3 space-y-4">
      {/* Row 1: Segmented controls */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-1.5">
          <span className="text-overline font-semibold uppercase tracking-wider text-muted-foreground">
            Period
          </span>
          <div className="block">
            <SegmentedControl
              options={TIME_RANGE_OPTIONS}
              value={
                typeof filter.timeRange === "string" ? filter.timeRange : "90d"
              }
              onChange={(v) => setTimeRange(v as "7d" | "30d" | "90d")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-overline font-semibold uppercase tracking-wider text-muted-foreground">
            Platform
          </span>
          <div className="block">
            <SegmentedControl
              options={OS_OPTIONS}
              value={filter.os}
              onChange={(v) => setOS(v as typeof filter.os)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-overline font-semibold uppercase tracking-wider text-muted-foreground">
            Rating
          </span>
          <div className="block">
            <SegmentedControl
              options={RATING_OPTIONS}
              value={filter.ratingBucket}
              onChange={(v) => setRatingBucket(v as typeof filter.ratingBucket)}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Multi-selects + keyword */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Apps */}
        <MultiSelectPopover
          label="Apps"
          activeCount={filter.apps.length}
          onClear={() => setApps([])}
        >
          {apps.map((app) => (
            <button
              key={app.app}
              onClick={() => toggleApp(app.app)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={filter.apps.includes(app.app)}
                tabIndex={-1}
                className="pointer-events-none"
              />
              <span className="text-foreground">
                {app.displayName
                  .replace(/FreeStyle\s*/gi, "")
                  .replace(/\s*\(US\)/gi, "")}
              </span>
            </button>
          ))}
        </MultiSelectPopover>

        {/* Categories */}
        <MultiSelectPopover
          label="Categories"
          activeCount={filter.categories.length}
          onClear={() => setCategories([])}
        >
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={filter.categories.includes(cat)}
                tabIndex={-1}
                className="pointer-events-none"
              />
              <span className="text-foreground">
                {CATEGORY_CONFIG[cat].label}
              </span>
            </button>
          ))}
        </MultiSelectPopover>

        {/* Keyword search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search keyword…"
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setKeyword(keywordDraft.trim() || null);
              }
            }}
            className="h-7 w-40 pl-8 text-xs"
          />
          {filter.activeKeyword && (
            <button
              onClick={() => {
                setKeyword(null);
                setKeywordDraft("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear keyword"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex-1" />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              reset();
              setKeywordDraft("");
            }}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Main Bar ──────────────────────────────────────────── */

export function GlobalFilterBar({ apps, totalFilteredCount }: Props) {
  const { hasActiveFilters, filterSummary } = useFilter();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className="bg-gray-50">
      <div className="flex items-center justify-end">
        {/* Right: Filters + Export buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={panelOpen || hasActiveFilters ? "default" : "outline"}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <SlidersHorizontal />
            Filters
            {hasActiveFilters && !panelOpen && (
              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            )}
          </Button>
          <Button variant="outline">
            <Download />
            Export CSV
          </Button>
        </div>
      </div>

      <FilterPanel open={panelOpen} apps={apps} />
    </div>
  );
}
