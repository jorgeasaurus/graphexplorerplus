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

export function getGraphEndpoint(environment: CloudEnvironment = "global"): string {
  return CLOUD_ENVIRONMENTS[environment].graphEndpoint;
}

export function getAuthorityUrl(
  environment: CloudEnvironment = "global",
  tenantId: string = "common"
): string {
  return `${CLOUD_ENVIRONMENTS[environment].authority}/${tenantId}`;
}

export const msalConfig: Configuration = {
  auth: {
    clientId: env.NEXT_PUBLIC_MSAL_CLIENT_ID,
    authority:
      env.NEXT_PUBLIC_MSAL_AUTHORITY ??
      "https://login.microsoftonline.com/common",
    redirectUri:
      env.NEXT_PUBLIC_MSAL_REDIRECT_URI ??
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
    postLogoutRedirectUri:
      env.NEXT_PUBLIC_MSAL_REDIRECT_URI ??
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
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

export const loginRequest = {
  scopes: DEFAULT_SCOPES,
};

export const msalInstance = new PublicClientApplication(msalConfig);

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
