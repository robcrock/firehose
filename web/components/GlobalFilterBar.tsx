"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

/* ── Main Bar ──────────────────────────────────────────── */

export function GlobalFilterBar({ apps }: Props) {
  const {
    filter,
    setTimeRange,
    toggleApp,
    setApps,
    setOS,
    toggleCategory,
    setCategories,
    reset,
    hasActiveFilters,
  } = useFilter();

  return (
    <div className="bg-gray-50">
      <div className="flex flex-wrap items-center gap-3">
        {/* Period */}
        <SegmentedControl
          options={TIME_RANGE_OPTIONS}
          value={
            typeof filter.timeRange === "string" ? filter.timeRange : "90d"
          }
          onChange={(v) => setTimeRange(v as "7d" | "30d" | "90d")}
        />

        {/* Platform */}
        <SegmentedControl
          options={OS_OPTIONS}
          value={filter.os}
          onChange={(v) => setOS(v as typeof filter.os)}
        />

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

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
