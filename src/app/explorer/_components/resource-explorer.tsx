"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadEndpoints, type EndpointEntry } from "~/lib/data/endpoints";

// ── Types ──────────────────────────────────────────────────────────

interface TreeNode {
  segment: string;
  fullPath: string;
  children: Map<string, TreeNode>;
  endpoints: { method: string; summary: string }[];
}

type ApiVersion = "v1.0" | "beta";

// ── Constants ──────────────────────────────────────────────────────

const GRAPH_BASE = "https://graph.microsoft.com";

const METHOD_CLASSES: Record<string, string> = {
  GET: "text-method-get bg-method-get/15",
  POST: "text-method-post bg-method-post/15",
  PUT: "text-method-put bg-method-put/15",
  PATCH: "text-method-patch bg-method-patch/15",
  DELETE: "text-method-delete bg-method-delete/15",
};

const METHOD_ORDER: Record<string, number> = {
  GET: 0,
  POST: 1,
  PUT: 2,
  PATCH: 3,
  DELETE: 4,
};

// ── Tree builder ───────────────────────────────────────────────────

function buildTree(endpoints: EndpointEntry[]): TreeNode {
  const root: TreeNode = {
    segment: "",
    fullPath: "",
    children: new Map(),
    endpoints: [],
  };

  for (const ep of endpoints) {
    const segments = ep.p.split("/").filter(Boolean);
    let node = root;
    let path = "";

    for (const seg of segments) {
      path += "/" + seg;
      let child = node.children.get(seg);
      if (!child) {
        child = {
          segment: seg,
          fullPath: path,
          children: new Map(),
          endpoints: [],
        };
        node.children.set(seg, child);
      }
      node = child;
    }

    node.endpoints.push({ method: ep.m, summary: ep.s ?? "" });
  }

  return root;
}

// ── Search filter ──────────────────────────────────────────────────

function filterTree(node: TreeNode, query: string): TreeNode | null {
  const q = query.toLowerCase();

  const selfMatches =
    node.segment.toLowerCase().includes(q) ||
    node.fullPath.toLowerCase().includes(q) ||
    node.endpoints.some((ep) => ep.summary.toLowerCase().includes(q));

  const filteredChildren = new Map<string, TreeNode>();
  for (const [key, child] of node.children) {
    const filtered = filterTree(child, query);
    if (filtered) filteredChildren.set(key, filtered);
  }

  if (selfMatches || filteredChildren.size > 0) {
    return { ...node, children: filteredChildren };
  }

  return null;
}

