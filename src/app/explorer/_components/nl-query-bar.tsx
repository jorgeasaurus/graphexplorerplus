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
];

export function NLQueryBar({ onQueryGenerated }: NLQueryBarProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
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

  async function handleSubmit() {
    const text = prompt.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await naturalLanguageToQuery(text);
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
    <div className="flex flex-col gap-1">
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
        ) : prompt.trim() ? (
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
      </div>
      {error && (
        <p className="px-1 text-[11px] text-error">{error}</p>
      )}
    </div>
  );
}
