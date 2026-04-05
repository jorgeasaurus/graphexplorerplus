"use client";

import { MsalProvider as BaseMsalProvider } from "@azure/msal-react";
import { msalInstance, initializeMsal } from "~/lib/auth/msalConfig";
import { loadCloudEnvironmentFromSession } from "~/lib/auth/authUtils";
import { useEffect, useState } from "react";

interface MsalProviderProps {
  children: React.ReactNode;
}

export function MsalProvider({ children }: MsalProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Restore persisted cloud environment before MSAL init
    loadCloudEnvironmentFromSession();

    initializeMsal()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error("[MSAL] Failed to initialize:", error);
        setIsInitialized(true);
      });
  }, []);

  if (!isInitialized) return null;

  return <BaseMsalProvider instance={msalInstance}>{children}</BaseMsalProvider>;
}
