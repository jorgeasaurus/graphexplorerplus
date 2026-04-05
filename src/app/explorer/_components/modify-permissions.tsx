"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  loadPermissions,
  lookupPermissions,
  type EndpointPermissions,
} from "~/lib/data/permissions";
import { getAccessToken, consentToScopes, isAuthenticated } from "~/lib/auth/authUtils";

// ─── Scope Descriptions ──────────────────────────────────────────────

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  "Directory.ReadWrite.All":
    "Allows the app to read and write data in your organization's directory, such as users and groups. It does not allow the app to delete users or groups, or reset user passwords.",
  "Directory.Read.All":
    "Allows the app to read data in your organization's directory, such as users, groups and apps.",
  "User.Read":
    "Allows the app to read your profile, and discover your group membership, reports and manager.",
  "User.Read.All":
    "Allows the app to read the full set of profile properties, reports, and managers of other users in your organization, on your behalf.",
  "User.ReadBasic.All":
    "Allows the app to read a basic set of profile properties of other users in your organization on your behalf. Includes display name, first and last name, email address, photo, id and security identifier. Also allows the app to read the full profile of the signed-in user.",
  "User.ReadWrite":
    "Allows the app to read your profile, and discover your group membership, reports and manager. It also allows the app to update your profile information on your behalf.",
  "User.ReadWrite.All":
    "Allows the app to read and write the full set of profile properties, reports, and managers of other users in your organization, on your behalf.",
  "Mail.Read":
    "Allows the app to read email in your mailbox.",
  "Mail.ReadWrite":
    "Allows the app to create, read, update, and delete email in your mailbox. Does not include permission to send mail.",
  "Mail.Send":
    "Allows the app to send mail as you.",
  "Calendars.Read":
    "Allows the app to read events in your calendars.",
  "Calendars.ReadWrite":
    "Allows the app to create, read, update, and delete events in your calendars.",
  "Contacts.Read":
    "Allows the app to read your contacts.",
  "Contacts.ReadWrite":
    "Allows the app to create, read, update, and delete your contacts.",
  "Files.Read":
    "Allows the app to read your files.",
  "Files.Read.All":
    "Allows the app to read all files you can access.",
  "Files.ReadWrite":
    "Allows the app to read, create, update and delete your files.",
  "Files.ReadWrite.All":
    "Allows the app to read, create, update, and delete all files you can access.",
  "Group.Read.All":
    "Allows the app to list groups, and to read their properties and all group memberships on your behalf.",
  "Group.ReadWrite.All":
    "Allows the app to create groups and read all group properties and memberships on your behalf. Additionally allows group owners to manage their groups and allows group members to update group content.",
  "Sites.Read.All":
    "Allows the app to read documents and list items in all site collections on your behalf.",
  "Sites.ReadWrite.All":
    "Allows the app to edit or delete documents and list items in all site collections on your behalf.",
  "People.Read":
    "Allows the app to read a scored list of people relevant to you.",
  "Tasks.Read":
    "Allows the app to read your tasks and task lists, including any shared with you.",
  "Tasks.ReadWrite":
    "Allows the app to create, read, update and delete your tasks and task lists, including any shared with you.",
  "Notes.Read":
    "Allows the app to read OneNote notebooks on your behalf.",
  "Notes.ReadWrite":
    "Allows the app to read, share, and modify OneNote notebooks on your behalf.",
  "ChannelMessage.Read.All":
    "Allows the app to read channel messages in Microsoft Teams, on your behalf.",
  "ChannelMessage.Send":
    "Allows the app to send channel messages in Microsoft Teams, on your behalf.",
  "Chat.Read":
    "Allows the app to read your 1:1 or group chat messages in Microsoft Teams, on your behalf.",
  "Chat.ReadWrite":
    "Allows the app to read and send your 1:1 or group chat messages in Microsoft Teams, on your behalf.",
  "TeamSettings.Read.All":
    "Read the names, descriptions, and settings of all teams, on your behalf.",
  "TeamSettings.ReadWrite.All":
    "Read and change the names, descriptions, and settings of all teams, on your behalf.",
  "DeviceManagementManagedDevices.Read.All":
    "Allows the app to read the properties of devices managed through Microsoft Intune.",
  "DeviceManagementManagedDevices.ReadWrite.All":
    "Allows the app to read and write the properties of devices managed through Microsoft Intune.",
  "DeviceManagementConfiguration.Read.All":
    "Allows the app to read properties of Microsoft Intune-managed device configuration and device compliance policies and their assignment to groups.",
  "DeviceManagementConfiguration.ReadWrite.All":
    "Allows the app to read and write properties of Microsoft Intune-managed device configuration and device compliance policies and their assignment to groups.",
  "DeviceManagementApps.Read.All":
    "Allows the app to read the properties, group assignments and status of apps, app configurations and app protection policies managed by Microsoft Intune.",
  "DeviceManagementApps.ReadWrite.All":
    "Allows the app to read and write the properties, group assignments and status of apps, app configurations and app protection policies managed by Microsoft Intune.",
  "DeviceManagementServiceConfig.Read.All":
    "Allows the app to read Intune service properties including device enrollment and third party service connection configuration.",
  "DeviceManagementServiceConfig.ReadWrite.All":
    "Allows the app to read and write Intune service properties including device enrollment and third party service connection configuration.",
  "DeviceManagementRBAC.Read.All":
    "Allows the app to read the properties relating to the Microsoft Intune Role-Based Access Control (RBAC) settings.",
  "DeviceManagementRBAC.ReadWrite.All":
    "Allows the app to read and write the properties relating to the Microsoft Intune Role-Based Access Control (RBAC) settings.",
  "Application.Read.All":
    "Allows the app to read applications and service principals in your organization.",
  "Application.ReadWrite.All":
    "Allows the app to create, read, update, and delete applications and service principals.",
  "AuditLog.Read.All":
    "Allows the app to read audit log data.",
  "SecurityEvents.Read.All":
    "Allows the app to read your organization's security events.",
  "SecurityEvents.ReadWrite.All":
    "Allows the app to read and update your organization's security events.",
  "openid": "Allows you to sign in to the app with your work or school account.",
  "profile": "Allows the app to see your basic profile.",
  "email": "Allows the app to read your email address.",
  "offline_access": "Allows the app to have long-term access to your data.",
  "Presence.Read": "Allows the app to read your presence information.",
  "Presence.Read.All": "Allows the app to read presence information of all users in the directory.",
  "OnlineMeetings.Read": "Allows the app to read online meeting details on your behalf.",
  "OnlineMeetings.ReadWrite": "Allows the app to create, read, update and delete online meetings on your behalf.",
  "Policy.Read.All": "Allows the app to read your organization's policies.",
  "Policy.ReadWrite.ConditionalAccess": "Allows the app to read and write conditional access policies on your behalf.",
  "IdentityRiskEvent.Read.All": "Allows the app to read identity risk event information.",
  "IdentityRiskyUser.Read.All": "Allows the app to read identity risky user information.",
  "Reports.Read.All": "Allows the app to read all service usage reports.",
  "Bookmark.Read.All": "Allows the app to read all bookmarks.",
  "Place.Read.All": "Allows the app to read meeting room information.",
};

