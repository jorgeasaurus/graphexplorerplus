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
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/jorgeasaurus/graphexplorerplus/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted transition-colors hover:text-text-secondary"
        >
          Report Issue
        </a>
        <a
          href="https://github.com/jorgeasaurus/graphexplorerplus"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-text-muted transition-colors hover:text-text-secondary"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.62-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.21.69.82.57A12 12 0 0 0 12 .3" />
          </svg>
          GitHub
        </a>
        <span className="text-text-muted">v0.2.0</span>
      </div>
    </footer>
  );
}
