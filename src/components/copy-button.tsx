"use client";

import { useState, useCallback } from "react";

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={() => void handleCopy()}
      className={`inline-flex h-9 min-w-[36px] items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
        copied
          ? "bg-success/10 text-success"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
      } ${className}`}
      aria-label={copied ? "Copied!" : label}
      title={copied ? "Copied!" : label}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}
