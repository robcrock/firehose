"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

type Props = {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
  footer?: React.ReactNode;
};

export function TabbedChartCard({ tabs, defaultTab, children, footer }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 pb-4 flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-baseline gap-6 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative pb-2 group"
          >
            <span
              className={cn(
                "text-title font-semibold tracking-tight transition-colors",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {tab.label}
            </span>
            <span
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors",
                activeTab === tab.id ? "bg-foreground" : "bg-transparent"
              )}
            />
          </button>
        ))}
      </div>

      {/* Chart area — fixed height */}
      <div className="h-[280px] flex flex-col justify-end shrink-0">
        {children(activeTab)}
      </div>

      {/* Footer content (e.g. reviews list) */}
      {footer && (
        <div className="flex-1 min-h-0 flex flex-col mt-4 pt-4 border-t border-border overflow-hidden">
          {footer}
        </div>
      )}
    </div>
  );
}
