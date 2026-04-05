"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { signIn, signOut, setSelectedCloudEnvironment, getSelectedCloudEnvironment } from "~/lib/auth/authUtils";
import { type CloudEnvironment } from "~/lib/auth/msalConfig";
import { ThemeToggle } from "~/components/theme-toggle";

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const CLOUD_OPTIONS: { id: CloudEnvironment; label: string }[] = [
  { id: "global", label: "Global" },
  { id: "usgov", label: "US Gov" },
  { id: "usgovdod", label: "US Gov DoD" },
  { id: "germany", label: "Germany" },
  { id: "china", label: "China" },
];

export function HeaderBar() {
  const isAuth = useIsAuthenticated();
  const { accounts, inProgress } = useMsal();
  const displayName = accounts[0]?.name;
  const isLoading = inProgress !== InteractionStatus.None;

  const [cloudOpen, setCloudOpen] = useState(false);
  const [cloudEnv, setCloudEnv] = useState<CloudEnvironment>("global");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCloudEnv(getSelectedCloudEnvironment());
  }, []);

  useEffect(() => {
    if (!cloudOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setCloudOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [cloudOpen]);

  const handleCloudChange = useCallback((env: CloudEnvironment) => {
    setSelectedCloudEnvironment(env);
    setCloudEnv(env);
    setCloudOpen(false);
    window.location.reload();
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-deep px-4 sm:px-5">
      {/* Left: Title */}
      <a href="/" className="flex items-center" aria-label="Home">
        <span className="font-sans text-lg font-bold tracking-tight text-text-primary">
          Graph Explorer<span className="text-accent">+</span>
        </span>
      </a>

      <div className="flex-1" />

      {/* Right actions — all buttons are 36px min touch targets */}
      <div className="flex items-center gap-1">
        {/* Cloud env */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setCloudOpen((o) => !o)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            aria-label="Cloud environment"
            aria-expanded={cloudOpen}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 5.29 2H6.71A8 8 0 0 1 12 4ZM4 12a8 8 0 0 1 .34-2.3h15.32A8 8 0 0 1 20 12a8 8 0 0 1-.34 2.3H4.34A8 8 0 0 1 4 12Zm2.71 6h10.58A8 8 0 0 1 12 20a8 8 0 0 1-5.29-2Z" fill="currentColor" opacity="0.5" />
            </svg>
            {CLOUD_OPTIONS.find((o) => o.id === cloudEnv)?.label ?? "Global"}
          </button>

          {cloudOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border-default bg-bg-elevated shadow-2xl">
              <div className="p-1.5">
                {CLOUD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleCloudChange(opt.id)}
                    className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-3 text-left text-xs font-medium transition-colors ${
                      cloudEnv === opt.id
                        ? "bg-accent-muted text-accent"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cloudEnv === opt.id ? "bg-accent" : "bg-text-muted"}`} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        <div className="mx-1 h-5 w-px bg-border-subtle" aria-hidden="true" />

        {isLoading ? (
          <span className="px-3 text-xs text-text-muted">Signing in...</span>
        ) : isAuth ? (
          <div className="flex items-center gap-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent">
              {getInitials(displayName)}
            </span>
            <button
              onClick={() => void signOut()}
              className="flex h-9 items-center rounded-lg px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => void signIn()}
            className="flex h-9 items-center gap-2 rounded-lg bg-accent/10 px-4 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
