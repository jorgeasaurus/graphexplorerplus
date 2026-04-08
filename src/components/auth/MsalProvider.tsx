"use client";

import { MsalProvider as BaseMsalProvider } from "@azure/msal-react";
import { msalInstance, initializeMsal } from "~/lib/auth/msalConfig";
import { loadCloudEnvironmentFromSession } from "~/lib/auth/authUtils";
import { useEffect, useState, useCallback } from "react";

interface MsalProviderProps {
  children: React.ReactNode;
}

export function MsalProvider({ children }: MsalProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(() => {
    setError(null);
    loadCloudEnvironmentFromSession();

    initializeMsal()
      .then(() => setIsInitialized(true))
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "MSAL initialization failed";
        console.error("[MSAL] Failed to initialize:", err);
        setError(message);
      });
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-deep">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-semibold text-text-primary">
            Authentication Error
          </h2>
          <p className="mb-4 text-sm text-text-muted">{error}</p>
          <button
            onClick={initialize}
            className="rounded-md bg-accent-muted px-4 py-2 text-sm font-medium text-accent hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) return null;

  return <BaseMsalProvider instance={msalInstance}>{children}</BaseMsalProvider>;
}
