"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  subtitle?: string;
};

type Props = {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
};

export function TabbedChartCard({ tabs, defaultTab, children }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 pb-4 flex flex-col h-full">
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
            {/* Active indicator */}
            <span
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-colors",
                activeTab === tab.id ? "bg-foreground" : "bg-transparent"
              )}
            />
          </button>
        ))}
      </div>

      {/* Active tab content */}
      {children(activeTab)}
    </div>
  );
}
