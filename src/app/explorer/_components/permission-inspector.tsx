"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  loadPermissions,
  lookupPermissions,
  type EndpointPermissions,
} from "~/lib/data/permissions";

interface PermissionInspectorProps {
  method: string;
  url: string;
}

function extractPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    // Not a full URL — treat as relative path
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function stripGraphPrefix(path: string): string {
  return path.replace(/^\/(v1\.0|beta)/, "");
}

const PILL_LIMIT = 4;

function PermissionPills({
  label,
  scopes,
  pillClass,
}: {
  label: string;
  scopes: string[];
  pillClass: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? scopes : scopes.slice(0, PILL_LIMIT);
  const overflow = scopes.length - PILL_LIMIT;

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span className="font-mono text-[10px] text-text-tertiary">{label}</span>
      {visible.map((s) => (
        <span key={s} className={`rounded px-1.5 py-0.5 font-mono text-[10px] leading-none ${pillClass}`}>
          {s}
        </span>
      ))}
      {!expanded && overflow > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="rounded px-1.5 py-0.5 font-mono text-[10px] leading-none text-text-muted hover:text-text-secondary"
        >
          +{overflow} more
        </button>
      )}
    </span>
  );
}

export function PermissionInspector({ method, url }: PermissionInspectorProps) {
  const [perms, setPerms] = useState<EndpointPermissions | null | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lookup = useCallback(async (m: string, u: string) => {
    const index = await loadPermissions();
    const path = stripGraphPrefix(extractPath(u));
    setPerms(lookupPermissions(index, m, path));
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void lookup(method, url);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [method, url, lookup]);

  const hasDelegated = perms?.delegatedWork && perms.delegatedWork.length > 0;
  const hasApp = perms?.application && perms.application.length > 0;
  const found = hasDelegated || hasApp;

  return (
    <div className="flex min-h-[28px] items-center gap-2 border-b border-border-subtle bg-bg-deep px-3 py-1">
      {/* Lock icon */}
      <svg
        aria-hidden="true"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-text-muted"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {perms === undefined ? (
        <span className="font-mono text-[10px] text-text-muted">Loading permissions…</span>
      ) : !found ? (
        <span className="font-mono text-[10px] text-text-muted">
          Permissions: Not available for this endpoint
        </span>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {hasDelegated && (
            <PermissionPills
              label="Delegated:"
              scopes={perms!.delegatedWork!}
              pillClass="bg-accent-subtle text-accent"
            />
          )}
          {hasApp && (
            <PermissionPills
              label="Application:"
              scopes={perms!.application!}
              pillClass="bg-bg-elevated text-text-secondary"
            />
          )}
        </div>
      )}
    </div>
  );
}
