"use client";

import { useState, useCallback, useId, useRef, useEffect } from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { createGraphClient } from "~/lib/graph/client";
import type { GraphResponse } from "~/lib/graph/client";
import { addHistoryEntry } from "~/lib/history-store";
import { getSelectedCloudEnvironment } from "~/lib/auth/authUtils";
import { getGraphEndpoint } from "~/lib/auth/msalConfig";
import {
  loadEndpoints,
  searchEndpoints,
  type EndpointEntry,
} from "~/lib/data/endpoints";
import { PermissionInspector } from "./permission-inspector";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiVersion = "v1.0" | "beta";
type Tab = "headers" | "body" | "params" | "auth";

interface HeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const METHOD_STYLES: Record<HttpMethod, { text: string; bg: string }> = {
  GET: { text: "text-method-get", bg: "bg-method-get/15" },
  POST: { text: "text-method-post", bg: "bg-method-post/15" },
  PUT: { text: "text-method-put", bg: "bg-method-put/15" },
  PATCH: { text: "text-method-patch", bg: "bg-method-patch/15" },
  DELETE: { text: "text-method-delete", bg: "bg-method-delete/15" },
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const BODY_METHODS: HttpMethod[] = ["POST", "PUT", "PATCH"];

const TABS: { id: Tab; label: string }[] = [
  { id: "headers", label: "Headers" },
  { id: "body", label: "Body" },
  { id: "params", label: "Query Params" },
  { id: "auth", label: "Auth" },
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Key-Value Editor ────────────────────────────────────────────────

function KVEditor({
  rows,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: {
  rows: HeaderRow[];
  onChange: (rows: HeaderRow[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const update = (id: string, patch: Partial<HeaderRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const remove = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const addRow = () => {
    onChange([...rows, { id: makeId(), key: "", value: "", enabled: true }]);
  };

  return (
    <div className="flex flex-col gap-px">
      {/* Column labels */}
      <div className="flex items-center gap-2 px-3 pb-1 pt-2">
        <span className="w-5" />
        <span className="flex-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
          {keyPlaceholder}
        </span>
        <span className="flex-1 text-[10px] font-medium uppercase tracking-wider text-text-muted">
          {valuePlaceholder}
        </span>
        <span className="w-6" />
      </div>

      {rows.map((row) => (
        <div
          key={row.id}
          className="group flex items-center gap-2 px-3 py-0.5"
        >
          {/* Toggle */}
          <button
            onClick={() => update(row.id, { enabled: !row.enabled })}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              row.enabled
                ? "border-accent bg-accent/20 text-accent"
                : "border-border-default bg-bg-elevated text-transparent"
            }`}
            aria-label={row.enabled ? "Disable" : "Enable"}
          >
            <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Key */}
          <input
            type="text"
            value={row.key}
            onChange={(e) => update(row.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            aria-label="Header name"
            name="header-key"
            autoComplete="off"
            className="h-9 flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-3 font-mono text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />

          {/* Value */}
          <input
            type="text"
            value={row.value}
            onChange={(e) => update(row.id, { value: e.target.value })}
            placeholder={valuePlaceholder}
            aria-label="Header value"
            name="header-value"
            autoComplete="off"
            className="h-9 flex-1 rounded-lg border border-border-subtle bg-bg-elevated px-3 font-mono text-xs text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />

          {/* Delete */}
          <button
            onClick={() => remove(row.id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted opacity-0 transition-all hover:bg-bg-hover hover:text-method-delete group-hover:opacity-100"
            aria-label="Remove row"
          >
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}

      {/* Add row */}
      <button
        onClick={addRow}
        className="mx-3 mt-2 flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-border-subtle px-3 text-xs text-text-muted transition-colors hover:border-border-default hover:text-text-tertiary"
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <line
            x1="12"
            y1="5"
            x2="12"
            y2="19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Add row
      </button>
    </div>
  );
}

// ─── Body Editor ─────────────────────────────────────────────────────

function BodyEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const lineCount = Math.max(value.split("\n").length, 6);

  return (
    <div className="relative flex min-h-[120px] flex-1 overflow-hidden">
      {/* Line numbers */}
      <div
        className="flex shrink-0 select-none flex-col border-r border-border-subtle bg-bg-deep px-3 pt-3 text-right font-mono text-[11px] leading-[1.625rem] text-text-muted"
        aria-hidden="true"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'{ "key": "value" }'}
        spellCheck={false}
        aria-label="Request body"
        className="min-h-[120px] flex-1 resize-none bg-bg-elevated p-3 font-mono text-xs leading-[1.625rem] text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      />
    </div>
  );
}

// ─── Auth Tab ────────────────────────────────────────────────────────

function AuthTab({ authenticated }: { authenticated: boolean }) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Status card */}
      <div className="flex items-center gap-3 rounded border border-border-subtle bg-bg-elevated px-4 py-3">
        <span className="relative flex h-2 w-2">
          {!authenticated && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-50" />
          )}
          <span
            className={`inline-flex h-2 w-2 rounded-full ${authenticated ? "bg-success" : "bg-warning"}`}
          />
        </span>
        <div>
          <p className="text-xs font-medium text-text-primary">
            {authenticated ? "Authenticated" : "Not authenticated"}
          </p>
          <p className="text-[11px] text-text-muted">
            {authenticated
              ? "Bearer token will be attached to requests automatically"
              : "Sign in to send authenticated requests"}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        Session tokens are managed via the header bar sign-in flow.
      </p>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function QueryBuilder({
  onResponse,
  onRequest,
  sendRef,
}: {
  onResponse?: (response: GraphResponse | null) => void;
  onRequest?: (request: { method: string; url: string; headers?: Record<string, string>; body?: string }) => void;
  sendRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const uid = useId();

  const graphBase = getGraphEndpoint(getSelectedCloudEnvironment());

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState(`${graphBase}/v1.0/me`);
  const [apiVersion, setApiVersion] = useState<ApiVersion>("v1.0");
  const [activeTab, setActiveTab] = useState<Tab>("headers");
  const [headers, setHeaders] = useState<HeaderRow[]>([
    { id: makeId(), key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [params, setParams] = useState<HeaderRow[]>([
    { id: makeId(), key: "", value: "", enabled: true },
  ]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authWarning, setAuthWarning] = useState(false);
  const authenticated = useIsAuthenticated();

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<EndpointEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const endpointsRef = useRef<EndpointEntry[]>([]);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { method: string; url: string; body?: string };
      setMethod(detail.method as HttpMethod);
      setUrl(detail.url);
      if (detail.body) {
        setBody(detail.body);
        setActiveTab("body");
      }
    };
    window.addEventListener("select-query", handler);
    return () => window.removeEventListener("select-query", handler);
  }, []);

  const extractPath = useCallback((fullUrl: string) => {
    // Match any known Graph endpoint (global, usgov, germany, china)
    const match = fullUrl.match(
      /^https?:\/\/(?:graph\.microsoft\.(?:com|us|de)|dod-graph\.microsoft\.us|microsoftgraph\.chinacloudapi\.cn)\/(v1\.0|beta)(\/.*)?$/,
    );
    if (match) return match[2] ?? "";
    const afterBase = fullUrl.replace(
      /^https?:\/\/(?:graph\.microsoft\.(?:com|us|de)|dod-graph\.microsoft\.us|microsoftgraph\.chinacloudapi\.cn)\/?/,
      "",
    );
    return afterBase.replace(/^(v1\.0|beta)\/?/, "");
  }, []);

  const updateSuggestions = useCallback(
    (currentUrl: string) => {
      const path = extractPath(currentUrl);
      if (!path || path === "/") {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      const results = searchEndpoints(endpointsRef.current, path);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedSuggestionIndex(-1);
    },
    [extractPath],
  );

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      setUrl(newUrl);
      updateSuggestions(newUrl);
    },
    [updateSuggestions],
  );

  const handleUrlFocus = useCallback(() => {
    if (endpointsRef.current.length === 0) {
      void loadEndpoints().then((data) => {
        endpointsRef.current = data.endpoints;
        updateSuggestions(url);
      });
    } else {
      updateSuggestions(url);
    }
  }, [url, updateSuggestions]);

  const selectSuggestion = useCallback(
    (ep: EndpointEntry) => {
      const path = ep.p.replace(/^\//, "");
      const newUrl = `${graphBase}/${apiVersion}/${path}`;
      setUrl(newUrl);
      setShowSuggestions(false);
      setSuggestions([]);
      setSelectedSuggestionIndex(-1);
    },
    [apiVersion],
  );

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedSuggestionIndex]!);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [showSuggestions, suggestions, selectedSuggestionIndex, selectSuggestion],
  );

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex < 0 || !suggestionsRef.current) return;
    const el = suggestionsRef.current.children[selectedSuggestionIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedSuggestionIndex]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        urlInputRef.current &&
        !urlInputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleVersionChange = useCallback(
    (newVersion: ApiVersion) => {
      setApiVersion(newVersion);
      setUrl((prev) =>
        prev.replace(
          /^(https?:\/\/(?:graph\.microsoft\.(?:com|us|de)|dod-graph\.microsoft\.us|microsoftgraph\.chinacloudapi\.cn)\/)(v1\.0|beta)/,
          `$1${newVersion}`,
        ),
      );
    },
    [],
  );

  const handleMethodChange = useCallback(
    (m: HttpMethod) => {
      setMethod(m);
      setDropdownOpen(false);
      if (BODY_METHODS.includes(m)) {
        setActiveTab("body");
      }
    },
    [],
  );

  const handleSend = useCallback(async () => {
    if (!authenticated) {
      setAuthWarning(true);
      setTimeout(() => setAuthWarning(false), 2000);
      return;
    }
    setAuthWarning(false);
    setIsLoading(true);
    onResponse?.(null);

    try {
      const parsedHeaders: Record<string, string> = {};
      for (const row of headers) {
        if (row.enabled && row.key.trim()) {
          parsedHeaders[row.key.trim()] = row.value;
        }
      }

      onRequest?.({ method, url, headers: parsedHeaders, body: BODY_METHODS.includes(method) ? body : undefined });

      const client = createGraphClient();
      const result = await client.executeRequest({
        method,
        url,
        headers: parsedHeaders,
        body: BODY_METHODS.includes(method) ? body : undefined,
      });
      onResponse?.(result);
      addHistoryEntry({ method, url, status: result.status, timeMs: result.timeMs });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      onResponse?.({
        status: 0,
        statusText: "Error",
        headers: {},
        body: JSON.stringify({ error: message }, null, 2),
        timeMs: 0,
        sizeBytes: 0,
      });
      addHistoryEntry({ method, url, status: 0, timeMs: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, method, url, headers, body, onResponse, onRequest]);

  // Expose send function to parent for retry-after-consent
  if (sendRef) sendRef.current = () => void handleSend();

  const style = METHOD_STYLES[method];

  return (
    <div className="flex min-w-0 flex-col overflow-hidden">
      {/* URL Bar Row */}
      <div className="flex min-h-[48px] flex-wrap items-center gap-2 border-b border-border-subtle px-3 py-2 sm:px-4">
        {/* Method dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            aria-label={`HTTP method: ${method}`}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 font-mono text-xs font-bold tracking-wide transition-colors ${style.text} ${style.bg} hover:brightness-125`}
          >
            {method}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" role="presentation" onClick={() => setDropdownOpen(false)} />
              <div role="listbox" aria-label="HTTP methods" className="absolute left-0 top-full z-20 mt-1.5 w-28 overflow-hidden rounded-xl border border-border-default bg-bg-elevated p-1 shadow-2xl">
                {METHODS.map((m) => {
                  const s = METHOD_STYLES[m];
                  return (
                    <button
                      key={m}
                      role="option"
                      aria-selected={m === method}
                      onClick={() => handleMethodChange(m)}
                      className={`flex h-9 w-full items-center rounded-lg px-3 font-mono text-xs font-bold tracking-wide transition-colors hover:bg-bg-hover ${s.text} ${m === method ? s.bg : ""}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Version toggle */}
        <div className="hidden h-9 items-center overflow-hidden rounded-lg border border-border-default sm:flex">
          {(["v1.0", "beta"] as const).map((v) => (
            <button
              key={v}
              onClick={() => handleVersionChange(v)}
              className={`h-9 px-3 text-xs font-medium transition-colors ${
                apiVersion === v
                  ? "bg-accent-muted text-accent"
                  : "bg-bg-elevated text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* URL Input */}
        <div className="relative order-last min-w-0 flex-[1_1_100%] sm:order-none sm:flex-1">
          <input
            ref={urlInputRef}
            type="text"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onFocus={handleUrlFocus}
            onKeyDown={handleUrlKeyDown}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text").trim();
              if (pasted.startsWith("http")) {
                e.preventDefault();
                handleUrlChange(pasted);
              }
            }}
            placeholder={`${graphBase}/v1.0/`}
            aria-label="Request URL"
            spellCheck={false}
            autoComplete="off"
            name="url"
            className="h-9 w-full rounded-lg border border-border-default bg-bg-elevated px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            aria-controls={`${uid}-suggestions`}
            aria-activedescendant={
              selectedSuggestionIndex >= 0
                ? `${uid}-suggestion-${selectedSuggestionIndex}`
                : undefined
            }
          />

          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id={`${uid}-suggestions`}
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-[300px] overflow-y-auto rounded-xl border border-border-default bg-bg-elevated p-1 shadow-2xl"
            >
              {suggestions.map((ep, idx) => {
                const epStyle = METHOD_STYLES[ep.m as HttpMethod] ?? { text: "text-text-muted", bg: "bg-bg-hover" };
                return (
                  <button
                    key={`${ep.m}-${ep.p}`}
                    id={`${uid}-suggestion-${idx}`}
                    role="option"
                    aria-selected={idx === selectedSuggestionIndex}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(ep); }}
                    className={`flex w-full cursor-pointer flex-col gap-0.5 rounded-lg px-3 py-2 text-left transition-colors ${
                      idx === selectedSuggestionIndex ? "bg-bg-hover" : "hover:bg-bg-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none ${epStyle.text} ${epStyle.bg}`}>
                        {ep.m}
                      </span>
                      <span className="truncate font-mono text-xs text-text-primary">{ep.p}</span>
                    </div>
                    {ep.s && (
                      <span className="truncate pl-[calc(1.5rem+0.5rem)] font-sans text-[11px] text-text-muted">{ep.s}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={() => void handleSend()}
          disabled={isLoading}
          className="flex h-9 items-center gap-2 rounded-lg bg-accent px-4 font-sans text-xs font-semibold text-bg-deep transition-colors hover:bg-accent-hover disabled:opacity-70 sm:px-6"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {authWarning ? "Sign in first" : "Send"}
        </button>
      </div>

      {/* Permission Inspector */}
      <PermissionInspector method={method} url={url} />

      {/* Tab Bar */}
      <div className="flex h-10 items-end gap-0.5 border-b border-border-subtle bg-bg-surface px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex h-9 items-center rounded-t-lg px-4 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-bg-elevated text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "headers" && (
          <KVEditor rows={headers} onChange={setHeaders} keyPlaceholder="Header" valuePlaceholder="Value" />
        )}
        {activeTab === "body" && <BodyEditor value={body} onChange={setBody} />}
        {activeTab === "params" && (
          <KVEditor rows={params} onChange={setParams} keyPlaceholder="Parameter" valuePlaceholder="Value" />
        )}
        {activeTab === "auth" && <AuthTab authenticated={authenticated} />}
      </div>
    </div>
  );
}
