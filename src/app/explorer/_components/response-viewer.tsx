"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────

interface ResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  body: string;
  headers: Record<string, string>;
}

type TabId = "body" | "headers" | "preview";

const TABS = [
  { id: "body" as const, label: "Body" },
  { id: "headers" as const, label: "Headers" },
  { id: "preview" as const, label: "Preview" },
];

// ── JSON Syntax Highlighting ───────────────────────────────

function highlightJson(json: string): React.ReactNode[] {
  const lines = json.split("\n");

  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = [];
    let i = 0;

    while (i < line.length) {
      // Whitespace
      if (line[i] === " " || line[i] === "\t") {
        let ws = "";
        while (i < line.length && (line[i] === " " || line[i] === "\t")) {
          ws += line[i]!;
          i++;
        }
        tokens.push(ws);
        continue;
      }

      // Strings — determine if key or value based on what follows the closing quote
      if (line[i] === '"') {
        let str = '"';
        i++;
        while (i < line.length && line[i] !== '"') {
          if (line[i] === "\\") {
            str += line[i]! + (line[i + 1] ?? "");
            i += 2;
          } else {
            str += line[i]!;
            i++;
          }
        }
        str += '"';
        i++; // skip closing quote

        // Look ahead past whitespace for colon → it's a key
        let lookahead = i;
        while (
          lookahead < line.length &&
          line[lookahead] === " "
        ) {
          lookahead++;
        }
        const isKey = line[lookahead] === ":";

        tokens.push(
          <span
            key={`${lineIdx}-s-${tokens.length}`}
            className={isKey ? "text-info" : "text-success"}
          >
            {str}
          </span>,
        );
        continue;
      }

      // Numbers
      if (line[i] === "-" || (line[i]! >= "0" && line[i]! <= "9")) {
        let num = "";
        while (
          i < line.length &&
          /[\d.eE+\-]/.test(line[i]!)
        ) {
          num += line[i]!;
          i++;
        }
        tokens.push(
          <span
            key={`${lineIdx}-n-${tokens.length}`}
            className="text-warning"
          >
            {num}
          </span>,
        );
        continue;
      }

      // Booleans & null
      const rest = line.slice(i);
      const kwMatch = rest.match(/^(true|false|null)/);
      if (kwMatch) {
        tokens.push(
          <span
            key={`${lineIdx}-k-${tokens.length}`}
            className="text-method-patch"
          >
            {kwMatch[1]}
          </span>,
        );
        i += kwMatch[1]!.length;
        continue;
      }

      // Braces & brackets
      if ("{[}]".includes(line[i]!)) {
        tokens.push(
          <span
            key={`${lineIdx}-b-${tokens.length}`}
            className="text-text-secondary"
          >
            {line[i]}
          </span>,
        );
        i++;
        continue;
      }

      // Punctuation (colon, comma)
      if (line[i] === ":" || line[i] === ",") {
        tokens.push(
          <span
            key={`${lineIdx}-p-${tokens.length}`}
            className="text-text-tertiary"
          >
            {line[i]}
          </span>,
        );
        i++;
        continue;
      }

      // Fallback: advance one character
      tokens.push(line[i]);
      i++;
    }

    return tokens;
  });
}

// ── Utility ────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  return kb < 1024
    ? `${kb.toFixed(1)} KB`
    : `${(kb / 1024).toFixed(1)} MB`;
}

function statusColorClasses(status: number): {
  badge: string;
  text: string;
} {
  if (status >= 200 && status < 300)
    return { badge: "bg-success/10", text: "text-success" };
  if (status >= 300 && status < 400)
    return { badge: "bg-info/10", text: "text-info" };
  if (status >= 400 && status < 500)
    return { badge: "bg-warning/10", text: "text-warning" };
  return { badge: "bg-error/10", text: "text-error" };
}

// ── Icons (inline SVGs matching project conventions) ───────

function ClipboardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <div className="text-text-muted">
        <BoltIcon />
      </div>
      <p className="text-xs text-text-muted">
        Send a request to see the response
      </p>
    </div>
  );
}

function BodyTab({ body }: { body: string }) {
  // Try to pretty-print JSON; fall back to raw text
  let displayBody = body;
  try {
    const parsed: unknown = JSON.parse(body);
    displayBody = JSON.stringify(parsed, null, 2);
  } catch {
    // Not JSON — display as raw text
  }

  const isJson = displayBody !== body || (body.trimStart().startsWith("{") || body.trimStart().startsWith("["));
  const lines = displayBody.split("\n");
  const lineCount = lines.length;
  const gutterWidth = String(lineCount).length;

  if (!isJson) {
    return (
      <div className="flex-1 overflow-auto">
        <pre className="whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-text-primary">
          {displayBody}
        </pre>
      </div>
    );
  }

  const highlighted = highlightJson(displayBody);

  return (
    <div className="flex-1 overflow-auto">
      <pre className="font-mono text-xs leading-5">
        <code>
          {highlighted.map((tokens, idx) => (
            <div key={idx} className="flex">
              <span
                className="shrink-0 select-none border-r border-border-subtle pr-3 text-right text-text-muted"
                style={{ width: `${Math.max(gutterWidth * 0.6 + 1.4, 2)}rem` }}
              >
                {idx + 1}
              </span>
              <span className="pl-4">{tokens}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function HeadersTab({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);

  return (
    <div className="flex-1 overflow-auto">
      <div className="divide-y divide-border-subtle">
        {entries.map(([name, value], idx) => (
          <div
            key={name}
            className={`flex gap-4 px-3 py-1.5 ${idx % 2 === 0 ? "bg-bg-surface" : "bg-bg-elevated"}`}
          >
            <span className="w-48 shrink-0 truncate font-mono text-xs text-accent">
              {name}
            </span>
            <span className="truncate font-mono text-xs text-text-secondary">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewTab() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <p className="text-xs text-text-muted">
        Preview not available for this response type
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function ResponseViewer({
  response,
}: {
  response?: ResponseData | null;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("body");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!response) return;
    await navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [response]);

  if (response === undefined) return <EmptyState />;

  if (response === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
        <svg className="h-6 w-6 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="text-xs text-text-muted">Loading…</p>
      </div>
    );
  }

  const { badge, text } = statusColorClasses(response.status);

  return (
    <div className="flex h-full flex-col">
      {/* ── Status / Meta Bar ─────────────────────────────── */}
      <div className="flex h-9 items-center gap-3 border-b border-border-subtle px-3">
        {/* Status badge */}
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-xs font-medium ${badge} ${text}`}
        >
          {response.status} {response.statusText}
        </span>

        {/* Meta */}
        <span className="font-mono text-xs text-text-secondary">
          {response.timeMs}ms
        </span>
        <span className="font-mono text-xs text-text-secondary">
          {formatBytes(response.sizeBytes)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <button
          onClick={handleCopy}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
          title="Copy response"
        >
          {copied ? <CheckIcon /> : <ClipboardIcon />}
        </button>
        <button
          className="inline-flex h-6 w-6 items-center justify-center rounded text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
          title="Download response"
        >
          <DownloadIcon />
        </button>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────── */}
      <div className="flex h-8 items-end gap-1 border-b border-border-subtle px-3">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-2.5 pb-1.5 text-xs transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ───────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col">
        {activeTab === "body" && <BodyTab body={response.body} />}
        {activeTab === "headers" && (
          <HeadersTab headers={response.headers} />
        )}
        {activeTab === "preview" && <PreviewTab />}
      </div>
    </div>
  );
}
