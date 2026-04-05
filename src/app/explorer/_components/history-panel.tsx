"use client";

import { useMemo, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface HistoryItem {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  status: number;
  timeMs: number;
  timestamp: Date;
}

// ── Mock data ──────────────────────────────────────────────────────

const now = new Date();

function daysAgo(days: number, hours: number, minutes: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

const MOCK_HISTORY: HistoryItem[] = [
  { id: "h1", method: "GET", url: "/v1.0/me", status: 200, timeMs: 145, timestamp: daysAgo(0, 12, 34) },
  { id: "h2", method: "POST", url: "/v1.0/users", status: 201, timeMs: 230, timestamp: daysAgo(0, 12, 30) },
  { id: "h3", method: "GET", url: "/beta/me/drive/root/children", status: 401, timeMs: 89, timestamp: daysAgo(0, 12, 15) },
  { id: "h4", method: "GET", url: "/v1.0/me/messages", status: 200, timeMs: 312, timestamp: daysAgo(0, 11, 50) },
  { id: "h5", method: "PATCH", url: "/v1.0/me", status: 200, timeMs: 178, timestamp: daysAgo(1, 15, 45) },
  { id: "h6", method: "DELETE", url: "/v1.0/groups/abc123", status: 204, timeMs: 95, timestamp: daysAgo(1, 14, 10) },
  { id: "h7", method: "GET", url: "/v1.0/me/memberOf", status: 200, timeMs: 267, timestamp: daysAgo(1, 13, 22) },
  { id: "h8", method: "POST", url: "/v1.0/me/sendMail", status: 202, timeMs: 445, timestamp: daysAgo(2, 16, 5) },
  { id: "h9", method: "PUT", url: "/v1.0/me/photo/$value", status: 200, timeMs: 1230, timestamp: daysAgo(2, 10, 30) },
  { id: "h10", method: "GET", url: "/v1.0/applications", status: 403, timeMs: 56, timestamp: daysAgo(2, 9, 15) },
];

// ── Helpers ─────────────────────────────────────────────────────────

const METHOD_CLASSES: Record<HistoryItem["method"], string> = {
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

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function dateGroupLabel(date: Date): string {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const itemDay = new Date(date);
  itemDay.setHours(0, 0, 0, 0);

  if (itemDay.getTime() === todayStart.getTime()) return "Today";
  if (itemDay.getTime() === yesterdayStart.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDate(items: HistoryItem[]): [string, HistoryItem[]][] {
  const groups = new Map<string, HistoryItem[]>();
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

// ── Component ───────────────────────────────────────────────────────

export function HistoryPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_HISTORY;
    const q = searchQuery.toLowerCase();
    return MOCK_HISTORY.filter(
      (item) =>
        item.method.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="flex items-center gap-2 rounded border border-border-subtle bg-bg-elevated px-2 py-1.5">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search history…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search history"
            name="search-history"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <ClockIcon />
            <p className="text-xs text-text-muted">
              {searchQuery.trim() ? "No matching requests" : "No requests yet"}
            </p>
          </div>
        ) : (
          groups.map(([label, items]) => (
            <div key={label}>
              {/* Date group header */}
              <div className="sticky top-0 z-10 bg-bg-deep px-3 pt-3 pb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {label}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-0.5 px-2">
                {items.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group flex w-full cursor-pointer flex-col gap-0.5 rounded px-2 py-1.5 text-left transition-colors hover:bg-bg-hover ${
                        isSelected
                          ? "border-l-2 border-accent bg-bg-hover"
                          : "border-l-2 border-transparent"
                      }`}
                    >
                      {/* First line: method + url + status */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`shrink-0 rounded px-1 py-px font-mono text-[10px] font-bold uppercase leading-tight ${METHOD_CLASSES[item.method]}`}
                        >
                          {item.method}
                        </span>
                        <span className="min-w-0 flex-1 overflow-hidden font-mono text-xs text-text-primary text-ellipsis whitespace-nowrap">
                          {item.url}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-xs font-medium tabular-nums ${statusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Second line: time + duration */}
                      <div className="flex items-center gap-1 pl-0.5">
                        <span className="font-mono text-[10px] tabular-nums text-text-muted">
                          {formatTime(item.timestamp)}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-text-tertiary">
                          · {formatDuration(item.timeMs)}
                        </span>
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