function getDescription(scope: string): string {
  return SCOPE_DESCRIPTIONS[scope] ?? "Allows the app to access this resource on your behalf.";
}

// ─── Helpers ─────────────────────────────────────────────────────────

function extractPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function stripGraphPrefix(path: string): string {
  return path.replace(/^\/(v1\.0|beta)/, "");
}

function decodeTokenScopes(token: string): Set<string> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return new Set();
    const payload = JSON.parse(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"))) as Record<string, unknown>;
    const scp = payload.scp as string | undefined;
    if (!scp) return new Set();
    return new Set(scp.split(" ").map((s) => s.trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

// ─── Component ───────────────────────────────────────────────────────

interface ModifyPermissionsProps {
  method: string;
  url: string;
}

export function ModifyPermissions({ method, url }: ModifyPermissionsProps) {
  const [perms, setPerms] = useState<EndpointPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [consentedScopes, setConsentedScopes] = useState<Set<string>>(new Set());
  const [consentingScope, setConsentingScope] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshConsentedScopes = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const token = await getAccessToken();
      setConsentedScopes(decodeTokenScopes(token));
    } catch {
      // Token fetch failed — leave as empty
    }
  }, []);

  // Look up permissions for current endpoint
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const index = await loadPermissions();
        const path = stripGraphPrefix(extractPath(url));
        const result = lookupPermissions(index, method, path);
        setPerms(result);
      } catch {
        setPerms(null);
      }
      setLoading(false);
    }, 200);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [method, url]);

  // Refresh consented scopes on mount and when URL changes
  useEffect(() => {
    void refreshConsentedScopes();
  }, [refreshConsentedScopes, url]);

  const handleConsent = async (scope: string) => {
    setConsentingScope(scope);
    try {
      await consentToScopes([scope]);
      await refreshConsentedScopes();
    } catch {
      // Consent popup was closed or failed
    }
    setConsentingScope(null);
  };

  if (!isAuthenticated()) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-text-secondary">Sign in to view and modify permissions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="skeleton mb-3 h-4 w-72" />
        <div className="space-y-2">
          {[...Array(4) as undefined[]].map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const delegated = perms?.delegatedWork ?? [];
  const application = perms?.application ?? [];
  const allScopes = [...new Set([...delegated, ...application])];

  if (allScopes.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-text-secondary">No permissions data available for this endpoint.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs text-text-secondary">
          One of the following permissions is required to run the query. If possible, consent to the least privileged.
        </p>
      </div>

      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border-subtle text-text-tertiary">
            <th className="px-4 py-2 font-medium">Permission</th>
            <th className="hidden px-4 py-2 font-medium md:table-cell">Description</th>
            <th className="px-4 py-2 text-center font-medium">Consented</th>
            <th className="px-4 py-2 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {allScopes.map((scope) => {
            const consented = consentedScopes.has(scope);
            const isConsenting = consentingScope === scope;
            return (
              <tr key={scope} className="border-b border-border-subtle transition-colors hover:bg-bg-hover">
                <td className="px-4 py-3 font-mono text-xs text-text-primary">{scope}</td>
                <td className="hidden max-w-md px-4 py-3 text-text-secondary md:table-cell">
                  {getDescription(scope)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block font-medium ${
                      consented ? "text-success" : "text-text-tertiary"
                    }`}
                  >
                    {consented ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => void handleConsent(scope)}
                    disabled={consented || isConsenting}
                    className={`inline-flex h-8 items-center rounded-lg px-4 text-xs font-semibold transition-colors ${
                      consented
                        ? "cursor-default bg-bg-elevated text-text-muted"
                        : "bg-accent text-bg-deep hover:bg-accent-hover disabled:opacity-50"
                    }`}
                  >
                    {isConsenting ? (
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                    ) : (
                      "Consent"
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
