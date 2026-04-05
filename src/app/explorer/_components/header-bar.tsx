"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { signIn, signOut, setSelectedCloudEnvironment, getSelectedCloudEnvironment } from "~/lib/auth/authUtils";
import { type CloudEnvironment } from "~/lib/auth/msalConfig";

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const CLOUD_OPTIONS: { id: CloudEnvironment; label: string; desc: string }[] = [
  { id: "global", label: "Global", desc: "Commercial cloud" },
  { id: "usgov", label: "US Gov", desc: "GCC High" },
  { id: "usgovdod", label: "US Gov DoD", desc: "DoD cloud" },
  { id: "germany", label: "Germany", desc: "Sovereign cloud" },
  { id: "china", label: "China", desc: "21Vianet" },
];

export function HeaderBar() {
  const isAuth = useIsAuthenticated();
  const { accounts, inProgress } = useMsal();
  const displayName = accounts[0]?.name;
  const isLoading = inProgress !== InteractionStatus.None;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cloudEnv, setCloudEnv] = useState<CloudEnvironment>("global");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCloudEnv(getSelectedCloudEnvironment());
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  const handleCloudChange = useCallback((env: CloudEnvironment) => {
    setSelectedCloudEnvironment(env);
    setCloudEnv(env);
    setSettingsOpen(false);
    window.location.reload();
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-deep px-4">
      {/* Left: Logo */}
      <a href="/" className="flex items-center gap-2" aria-label="Graph Explorer Plus home">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-accent"
          aria-hidden="true"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-sans text-sm font-bold tracking-tight text-accent">
          Graph Explorer<span className="text-text-secondary">+</span>
        </span>
      </a>

      {/* Center: empty for now */}
      <div className="flex-1" />

      {/* Right: Settings + User */}
      <div className="flex items-center gap-3">
        {/* Settings dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors focus-visible:ring-1 focus-visible:ring-accent ${
              settingsOpen
                ? "bg-bg-hover text-text-primary"
                : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
            }`}
            aria-label="Settings"
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          {settingsOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-lg border border-border-default bg-bg-elevated shadow-xl"
            >
              <div className="border-b border-border-subtle px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted">
                  Cloud Environment
                </p>
              </div>
              <div className="p-1">
                {CLOUD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    role="menuitem"
                    onClick={() => handleCloudChange(opt.id)}
                    className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors focus-visible:ring-1 focus-visible:ring-accent ${
                      cloudEnv === opt.id
                        ? "bg-accent/10 text-accent"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        cloudEnv === opt.id ? "bg-accent" : "bg-text-muted"
                      }`}
                    />
                    <span className="flex flex-col">
                      <span className="text-xs font-medium">{opt.label}</span>
                      <span className="text-[10px] text-text-muted">{opt.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border-subtle px-3 py-2">
                <span className="text-[10px] text-text-muted">v0.1.0</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-border-subtle" aria-hidden="true" />

        {isLoading ? (
          <span className="text-xs text-text-muted">Signing in…</span>
        ) : isAuth ? (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
              {getInitials(displayName)}
            </span>
            <span className="text-xs text-text-secondary">{displayName}</span>
            <button
              onClick={() => void signOut()}
              className="flex h-7 items-center rounded px-2 text-xs text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:ring-1 focus-visible:ring-accent"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => void signIn()}
            className="flex h-7 items-center gap-2 rounded px-2 text-xs text-accent transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:ring-1 focus-visible:ring-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
