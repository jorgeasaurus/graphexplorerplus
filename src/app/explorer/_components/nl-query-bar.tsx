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

const EXAMPLES = [
  "Show me all non-compliant devices",
  "List users whose accounts are disabled",
  "Get all Conditional Access policies",
  "Find Windows Autopilot devices",
  "Show my recent Teams messages",
  "List apps with expiring secrets",
  "Get all Intune PowerShell scripts",
  "Show risky sign-ins from today",
  "Get all groups I'm a member of",
  "List all security alerts",
  "Show me my calendar events for this week",
  "Get all device configuration profiles",
  "List all app registrations in my tenant",
  "Show users with admin roles",
  "Find devices running Windows 11",
  "Get all SharePoint sites",
];

const EXAMPLE_CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Identity",
    items: [
      "List users whose accounts are disabled",
      "Show users with admin roles",
      "Get all groups I'm a member of",
      "List all app registrations in my tenant",
      "List apps with expiring secrets",
    ],
  },
  {
    label: "Intune",
    items: [
      "Show me all non-compliant devices",
      "Find devices running Windows 11",
      "Get all device configuration profiles",
      "Find Windows Autopilot devices",
      "Get all Intune PowerShell scripts",
    ],
  },
  {
    label: "Security",
    items: [
      "Get all Conditional Access policies",
      "Show risky sign-ins from today",
      "List all security alerts",
      "Show risky users in my tenant",
    ],
  },
  {
    label: "Productivity",
    items: [
      "Show my recent Teams messages",
      "Show me my calendar events for this week",
      "Get all SharePoint sites",
      "List my recent emails",
    ],
  },
];

export function NLQueryBar({ onQueryGenerated }: NLQueryBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const configured = isAIConfigured();

  // Rotating placeholder examples
  useEffect(() => {
    let idx = Math.floor(Math.random() * EXAMPLES.length);
    setPlaceholder(EXAMPLES[idx]!);
    const interval = setInterval(() => {
      idx = (idx + 1) % EXAMPLES.length;
      setPlaceholder(EXAMPLES[idx]!);
    }, 4000);
    return () => clearInterval(interval);
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
      const result = await naturalLanguageToQuery(query);
      onQueryGenerated({
        method: result.method,
        url: result.url,
        body: result.body ?? undefined,
      });
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate query");
    } finally {
      setIsLoading(false);
    }
  }

  if (!configured) return null;

  return (
    <div className="relative flex flex-col gap-1" ref={dropdownRef}>
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-deep px-3 py-2 transition-colors focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/30">
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
              className="shrink-0 rounded-md px-1.5 py-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-secondary"
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
                className="shrink-0 rounded-md bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/25"
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
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border-default bg-bg-elevated shadow-xl">
          {EXAMPLE_CATEGORIES.map((cat) => (
            <div key={cat.label}>
              <div className="sticky top-0 border-b border-border-subtle bg-bg-elevated px-3 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                  {cat.label}
                </span>
              </div>
              {cat.items.map((item) => (
                <button
                  key={item}
                  onClick={() => selectExample(item)}
                  onDoubleClick={() => void handleSubmit(item)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  <SparkleIcon className="shrink-0 text-accent/40" />
                  {item}
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
    </div>
  );
}
