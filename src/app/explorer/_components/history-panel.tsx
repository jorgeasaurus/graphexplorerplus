"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getHistory, clearHistory, type HistoryEntry } from "~/lib/history-store";

// ── Helpers ─────────────────────────────────────────────────────────

const METHOD_CLASSES: Record<string, string> = {
  GET: "text-method-get bg-method-get/10",
  POST: "text-method-post bg-method-post/10",
  PUT: "text-method-put bg-method-put/10",
  PATCH: "text-method-patch bg-method-patch/10",
  DELETE: "text-method-delete bg-method-delete/10",
};

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400 && status < 500) return "text-warning";
  return "text-error";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function dateGroupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const itemDay = new Date(date);
  itemDay.setHours(0, 0, 0, 0);

  if (itemDay.getTime() >= todayStart.getTime()) return "Today";
  if (itemDay.getTime() >= yesterdayStart.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(items: HistoryEntry[]): [string, HistoryEntry[]][] {
  const groups = new Map<string, HistoryEntry[]>();
  for (const item of items) {
    const label = dateGroupLabel(item.timestamp);
    const group = groups.get(label);
    if (group) {
      group.push(item);
    } else {
      groups.set(label, [item]);
    }
  }
  return Array.from(groups.entries());
}

// ── Icons ───────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-text-muted"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="text-text-muted"
    >
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

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0"
    >
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────

export function HistoryPanel() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reload = useCallback(() => setEntries(getHistory()), []);

  useEffect(() => {
    reload();
    window.addEventListener("history-updated", reload);
    return () => window.removeEventListener("history-updated", reload);
  }, [reload]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (item) =>
        item.method.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q),
    );
  }, [searchQuery, entries]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  function handleSelect(item: HistoryEntry) {
    setSelectedId(item.id);
    window.dispatchEvent(
      new CustomEvent("select-query", {
        detail: { method: item.method, url: item.url },
      }),
    );
  }

  function handleClear() {
    clearHistory();
    setSelectedId(null);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search + Clear */}
      <div className="flex items-center gap-1.5 p-2">
        <div className="flex flex-1 items-center gap-2 rounded border border-border-subtle bg-bg-elevated px-2 py-1.5">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search history"
            name="search-history"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            title="Clear history"
            className="rounded p-1.5 text-text-muted transition-colors hover:bg-bg-hover hover:text-error"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <ClockIcon />
            <p className="text-xs text-text-muted">
              {searchQuery.trim()
                ? "No matching requests"
                : "Run a query to see it here"}
            </p>
          </div>
        ) : (
          groups.map(([label, items]) => (
            <div key={label}>
              <div className="sticky top-0 z-10 bg-bg-deep px-3 pt-3 pb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {label}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 px-2">
                {items.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`group flex w-full cursor-pointer flex-col gap-0.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-bg-hover ${
                        isSelected
                          ? "border-l-2 border-accent bg-bg-hover"
                          : "border-l-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`shrink-0 rounded px-1 py-px font-mono text-[10px] font-bold uppercase leading-tight ${METHOD_CLASSES[item.method] ?? "text-text-muted"}`}
                        >
                          {item.method}
                        </span>
                        <span className="min-w-0 flex-1 overflow-hidden font-mono text-xs text-text-primary text-ellipsis whitespace-nowrap">
                          {item.url}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-xs font-medium tabular-nums ${statusColor(item.status)}`}
                        >
                          {item.status || "ERR"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 pl-0.5">
                        <span className="font-mono text-[10px] tabular-nums text-text-muted">
                          {formatTime(item.timestamp)}
                        </span>
                        {item.timeMs > 0 && (
                          <span className="font-mono text-[10px] tabular-nums text-text-tertiary">
                            · {formatDuration(item.timeMs)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
