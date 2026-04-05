"use client";

import { useIsAuthenticated } from "@azure/msal-react";

export function StatusBar() {
  const isAuth = useIsAuthenticated();

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-border-subtle bg-bg-deep px-3 font-mono text-xs text-text-tertiary">
      {/* Left: Connection status */}
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${isAuth ? "bg-success" : "bg-warning"}`}
        />
        <span>{isAuth ? "Connected" : "Not connected"}</span>
      </div>

      <span className="text-text-muted">v0.1.0</span>
    </footer>
  );
}
