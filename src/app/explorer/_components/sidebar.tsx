"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { HistoryPanel } from "./history-panel";
import { ResourceExplorer } from "./resource-explorer";
import { SampleQueries } from "./sample-queries";

type TabId = "history" | "samples" | "resources";

const TABS: { id: TabId; label: string }[] = [
  { id: "samples", label: "Samples" },
  { id: "resources", label: "Resources" },
  { id: "history", label: "History" },
];

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 256;
const STORAGE_KEY = "gep-sidebar-width";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabId>("samples");
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);

  // Restore persisted width
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        setWidth(parsed);
      }
    }
  }, []);

  // Auto-collapse on narrow screens
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    if (mql.matches) setCollapsed(true);
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const newWidth = Math.min(Math.max(ev.clientX, MIN_WIDTH), MAX_WIDTH);
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Persist on release
      setWidth((w) => {
        localStorage.setItem(STORAGE_KEY, String(w));
        return w;
      });
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
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
    <aside className="relative flex shrink-0 flex-col border-r border-border-subtle bg-bg-deep" style={{ width }}>
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 border-b border-border-subtle p-1.5">
        {TABS.map((tab) => (
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
        {activeTab === "resources" && <ResourceExplorer />}
      </div>

      {/* Resize handle */}
      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        tabIndex={0}
        onMouseDown={handleResizeStart}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const delta = e.key === "ArrowLeft" ? -20 : 20;
            setWidth((w) => {
              const next = Math.min(Math.max(w + delta, MIN_WIDTH), MAX_WIDTH);
              localStorage.setItem(STORAGE_KEY, String(next));
              return next;
            });
          }
        }}
        className="group absolute right-0 top-0 z-10 flex h-full w-1.5 cursor-col-resize items-center justify-center hover:bg-accent/10 active:bg-accent/20 transition-colors"
      >
        <div className="h-8 w-0.5 rounded-full bg-border-default opacity-0 transition-opacity group-hover:opacity-100 group-active:bg-accent" />
      </div>
    </aside>
  );
}
