"use client";

import { useMemo, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface SampleQuery {
  method: string;
  path: string;
  name: string;
}

interface SampleCategory {
  name: string;
  expanded?: boolean;
  queries: SampleQuery[];
}

export interface SampleQueriesProps {
  onSelectQuery?: (query: { method: string; url: string }) => void;
}

// ── Curated Samples ────────────────────────────────────────────────

const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    name: "Getting Started",
    expanded: true,
    queries: [
      { method: "GET", path: "/v1.0/me", name: "My profile" },
      { method: "GET", path: "/v1.0/me/photo/$value", name: "My photo" },
      { method: "GET", path: "/v1.0/me/messages", name: "My messages" },
      { method: "GET", path: "/v1.0/me/drive/root/children", name: "My files" },
      { method: "GET", path: "/v1.0/me/events", name: "My events" },
      { method: "GET", path: "/v1.0/me/contacts", name: "My contacts" },
      { method: "GET", path: "/v1.0/me/memberOf", name: "My groups & roles" },
      { method: "GET", path: "/v1.0/me/todo/lists", name: "My To Do lists" },
    ],
  },
  {
    name: "Users",
    queries: [
      { method: "GET", path: "/v1.0/users", name: "List all users" },
      { method: "GET", path: "/v1.0/users?$top=10&$select=displayName,mail", name: "Users (select fields)" },
      { method: "GET", path: "/v1.0/users?$filter=startsWith(displayName,'A')", name: "Filter users by name" },
      { method: "GET", path: "/v1.0/users/{user-id}", name: "Get user by ID" },
      { method: "GET", path: "/v1.0/users?$count=true", name: "Count users" },
    ],
  },
  {
    name: "Groups",
    queries: [
      { method: "GET", path: "/v1.0/groups", name: "List all groups" },
      { method: "GET", path: "/v1.0/groups?$filter=groupTypes/any(c:c eq 'Unified')", name: "Microsoft 365 groups" },
      { method: "GET", path: "/v1.0/groups/{group-id}/members", name: "Group members" },
      { method: "POST", path: "/v1.0/groups", name: "Create group" },
    ],
  },
  {
    name: "Mail",
    queries: [
      { method: "GET", path: "/v1.0/me/messages?$top=10", name: "Recent messages" },
      { method: "GET", path: "/v1.0/me/mailFolders", name: "Mail folders" },
      { method: "GET", path: '/v1.0/me/messages?$search="subject:meeting"', name: "Search messages" },
      { method: "POST", path: "/v1.0/me/sendMail", name: "Send mail" },
    ],
  },
  {
    name: "Calendar",
    queries: [
      { method: "GET", path: "/v1.0/me/events?$top=10", name: "My events" },
      { method: "GET", path: "/v1.0/me/calendar/calendarView?startDateTime=2026-01-01T00:00:00Z&endDateTime=2026-12-31T00:00:00Z", name: "Calendar view" },
      { method: "GET", path: "/v1.0/me/calendars", name: "My calendars" },
    ],
  },
  {
    name: "Teams",
    queries: [
      { method: "GET", path: "/v1.0/me/joinedTeams", name: "My teams" },
      { method: "GET", path: "/v1.0/teams/{team-id}/channels", name: "Team channels" },
      { method: "GET", path: "/v1.0/teams/{team-id}/members", name: "Team members" },
    ],
  },
  {
    name: "OneDrive",
    queries: [
      { method: "GET", path: "/v1.0/me/drive", name: "My drive" },
      { method: "GET", path: "/v1.0/me/drive/root/children", name: "Root folder items" },
      { method: "GET", path: "/v1.0/me/drive/recent", name: "Recent files" },
      { method: "GET", path: "/v1.0/me/drive/sharedWithMe", name: "Shared with me" },
    ],
  },
  {
    name: "Applications",
    queries: [
      { method: "GET", path: "/v1.0/applications", name: "List applications" },
      { method: "GET", path: "/v1.0/servicePrincipals", name: "Service principals" },
      { method: "GET", path: "/v1.0/oauth2PermissionGrants", name: "OAuth2 permission grants" },
    ],
  },
  {
    name: "Security",
    queries: [
      { method: "GET", path: "/v1.0/security/alerts_v2", name: "Security alerts" },
      { method: "GET", path: "/v1.0/identityProtection/riskyUsers", name: "Risky users" },
      { method: "GET", path: "/v1.0/identity/conditionalAccess/policies", name: "Conditional Access policies" },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

const METHOD_CLASSES: Record<string, string> = {
  GET: "text-method-get bg-method-get/10",
  POST: "text-method-post bg-method-post/10",
  PUT: "text-method-put bg-method-put/10",
  PATCH: "text-method-patch bg-method-patch/10",
  DELETE: "text-method-delete bg-method-delete/10",
};

const BASE_URL = "https://graph.microsoft.com";

// ── Icons ───────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
    >
      <polyline
        points="9 6 15 12 9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SamplesIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="text-text-muted"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14 2 14 8 20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────

export function SampleQueries({ onSelectQuery }: SampleQueriesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(SAMPLE_CATEGORIES.filter((c) => c.expanded).map((c) => c.name)),
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return SAMPLE_CATEGORIES.map((cat) => ({
      ...cat,
      queries: cat.queries.filter(
        (query) =>
          query.name.toLowerCase().includes(q) ||
          query.path.toLowerCase().includes(q) ||
          query.method.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.queries.length > 0);
  }, [searchQuery]);

  function toggleCategory(name: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function handleSelect(query: SampleQuery) {
    const url = `${BASE_URL}${query.path}`;
    window.dispatchEvent(
      new CustomEvent("select-query", {
        detail: { method: query.method, url },
      }),
    );
    onSelectQuery?.({ method: query.method, url });
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="flex items-center gap-2 rounded border border-border-subtle bg-bg-elevated px-2 py-1.5">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <SamplesIcon />
            <p className="text-xs text-text-muted">No matching samples</p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = isSearching || expandedCategories.has(category.name);
            return (
              <div key={category.name}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="sticky top-0 z-10 flex w-full cursor-pointer items-center gap-1.5 bg-bg-deep px-3 pt-3 pb-1 transition-colors hover:text-text-secondary"
                >
                  <ChevronIcon expanded={isExpanded} />
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {category.name}
                  </span>
                  <span className="ml-auto text-[10px] tabular-nums text-text-tertiary">
                    {category.queries.length}
                  </span>
                </button>

                {/* Query items */}
                {isExpanded && (
                  <div className="flex flex-col gap-0.5 px-2 pb-1">
                    {category.queries.map((query) => (
                      <button
                        key={`${query.method}-${query.path}`}
                        onClick={() => handleSelect(query)}
                        title={`${query.method} ${query.path}`}
                        className="group flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-bg-hover"
                      >
                        <span
                          className={`shrink-0 rounded px-1 py-px font-mono text-[10px] font-bold uppercase leading-tight ${METHOD_CLASSES[query.method] ?? "text-text-muted bg-bg-elevated"}`}
                        >
                          {query.method}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
                          {query.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
