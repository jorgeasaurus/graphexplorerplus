"use client";

import { useState, useMemo } from "react";
import { consentToScopes } from "~/lib/auth/authUtils";
import { loadPermissions, lookupPermissions } from "~/lib/data/permissions";

interface ConsentBannerProps {
  status: number;
  body: string;
  method: string;
  url: string;
  onRetry: () => void;
}

// Extract scope names from common Graph API error message patterns
function parseScopesFromError(body: string): string[] {
  const scopes: string[] = [];

  // Pattern: "must have one of the following scopes: X, Y, Z"
  const scopeListMatch = body.match(
    /(?:following\s+scopes?|required\s+scopes?|one\s+of\s+the\s+following\s+scopes?):\s*([A-Za-z0-9._,\s-]+?)(?:\s*[-–—]|\s*\.(?:\s|$)|\s*$)/i,
  );
  if (scopeListMatch?.[1]) {
    const candidates = scopeListMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
    for (const c of candidates) {
      if (/^[A-Za-z][A-Za-z0-9._-]+\.[A-Za-z]+$/.test(c)) {
        scopes.push(c);
      }
    }
  }

  // Pattern: "API required scopes: X,Y,Z" (comma-separated, no spaces)
  const apiRequiredMatch = body.match(
    /API\s+required\s+scopes?:\s*([A-Za-z0-9._,\s-]+?)(?:,\s*application\s+scopes|[.]\s|$)/i,
  );
  if (apiRequiredMatch?.[1] && scopes.length === 0) {
    const candidates = apiRequiredMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
    for (const c of candidates) {
      if (/^[A-Za-z][A-Za-z0-9._-]+\.[A-Za-z]+$/.test(c)) {
        scopes.push(c);
      }
    }
  }

  // Pattern: individual scope references like "Scope: Mail.Read"
  const singleMatch = body.match(/(?:Required\s+scope|Scope):\s*([A-Za-z][A-Za-z0-9._-]+\.[A-Za-z]+)/i);
  if (singleMatch?.[1] && !scopes.includes(singleMatch[1])) {
    scopes.push(singleMatch[1]);
  }

  return scopes;
}

function extractGraphPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/(v1\.0|beta)/, "");
  } catch {
    const path = url.startsWith("/") ? url : `/${url}`;
    return path.replace(/^\/(v1\.0|beta)/, "");
  }
}

export function ConsentBanner({ status, body, method, url, onRetry }: ConsentBannerProps) {
  const [consenting, setConsenting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);

  // Parse scopes from the error, and also look up known scopes for this endpoint
  const { errorScopes, knownScopes } = useMemo(() => {
    const fromError = parseScopesFromError(body);

    // Also try to resolve from our permissions index (async, but we use cached data)
    let fromIndex: string[] = [];
    const path = extractGraphPath(url);
    // loadPermissions returns cached data synchronously if already loaded
    void loadPermissions().then((index) => {
      const perms = lookupPermissions(index, method, path);
      if (perms?.delegatedWork) {
        fromIndex = perms.delegatedWork;
      }
    });

    return { errorScopes: fromError, knownScopes: fromIndex };
  }, [body, method, url]);

  // Don't render if not a 403
  if (status !== 403) return null;

  // Combine scopes: prefer error-parsed scopes (more specific), fall back to index
  const displayScopes = errorScopes.length > 0 ? errorScopes : knownScopes;

  const handleConsent = async () => {
    if (displayScopes.length === 0) return;
    setConsenting(true);
    setConsentError(null);
    try {
      await consentToScopes(displayScopes);
      setConsented(true);
    } catch (err) {
      setConsentError(err instanceof Error ? err.message : "Consent failed");
    } finally {
      setConsenting(false);
    }
  };

  const handleConsentAndRetry = async () => {
    if (displayScopes.length === 0) return;
    setConsenting(true);
    setConsentError(null);
    try {
      await consentToScopes(displayScopes);
      setConsented(true);
      onRetry();
    } catch (err) {
      setConsentError(err instanceof Error ? err.message : "Consent failed");
    } finally {
      setConsenting(false);
    }
  };

  return (
    <div className="border-b border-warning/20 bg-warning/5 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        {/* Shield icon */}
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="mt-0.5 shrink-0 text-warning"
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8v4M12 16h.01"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-warning">
            Insufficient permissions
          </p>

          {displayScopes.length > 0 ? (
            <>
              <p className="mt-1 text-[11px] text-text-secondary">
                This endpoint requires one of these scopes:
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {displayScopes.map((scope) => (
                  <span
                    key={scope}
                    className="rounded bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] leading-none text-warning"
                  >
                    {scope}
                  </span>
                ))}
              </div>

              {consentError && (
                <p className="mt-1.5 text-[11px] text-error">{consentError}</p>
              )}

              <div className="mt-2 flex items-center gap-2">
                {!consented ? (
                  <>
                    <button
                      onClick={() => void handleConsentAndRetry()}
                      disabled={consenting}
                      className="rounded bg-warning/15 px-3 py-1 text-[11px] font-medium text-warning transition-colors hover:bg-warning/25 disabled:opacity-60"
                    >
                      {consenting ? "Consenting\u2026" : "Consent & Retry"}
                    </button>
                    <button
                      onClick={() => void handleConsent()}
                      disabled={consenting}
                      className="rounded px-3 py-1 text-[11px] text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-secondary disabled:opacity-60"
                    >
                      Consent Only
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-success">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[11px] text-success">Consent granted</span>
                    <button
                      onClick={onRetry}
                      className="ml-1 rounded bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20"
                    >
                      Retry Request
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="mt-1 text-[11px] text-text-secondary">
              The required scopes could not be parsed from the error. Check the response body for details, then use the Azure portal to grant the necessary permissions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
