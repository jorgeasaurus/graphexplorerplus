"use client";

import { useState, useRef, useEffect } from "react";
import { naturalLanguageToQuery, isAIConfigured } from "~/lib/ai/azure-openai";

interface NLQueryBarProps {
  onQueryGenerated: (query: { method: string; url: string; body?: string }) => void;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 15l.88 2.63L22.5 18.5l-2.62.87L19 22l-.88-2.63L15.5 18.5l2.62-.87L19 15z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ExampleItem {
  text: string;
  license?: string;
}

const EXAMPLE_CATEGORIES: { label: string; items: ExampleItem[] }[] = [
  {
    label: "Identity",
    items: [
      { text: "List users whose accounts are disabled" },
      { text: "Show users with admin roles" },
      { text: "Get all groups I'm a member of" },
      { text: "List all app registrations in my tenant" },
      { text: "List apps and their credential expiration dates" },
      { text: "Show guest users in my tenant" },
      { text: "Find users with no MFA registered", license: "Entra P1" },
      { text: "Get the authorization policy for my tenant" },
      { text: "Get all deleted users" },
      { text: "Get my direct reports" },
      { text: "List service principals and their credentials" },
      { text: "Show organization details and verified domains" },
      { text: "List all license SKUs and usage" },
    ],
  },
  {
    label: "Intune",
    items: [
      { text: "Show me all non-compliant devices" },
      { text: "Find devices running Windows 11" },
      { text: "Get all device configuration profiles" },
      { text: "Find Windows Autopilot devices" },
      { text: "Get all Intune PowerShell scripts" },
      { text: "List devices that haven't synced in 30 days" },
      { text: "Show all Intune app protection policies" },
      { text: "List all compliance policies" },
      { text: "Show corporate-owned devices" },
      { text: "List all assignment filters in Intune" },
      { text: "Show Settings Catalog policies" },
      { text: "Get app install summary report" },
      { text: "Show all detected apps in Intune" },
      { text: "Get remote action audit logs" },
    ],
  },
  {
    label: "Security",
    items: [
      { text: "Get all Conditional Access policies" },
      { text: "List all security alerts" },
      { text: "List all named locations in Conditional Access" },
      { text: "Get all security incidents" },
      { text: "Run an advanced hunting query", license: "Defender XDR" },
    ],
  },
  {
    label: "Productivity",
    items: [
      { text: "Show my recent Teams messages" },
      { text: "Show me my calendar events for this week" },
      { text: "Get all SharePoint sites" },
      { text: "List my recent emails" },
      { text: "Get my OneDrive recent files" },
      { text: "Show my Planner tasks" },
      { text: "Get Teams activity report for last 7 days" },
    ],
  },
];

export function NLQueryBar({ onQueryGenerated }: NLQueryBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder] = useState("Describe what you want from Graph API");
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const configured = isAIConfigured();

  // Abort in-flight AI request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showExamples) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowExamples(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showExamples]);

  function selectExample(text: string) {
    setPrompt(text);
    setShowExamples(false);
    inputRef.current?.focus();
  }

  async function handleSubmit(text?: string) {
    const query = (text ?? prompt).trim();
    if (!query || isLoading) return;

    setPrompt(query);
    setIsLoading(true);
    setError(null);
    setShowExamples(false);

    try {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const result = await naturalLanguageToQuery(query, { signal: controller.signal });
      onQueryGenerated({
        method: result.method,
        url: result.url,
        body: typeof result.body === "object" && result.body !== null
          ? JSON.stringify(result.body)
          : (result.body as string | undefined) ?? undefined,
      });
      setPrompt("");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error
          ? `${err.message}. Try selecting an example query from the dropdown.`
          : "Failed to generate query. Try selecting an example query from the dropdown.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (!configured) return null;

  return (
    <div className="relative flex flex-col gap-1" ref={dropdownRef}>
      <div className="flex items-center gap-2 rounded-xl border border-border-subtle bg-bg-deep px-4 py-2.5 transition-colors focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/30">
        <SparkleIcon
          className={`shrink-0 ${isLoading ? "animate-pulse text-accent" : "text-accent/60"}`}
        />
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit();
            }
          }}
          onFocus={() => !prompt.trim() && setShowExamples(true)}
          placeholder={placeholder}
          disabled={isLoading}
          aria-label="Describe your query in plain English"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/60 outline-none disabled:opacity-50"
        />
        {isLoading ? (
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-accent">
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
                opacity="0.25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            Thinking
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowExamples((o) => !o)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
              aria-label="Show example queries"
              title="Example queries"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 9h8M8 13h4m4-9H8a2 2 0 0 0-2 2v12l3-3h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {prompt.trim() ? (
              <button
                onClick={() => void handleSubmit()}
                className="shrink-0 rounded-lg bg-accent/15 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/25"
              >
                Generate
              </button>
            ) : (
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-widest text-text-muted/40">
                AI
              </span>
            )}
          </>
        )}
      </div>

      {/* Example queries dropdown */}
      {showExamples && !isLoading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-border-default bg-bg-elevated shadow-2xl">
          {EXAMPLE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="sticky top-0 border-b border-border-subtle bg-bg-elevated px-4 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {cat.label}
                </span>
              </div>
              {cat.items.map((item) => (
                <button
                  key={item.text}
                  onClick={() => selectExample(item.text)}
                  onDoubleClick={() => void handleSubmit(item.text)}
                  className="flex h-10 w-full items-center gap-2.5 px-4 text-left text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  <SparkleIcon className="shrink-0 text-accent/40" />
                  <span className="flex-1 truncate">{item.text}</span>
                  {item.license && (
                    <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400">
                      {item.license}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
          <div className="border-t border-border-subtle px-3 py-2">
            <span className="text-[10px] text-text-muted">
              Click to fill, double-click to run instantly
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="px-1 text-[11px] text-error">{error}</p>
      )}
      <p className="px-1 text-[10px] text-text-muted/50">
        AI-generated queries may be inaccurate. Always verify the endpoint and parameters before sending.
      </p>
    </div>
  );
}
