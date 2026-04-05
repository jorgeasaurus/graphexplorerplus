"use client";

import { useState, useCallback, useId } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
              row.enabled
                ? "border-accent bg-accent/20 text-accent"
                : "border-border-default bg-bg-elevated text-transparent"
            }`}
            aria-label={row.enabled ? "Disable" : "Enable"}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <polyline
                points="20 6 9 17 4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Key */}
          <input
            type="text"
            value={row.key}
            onChange={(e) => update(row.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className="h-7 flex-1 rounded border border-border-subtle bg-bg-elevated px-2 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />

          {/* Value */}
          <input
            type="text"
            value={row.value}
            onChange={(e) => update(row.id, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className="h-7 flex-1 rounded border border-border-subtle bg-bg-elevated px-2 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          />

          {/* Delete */}
          <button
            onClick={() => remove(row.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-all hover:bg-bg-hover hover:text-method-delete group-hover:opacity-100"
            aria-label="Remove row"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
        className="mx-3 mt-1 flex h-7 items-center gap-1.5 rounded border border-dashed border-border-subtle px-2 text-xs text-text-muted transition-colors hover:border-border-default hover:text-text-tertiary"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
        className="min-h-[120px] flex-1 resize-none bg-bg-elevated p-3 font-mono text-xs leading-[1.625rem] text-text-primary placeholder:text-text-muted focus:outline-none"
      />
    </div>
  );
}

// ─── Auth Tab ────────────────────────────────────────────────────────

function AuthTab() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {/* Status card */}
      <div className="flex items-center gap-3 rounded border border-border-subtle bg-bg-elevated px-4 py-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-50" />
          <span className="inline-flex h-2 w-2 rounded-full bg-warning" />
        </span>
        <div>
          <p className="text-xs font-medium text-text-primary">
            Not authenticated
          </p>
          <p className="text-[11px] text-text-muted">
            Sign in to send authenticated requests
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

export default function QueryBuilder() {
  const uid = useId();

  const [method, setMethod] = useState<HttpMethod>("GET");
  const [url, setUrl] = useState("https://graph.microsoft.com/v1.0/me");
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

  const handleSend = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const style = METHOD_STYLES[method];

  return (
    <div className="flex flex-col">
      {/* ── URL Bar Row ─────────────────────────────────────────── */}
      <div className="flex h-[42px] items-center gap-2 border-b border-border-subtle px-3">
        {/* Method dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`flex h-[30px] items-center gap-1.5 rounded px-2.5 font-mono text-xs font-bold tracking-wide transition-colors ${style.text} ${style.bg} hover:brightness-125`}
          >
            {method}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <polyline
                points="6 9 12 15 18 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              {/* Menu */}
              <div className="absolute left-0 top-full z-20 mt-1 w-28 overflow-hidden rounded border border-border-default bg-bg-surface shadow-xl shadow-black/40">
                {METHODS.map((m) => {
                  const s = METHOD_STYLES[m];
                  return (
                    <button
                      key={m}
                      onClick={() => handleMethodChange(m)}
                      className={`flex w-full items-center px-3 py-1.5 font-mono text-xs font-bold tracking-wide transition-colors hover:bg-bg-hover ${s.text} ${
                        m === method ? s.bg : ""
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://graph.microsoft.com/v1.0/"
          className="h-[30px] min-w-0 flex-1 rounded border border-border-default bg-bg-elevated px-3 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="flex h-[30px] items-center gap-1.5 rounded bg-accent px-5 font-sans text-xs font-semibold text-bg-deep transition-colors hover:bg-accent-hover disabled:opacity-70"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          Send
        </button>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────── */}
      <div className="flex h-9 items-end border-b border-border-subtle bg-bg-surface">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex h-full items-center px-4 text-xs font-medium transition-colors ${
                isActive
                  ? "text-accent"
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

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <div className="flex-1">
        {activeTab === "headers" && (
          <KVEditor
            rows={headers}
            onChange={setHeaders}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
          />
        )}

        {activeTab === "body" && (
          <BodyEditor value={body} onChange={setBody} />
        )}

        {activeTab === "params" && (
          <KVEditor
            rows={params}
            onChange={setParams}
            keyPlaceholder="Parameter"
            valuePlaceholder="Value"
          />
        )}

        {activeTab === "auth" && <AuthTab />}
      </div>
    </div>
  );
}
