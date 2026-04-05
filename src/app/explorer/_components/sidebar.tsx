"use client";

import { useState, useEffect } from "react";
import { HistoryPanel } from "./history-panel";
import { SampleQueries } from "./sample-queries";

type TabId = "history" | "collections";

const MOBILE_BREAKPOINT = 768;

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <polyline
        points="12 6 12 12 16 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabId>("history");
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on mobile viewports
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    if (mql.matches) setCollapsed(true);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border-subtle bg-bg-deep transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-12" : "w-60"
      }`}
    >
      {/* Tab navigation */}
      <div className="flex items-center border-b border-border-subtle">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-11 w-12 items-center justify-center text-text-tertiary transition-colors hover:text-text-secondary focus-visible:ring-1 focus-visible:ring-accent"
            aria-label="Expand sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <polyline
                points="9 18 15 12 9 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="flex w-full">
            {(
              [
                { id: "history" as const, label: "History", Icon: ClockIcon },
                { id: "collections" as const, label: "Samples", Icon: FolderIcon },
              ] as const
            ).map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex h-11 flex-1 items-center justify-center gap-2 text-xs font-medium tracking-wide transition-colors focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-inset ${
                    isActive
                      ? "text-accent"
                      : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
                  }`}
                >
                  <tab.Icon />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-11 w-9 shrink-0 items-center justify-center border-l border-border-subtle text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary focus-visible:ring-1 focus-visible:ring-accent"
              aria-label="Collapse sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline
                  points="15 18 9 12 15 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tab content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "history" && <HistoryPanel />}
          {activeTab === "collections" && <SampleQueries />}
        </div>
      )}
    </aside>
  );
}
