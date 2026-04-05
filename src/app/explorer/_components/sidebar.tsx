"use client";

import { useState } from "react";
import { HistoryPanel } from "./history-panel";

const tabs = [
  {
    id: "history",
    label: "History",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <polyline
          points="12 6 12 12 16 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "collections",
    label: "Collections",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "schema",
    label: "Schema",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line
          x1="12"
          y1="8"
          x2="5"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="12"
          y1="8"
          x2="19"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabId>("history");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-border-subtle bg-bg-deep transition-[width] duration-200 ease-in-out ${
        collapsed ? "w-12" : "w-60"
      }`}
    >
      {/* Tab navigation */}
      <div className="flex h-10 items-center border-b border-border-subtle">
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-10 w-12 items-center justify-center text-text-tertiary transition-colors hover:text-text-secondary"
            aria-label="Expand sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
          <>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex h-10 flex-1 items-center justify-center gap-1.5 text-xs transition-colors ${
                  activeTab === tab.id
                    ? "text-accent"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
                aria-label={tab.label}
              >
                {tab.icon}
                <span className="hidden lg:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-px bg-accent" />
                )}
              </button>
            ))}
            <button
              onClick={() => setCollapsed(true)}
              className="flex h-10 w-8 items-center justify-center text-text-muted transition-colors hover:text-text-secondary"
              aria-label="Collapse sidebar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline
                  points="15 18 9 12 15 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Tab content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "history" && <HistoryPanel />}
          {activeTab === "collections" && (
            <div className="flex flex-col items-center justify-center p-3 py-12 text-center">
              <p className="text-xs text-text-muted">Saved collections will appear here</p>
            </div>
          )}
          {activeTab === "schema" && (
            <div className="flex flex-col items-center justify-center p-3 py-12 text-center">
              <p className="text-xs text-text-muted">Graph schema browser will appear here</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
