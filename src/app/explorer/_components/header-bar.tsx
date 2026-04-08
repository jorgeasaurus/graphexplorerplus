"use client";

import { type ReactNode, useState, useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { signIn, signOut, getSelectedCloudEnvironment, loadCloudEnvironmentFromSession } from "~/lib/auth/authUtils";
import { type CloudEnvironment } from "~/lib/auth/msalConfig";
import { ThemeToggle } from "~/components/theme-toggle";
import { CloudEnvironmentDialog } from "./cloud-environment-dialog";

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const CLOUD_LABELS: Record<CloudEnvironment, string> = {
  global: "Commercial",
  usgov: "GCC High",
  usgovdod: "DoD",
  germany: "Germany",
  china: "China",
};

export function HeaderBar() {
  const isAuth = useIsAuthenticated();
  const { accounts, inProgress } = useMsal();
  const displayName = accounts[0]?.name;
  const isLoading = inProgress !== InteractionStatus.None;

  const [showCloudDialog, setShowCloudDialog] = useState(false);
  const [cloudEnv, setCloudEnv] = useState<CloudEnvironment>("global");

  useEffect(() => {
    setCloudEnv(loadCloudEnvironmentFromSession());
  }, []);

  // Sync cloud env state after auth completes
  useEffect(() => {
    if (isAuth) {
      setCloudEnv(getSelectedCloudEnvironment());
    }
  }, [isAuth]);

  const handleSignInClick = () => {
    setShowCloudDialog(true);
  };

  const handleCloudSelect = async (env: CloudEnvironment) => {
    setShowCloudDialog(false);
    try {
      await signIn(env);
      setCloudEnv(env);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  let authContent: ReactNode;
  if (isLoading) {
    authContent = <span className="px-3 text-xs text-text-muted">Signing in...</span>;
  } else if (isAuth) {
    authContent = (
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
    );
  } else {
    authContent = (
      <button
        onClick={handleSignInClick}
        className="flex h-9 items-center gap-2 rounded-lg bg-accent/10 px-4 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
      >
        Sign In
      </button>
    );
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-deep px-4 sm:px-5">
        <a href="/" className="flex items-center" aria-label="Home">
          <span className="font-sans text-lg font-bold tracking-tight text-text-primary">
            Graph Explorer<span className="text-accent">+</span>
          </span>
        </a>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          {/* Cloud environment badge (read-only, shows connected cloud) */}
          {isAuth && (
            <div className="flex items-center gap-1.5 rounded-lg bg-accent/5 px-3 py-1.5 border border-accent/15">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                {CLOUD_LABELS[cloudEnv]}
              </span>
            </div>
          )}

          <ThemeToggle />

          <div className="mx-1 h-5 w-px bg-border-subtle" aria-hidden="true" />

          {authContent}
        </div>
      </header>

      <CloudEnvironmentDialog
        open={showCloudDialog}
        onSelect={(env) => void handleCloudSelect(env)}
        onCancel={() => setShowCloudDialog(false)}
      />
    </>
  );
}
