"use client";

import { useState, useCallback, useEffect } from "react";
import { getAccessToken, isAuthenticated } from "~/lib/auth/authUtils";
import { CopyButton } from "~/components/copy-button";
import { decodeJwtPayload } from "~/lib/auth/jwt-utils";

function formatExpiry(exp: number): string {
  const date = new Date(exp * 1000);
  const now = Date.now();
  const remaining = date.getTime() - now;
  if (remaining <= 0) return "Expired";
  const mins = Math.floor(remaining / 60000);
  if (mins < 60) return `${mins}m remaining`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m remaining`;
}

export function AccessTokenViewer() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDecoded, setShowDecoded] = useState(false);

  const fetchToken = useCallback(async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const t = await getAccessToken();
      setToken(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to acquire token");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchToken();
  }, [fetchToken]);

  if (!isAuthenticated()) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-text-secondary">Sign in to view your access token.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="skeleton mb-3 h-4 w-48" />
        <div className="skeleton h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-error">{error}</p>
      </div>
    );
  }

  if (!token) return null;

  const decoded = decodeJwtPayload(token);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5">
        <span className="text-xs font-medium text-text-primary">Access token</span>

        <CopyButton text={token} className="ml-auto" />

        <button
          onClick={() => setShowDecoded((v) => !v)}
          title={showDecoded ? "Show raw token" : "Decode token (JSON)"}
          aria-label={showDecoded ? "Show raw token" : "Decode token (JSON)"}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            showDecoded
              ? "bg-accent-muted text-accent"
              : "text-text-tertiary hover:bg-bg-hover hover:text-text-primary"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5a2 2 0 002 2h1" />
            <path d="M16 3h1a2 2 0 012 2v5a2 2 0 002 2 2 2 0 00-2 2v5a2 2 0 01-2 2h-1" />
          </svg>
        </button>

        <button
          onClick={() => void fetchToken()}
          title="Refresh token"
          aria-label="Refresh token"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>

      {/* Token expiry info */}
      {typeof decoded?.exp === "number" && (
        <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-[11px] text-text-tertiary">
            Expires: {new Date(decoded.exp * 1000).toLocaleString()} ({formatExpiry(decoded.exp)})
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4">
        {showDecoded && decoded ? (
          <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-text-primary">
            {JSON.stringify(decoded, null, 2)}
          </pre>
        ) : (
          <p className="break-all font-mono text-xs leading-relaxed text-text-primary select-all">
            {token}
          </p>
        )}
      </div>
    </div>
  );
}
