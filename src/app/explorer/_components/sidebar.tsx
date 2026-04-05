"use client";

import { useState, useEffect } from "react";
import { HistoryPanel } from "./history-panel";
import { SampleQueries } from "./sample-queries";

type TabId = "history" | "samples";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabId>("samples");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    if (mql.matches) setCollapsed(true);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (collapsed) {
    return (
      <aside className="flex w-11 shrink-0 flex-col items-center gap-1 border-r border-border-subtle bg-bg-deep pt-2">
        <button
          onClick={() => setCollapsed(false)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
          aria-label="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border-subtle bg-bg-deep">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 border-b border-border-subtle p-1.5">
        {(
          [
            { id: "samples" as const, label: "Samples" },
            { id: "history" as const, label: "History" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex h-9 flex-1 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-bg-hover text-text-primary"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setCollapsed(true)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
          aria-label="Collapse sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "history" && <HistoryPanel />}
        {activeTab === "samples" && <SampleQueries />}
      </div>
    </aside>
  );
}
