import { type Configuration, LogLevel, PublicClientApplication } from "@azure/msal-browser";
import { env } from "~/env";

export type CloudEnvironment = "global" | "usgov" | "usgovdod" | "germany" | "china";

// Graph Explorer needs broad scopes for testing APIs
export const DEFAULT_SCOPES = [
  "User.Read",
  "openid",
  "profile",
  "email",
];

export const CLOUD_ENVIRONMENTS: Record<CloudEnvironment, { authority: string; graphEndpoint: string }> = {
  global: {
    authority: "https://login.microsoftonline.com",
    graphEndpoint: "https://graph.microsoft.com",
  },
  usgov: {
    authority: "https://login.microsoftonline.us",
    graphEndpoint: "https://graph.microsoft.us",
  },
  usgovdod: {
    authority: "https://login.microsoftonline.us",
    graphEndpoint: "https://dod-graph.microsoft.us",
  },
  germany: {
    authority: "https://login.microsoftonline.de",
    graphEndpoint: "https://graph.microsoft.de",
  },
  china: {
    authority: "https://login.chinacloudapi.cn",
    graphEndpoint: "https://microsoftgraph.chinacloudapi.cn",
  },
};

/** Map cloud environment → optional per-cloud client ID env var. */
function getClientIdForCloud(cloud: CloudEnvironment): string | undefined {
  switch (cloud) {
    case "global":
      return env.NEXT_PUBLIC_MSAL_CLIENT_ID;
    case "usgov":
      return env.NEXT_PUBLIC_MSAL_CLIENT_ID_USGOV ?? undefined;
    case "usgovdod":
      return env.NEXT_PUBLIC_MSAL_CLIENT_ID_USGOVDOD ?? undefined;
    case "germany":
      return env.NEXT_PUBLIC_MSAL_CLIENT_ID_GERMANY ?? undefined;
    case "china":
      return env.NEXT_PUBLIC_MSAL_CLIENT_ID_CHINA ?? undefined;
  }
}

/** Check whether the app is configured for a given cloud. */
export function isCloudConfigured(cloud: CloudEnvironment): boolean {
  return !!getClientIdForCloud(cloud);
}

export function getGraphEndpoint(environment: CloudEnvironment = "global"): string {
  return CLOUD_ENVIRONMENTS[environment].graphEndpoint;
}

export function getAuthorityUrl(
  environment: CloudEnvironment = "global",
  tenantId: string = "common"
): string {
  return `${CLOUD_ENVIRONMENTS[environment].authority}/${tenantId}`;
}

const redirectUri =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

function buildMsalConfig(clientId: string, authority: string): Configuration {
  return {
    auth: {
      clientId,
      authority,
      redirectUri: env.NEXT_PUBLIC_MSAL_REDIRECT_URI ?? redirectUri,
      postLogoutRedirectUri: env.NEXT_PUBLIC_MSAL_REDIRECT_URI ?? redirectUri,
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              return;
            case LogLevel.Warning:
              console.warn(message);
              return;
            default:
              return;
          }
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Per-cloud MSAL instance cache
// ---------------------------------------------------------------------------
const msalInstances = new Map<CloudEnvironment, PublicClientApplication>();
const msalInitStates = new Map<CloudEnvironment, Promise<void>>();

/** Default (global) instance — used for backwards compatibility. */
export const msalInstance = new PublicClientApplication(
  buildMsalConfig(
    env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    env.NEXT_PUBLIC_MSAL_AUTHORITY ?? "https://login.microsoftonline.com/common",
  ),
);
msalInstances.set("global", msalInstance);

/**
 * Get the MSAL instance for a specific cloud environment.
 * Creates and caches instances lazily.
 * @throws Error if no client ID is configured for the requested cloud.
 */
export function getMsalInstance(cloud: CloudEnvironment): PublicClientApplication {
  const cached = msalInstances.get(cloud);
  if (cached) return cached;

  const clientId = getClientIdForCloud(cloud);
  if (!clientId) {
    throw new Error(
      `No app registration configured for ${cloud}. Set NEXT_PUBLIC_MSAL_CLIENT_ID_${cloud.toUpperCase()} in your environment.`,
    );
  }

  const authority = `${CLOUD_ENVIRONMENTS[cloud].authority}/common`;
  const instance = new PublicClientApplication(buildMsalConfig(clientId, authority));
  msalInstances.set(cloud, instance);
  return instance;
}

export const loginRequest = {
  scopes: DEFAULT_SCOPES,
};

let msalInitialized = false;
let msalInitPromise: Promise<void> | null = null;

export async function initializeMsal(): Promise<void> {
  if (msalInitialized) return;
  if (msalInitPromise) return msalInitPromise;

  msalInitPromise = msalInstance.initialize().then(() => {
    msalInitialized = true;
  });

  return msalInitPromise;
}

/** Initialize the MSAL instance for a specific cloud (called before sign-in). */
export async function initializeMsalForCloud(cloud: CloudEnvironment): Promise<void> {
  const instance = getMsalInstance(cloud);
  const existing = msalInitStates.get(cloud);
  if (existing) return existing;

  const promise = instance.initialize();
  msalInitStates.set(cloud, promise);
  return promise;
}