// ── Icons ──────────────────────────────────────────────────────────

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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 text-text-muted transition-transform ${expanded ? "rotate-90" : ""}`}
    >
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      aria-hidden="true"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="text-text-muted"
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
      <line
        x1="8"
        y1="11"
        x2="14"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Tree node component ────────────────────────────────────────────

function TreeNodeRow({
  node,
  depth,
  expanded,
  onToggle,
  version,
  forceExpand,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  version: ApiVersion;
  forceExpand: boolean;
}) {
  const hasChildren = node.children.size > 0;
  const isExpanded = forceExpand || expanded.has(node.fullPath);
  const isParam = node.segment.startsWith("{");

  function handleMethodClick(e: React.MouseEvent, method: string) {
    e.stopPropagation();
    const url = `${GRAPH_BASE}/${version}${node.fullPath}`;
    window.dispatchEvent(
      new CustomEvent("select-query", { detail: { method, url } }),
    );
  }

  const sortedChildren = useMemo(
    () =>
      Array.from(node.children.values()).sort((a, b) =>
        a.segment.localeCompare(b.segment),
      ),
    [node.children],
  );

  const sortedEndpoints = useMemo(
    () =>
      [...node.endpoints].sort(
        (a, b) => (METHOD_ORDER[a.method] ?? 9) - (METHOD_ORDER[b.method] ?? 9),
      ),
    [node.endpoints],
  );

  return (
    <>
      <div
        className="group flex min-h-9 cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 transition-colors hover:bg-bg-hover"
        style={{ paddingLeft: `${depth * 16 + 6}px` }}
        onClick={() => onToggle(node.fullPath)}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {hasChildren ? (
          <ChevronIcon expanded={isExpanded} />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <span
          className={`min-w-0 truncate font-mono text-xs ${
            isParam ? "text-accent" : "text-text-primary"
          }`}
        >
          {node.segment}
        </span>

        {sortedEndpoints.length > 0 && (
          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            {sortedEndpoints.map((ep) => (
              <button
                key={ep.method}
                onClick={(e) => handleMethodClick(e, ep.method)}
                title={ep.summary || `${ep.method} ${node.fullPath}`}
                className={`h-5 rounded px-1 font-mono text-[10px] font-bold uppercase leading-tight transition-opacity hover:opacity-80 ${
                  METHOD_CLASSES[ep.method] ?? "text-text-muted"
                }`}
              >
                {ep.method}
              </button>
            ))}
          </div>
        )}
      </div>

      {isExpanded &&
        sortedChildren.map((child) => (
          <TreeNodeRow
            key={child.segment}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            version={version}
            forceExpand={forceExpand}
          />
        ))}
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────

const SKELETON_WIDTHS = [75, 60, 85, 50, 70, 90, 55, 80, 65, 72, 58, 88];
const SKELETON_INDENTS = [0, 0, 16, 16, 32, 0, 16, 0, 0, 16, 32, 16];

function Skeleton() {
  return (
    <div className="flex flex-col gap-1.5 p-2">
      {SKELETON_WIDTHS.map((w, i) => (
        <div
          key={i}
          className="h-6 animate-pulse rounded-lg bg-bg-hover"
          style={{ width: `${w}%`, marginLeft: `${SKELETON_INDENTS[i]}px` }}
        />
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function ResourceExplorer() {
  const [endpoints, setEndpoints] = useState<EndpointEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [version, setVersion] = useState<ApiVersion>("v1.0");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadEndpoints()
      .then((data) => setEndpoints(data.endpoints))
      .catch(() => setLoadError("Failed to load endpoints"));
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedQuery(searchQuery),
      200,
    );
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const tree = useMemo(() => {
    if (!endpoints) return null;
    return buildTree(endpoints);
  }, [endpoints]);

  const displayTree = useMemo(() => {
    if (!tree) return null;
    if (!debouncedQuery.trim()) return tree;
    return filterTree(tree, debouncedQuery.trim());
  }, [tree, debouncedQuery]);

  const isSearching = debouncedQuery.trim().length > 0;
  const endpointCount = endpoints?.length ?? 0;

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const sortedRootChildren = useMemo(() => {
    if (!displayTree) return [];
    return Array.from(displayTree.children.values()).sort((a, b) =>
      a.segment.localeCompare(b.segment),
    );
  }, [displayTree]);

  return (
    <div className="flex h-full flex-col">
      {/* Version toggle + endpoint count */}
      <div className="flex flex-col gap-1.5 p-2">
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-lg border border-border-subtle bg-bg-elevated p-0.5">
            {(["v1.0", "beta"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVersion(v)}
                className={`h-7 rounded-md px-2.5 text-xs font-medium transition-colors ${
                  version === v
                    ? "bg-bg-hover text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          {endpointCount > 0 && (
            <span className="text-xs tabular-nums text-text-muted">
              {endpointCount.toLocaleString()} endpoints
            </span>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded border border-border-subtle bg-bg-elevated px-2 py-1.5">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search resources"
            name="search-resources"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-1" role="tree">
        {loadError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-xs text-red-400">{loadError}</p>
          </div>
        ) : !endpoints ? (
          <Skeleton />
        ) : !displayTree || displayTree.children.size === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <EmptyIcon />
            <p className="text-xs text-text-muted">No matching resources</p>
          </div>
        ) : (
          sortedRootChildren.map((child) => (
            <TreeNodeRow
              key={child.segment}
              node={child}
              depth={0}
              expanded={expanded}
              onToggle={handleToggle}
              version={version}
              forceExpand={isSearching}
            />
          ))
        )}
      </div>
    </div>
  );
}
