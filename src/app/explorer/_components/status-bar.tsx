"use client";

import { useState } from "react";

export function StatusBar() {
  const [apiVersion, setApiVersion] = useState<"v1.0" | "beta">("v1.0");

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border-subtle bg-bg-deep px-3 font-mono text-xs text-text-tertiary">
      {/* Left: Connection status */}
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        <span>Ready</span>
      </div>

      {/* Right: API version toggle */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setApiVersion("v1.0")}
          className={`rounded px-1.5 py-0.5 transition-colors ${
            apiVersion === "v1.0"
              ? "bg-accent-subtle text-accent"
              : "text-text-muted hover:text-text-tertiary"
          }`}
        >
          v1.0
        </button>
        <span className="text-text-muted">/</span>
        <button
          onClick={() => setApiVersion("beta")}
          className={`rounded px-1.5 py-0.5 transition-colors ${
            apiVersion === "beta"
              ? "bg-accent-subtle text-accent"
              : "text-text-muted hover:text-text-tertiary"
          }`}
        >
          beta
        </button>
      </div>
    </footer>
  );
}
