"use client";

import { useIsAuthenticated } from "@azure/msal-react";

export function StatusBar() {
  const isAuth = useIsAuthenticated();

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border-subtle bg-bg-deep px-4 font-mono text-[11px] text-text-tertiary">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${isAuth ? "bg-success" : "bg-warning"}`}
        />
        <span>{isAuth ? "Connected" : "Not connected"}</span>
      </div>
      <span className="text-text-muted">v0.2.0</span>
    </footer>
  );
}
