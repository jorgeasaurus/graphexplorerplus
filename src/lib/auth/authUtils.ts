import { type AccountInfo, InteractionRequiredAuthError, BrowserAuthError } from "@azure/msal-browser";
import { msalInstance, loginRequest, getAuthorityUrl, CLOUD_ENVIRONMENTS, type CloudEnvironment } from "./msalConfig";

let selectedCloudEnvironment: CloudEnvironment = "global";

export function getSelectedCloudEnvironment(): CloudEnvironment {
  return selectedCloudEnvironment;
}

export function setSelectedCloudEnvironment(environment: CloudEnvironment): void {
  selectedCloudEnvironment = environment;
  if (typeof window !== "undefined") {
    sessionStorage.setItem("cloudEnvironment", environment);
  }
}

export function loadCloudEnvironmentFromSession(): CloudEnvironment {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("cloudEnvironment");
    if (stored && stored in CLOUD_ENVIRONMENTS) {
      selectedCloudEnvironment = stored as CloudEnvironment;
    }
  }
  return selectedCloudEnvironment;
}

export function getActiveAccount(): AccountInfo | null {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0]! : null;
}

export class AuthSessionExpiredError extends Error {
  constructor(message = "No active account found. Please sign in.") {
    super(message);
    this.name = "AuthSessionExpiredError";
  }
}

export async function getAccessToken(scopes?: string[]): Promise<string> {
  const account = getActiveAccount();
  if (!account) throw new AuthSessionExpiredError();

  const authority = getAuthorityUrl(selectedCloudEnvironment, account.tenantId);
  const tokenRequest = {
    scopes: scopes || loginRequest.scopes,
    account,
    authority,
  };

  try {
    const response = await msalInstance.acquireTokenSilent(tokenRequest);
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError || error instanceof BrowserAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup({
          scopes: scopes || loginRequest.scopes,
          authority,
        });
        return response.accessToken;
      } catch {
        throw new AuthSessionExpiredError("Session expired. Please sign out and sign in again.");
      }
    }
    throw error;
  }
}

/**
 * Trigger incremental consent for additional scopes via popup.
 */
export async function consentToScopes(scopes: string[]): Promise<string> {
  const account = getActiveAccount();
  if (!account) throw new AuthSessionExpiredError();

  const authority = getAuthorityUrl(selectedCloudEnvironment, account.tenantId);
  const response = await msalInstance.acquireTokenPopup({
    scopes,
    account,
    authority,
    prompt: "consent",
  });
  return response.accessToken;
}

export async function signIn(): Promise<AccountInfo> {
  setSelectedCloudEnvironment("global");
  const authority = getAuthorityUrl("global", "common");
  const response = await msalInstance.loginPopup({
    ...loginRequest,
    authority,
  });
  if (response.account) {
    msalInstance.setActiveAccount(response.account);
    return response.account;
  }
  throw new Error("Sign in failed: No account returned");
}

export async function signOut(): Promise<void> {
  const account = getActiveAccount();
  if (account) {
    await msalInstance.logoutPopup({ account });
  }
}

export function isAuthenticated(): boolean {
  return getActiveAccount() !== null;
}
