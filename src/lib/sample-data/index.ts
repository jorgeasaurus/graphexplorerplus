/**
 * Sample response data for demo mode.
 *
 * When a user is not signed in (or is browsing a non-commercial cloud),
 * selecting a sample query and hitting Send shows one of these canned
 * responses instead of returning a 401.
 *
 * Keys follow the pattern "METHOD /path" (relative, no base URL).
 * The lookup function normalises both sides before matching.
 */

import type { GraphResponse } from "~/lib/graph/client";

// ── Sample payloads ────────────────────────────────────────────────

const SAMPLE_RESPONSES: Record<string, object> = {
  // Getting Started
  "GET /v1.0/me": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users/$entity",
    id: "87d349ed-44d7-43e1-9a83-5f2406dee5bd",
    displayName: "Adele Vance",
    givenName: "Adele",
    surname: "Vance",
    mail: "AdeleV@contoso.com",
    userPrincipalName: "AdeleV@contoso.com",
    jobTitle: "Retail Manager",
    officeLocation: "18/2111",
    mobilePhone: "+1 425 555 0109",
    businessPhones: ["+1 425 555 0100"],
    preferredLanguage: "en-US",
  },

  "GET /v1.0/me/messages": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/messages",
    "@odata.count": 3,
    value: [
      {
        id: "AAMkAGI2TG93AAA=",
        subject: "Q4 Budget Review",
        bodyPreview: "Hi team, please review the attached Q4 budget before Friday...",
        from: { emailAddress: { name: "Megan Bowen", address: "MeganB@contoso.com" } },
        receivedDateTime: "2026-04-08T14:30:00Z",
        isRead: false,
        hasAttachments: true,
      },
      {
        id: "AAMkAGI2TG94AAA=",
        subject: "Team Offsite - Save the Date",
        bodyPreview: "Mark your calendars for the annual team offsite on May 15...",
        from: { emailAddress: { name: "Alex Wilber", address: "AlexW@contoso.com" } },
        receivedDateTime: "2026-04-07T09:15:00Z",
        isRead: true,
        hasAttachments: false,
      },
      {
        id: "AAMkAGI2TG95AAA=",
        subject: "Re: Project Alpha Status Update",
        bodyPreview: "Thanks for the update. Let's discuss in our 1:1 tomorrow...",
        from: { emailAddress: { name: "Adele Vance", address: "AdeleV@contoso.com" } },
        receivedDateTime: "2026-04-06T16:45:00Z",
        isRead: true,
        hasAttachments: false,
      },
    ],
  },

  // Users
  "GET /v1.0/users": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users",
    value: [
      { id: "87d349ed-44d7-43e1-9a83-5f2406dee5bd", displayName: "Adele Vance", mail: "AdeleV@contoso.com", userPrincipalName: "AdeleV@contoso.com", jobTitle: "Retail Manager" },
      { id: "4562bcc8-c436-4f95-b7c0-4f8ce89dca5e", displayName: "Alex Wilber", mail: "AlexW@contoso.com", userPrincipalName: "AlexW@contoso.com", jobTitle: "Marketing Assistant" },
      { id: "f7afe5f0-3e6e-4a89-bde6-b4c2e2b1df9c", displayName: "Diego Siciliani", mail: "DiegoS@contoso.com", userPrincipalName: "DiegoS@contoso.com", jobTitle: "HR Manager" },
      { id: "c3066a72-5e0f-47a3-b67c-4e2d0e1f9b3a", displayName: "Grady Archie", mail: "GradyA@contoso.com", userPrincipalName: "GradyA@contoso.com", jobTitle: "Designer" },
      { id: "e1251b10-1ba4-49e3-b35a-933e3f21772b", displayName: "Henrietta Mueller", mail: "HenriettaM@contoso.com", userPrincipalName: "HenriettaM@contoso.com", jobTitle: "Developer" },
      { id: "b587d4c3-1d1f-4b2a-92e7-63c7e5a2d140", displayName: "Isaiah Langer", mail: "IsaiahL@contoso.com", userPrincipalName: "IsaiahL@contoso.com", jobTitle: "Sales Rep" },
      { id: "a40e5c6d-213e-4cda-92b6-89d1e7f03e2c", displayName: "Johanna Lorenz", mail: "JohannaL@contoso.com", userPrincipalName: "JohannaL@contoso.com", jobTitle: "Senior Engineer" },
      { id: "5bde3e51-d13b-4db1-9f46-02e3a345b982", displayName: "Joni Sherman", mail: "JoniS@contoso.com", userPrincipalName: "JoniS@contoso.com", jobTitle: "Paralegal" },
      { id: "98dc9c4a-b975-4017-b998-5e36c6d18ab1", displayName: "Lee Gu", mail: "LeeG@contoso.com", userPrincipalName: "LeeG@contoso.com", jobTitle: "Director" },
      { id: "320bee9f-c95d-4d2e-b5d7-45ff4c29991a", displayName: "Megan Bowen", mail: "MeganB@contoso.com", userPrincipalName: "MeganB@contoso.com", jobTitle: "VP of Marketing" },
    ],
  },

  // Groups
  "GET /v1.0/groups": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#groups",
    value: [
      { id: "02bd9fd6-8f93-4758-87c3-1fb73740a315", displayName: "All Employees", mail: "allemployees@contoso.com", groupTypes: ["Unified"], securityEnabled: false, mailEnabled: true, membershipRule: null },
      { id: "13be6971-79db-4f33-9d41-b25589ca25af", displayName: "Engineering", mail: "engineering@contoso.com", groupTypes: ["Unified"], securityEnabled: false, mailEnabled: true, membershipRule: null },
      { id: "a98d7c1e-3b4f-4d2a-9f5c-6b8e7d0f1a2c", displayName: "IT Security", mail: null, groupTypes: [], securityEnabled: true, mailEnabled: false, membershipRule: null },
      { id: "b5c4d3e2-1a0f-4e9d-8c7b-6a5f4e3d2c1b", displayName: "Marketing Team", mail: "marketing@contoso.com", groupTypes: ["Unified"], securityEnabled: false, mailEnabled: true, membershipRule: null },
      { id: "c6d5e4f3-2b1a-5f0e-9d8c-7b6a5f4e3d2c", displayName: "Executives", mail: null, groupTypes: [], securityEnabled: true, mailEnabled: false, membershipRule: null },
    ],
  },

  // Applications
  "GET /v1.0/applications": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#applications",
    value: [
      { id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", displayName: "Contoso Portal", appId: "11111111-2222-3333-4444-555555555555", signInAudience: "AzureADMyOrg", publisherDomain: "contoso.com" },
      { id: "b2c3d4e5-f6a7-8901-bcde-f12345678901", displayName: "HR Dashboard", appId: "22222222-3333-4444-5555-666666666666", signInAudience: "AzureADMyOrg", publisherDomain: "contoso.com" },
      { id: "c3d4e5f6-a7b8-9012-cdef-123456789012", displayName: "Sales API", appId: "33333333-4444-5555-6666-777777777777", signInAudience: "AzureADMultipleOrgs", publisherDomain: "contoso.com" },
    ],
  },

  // Devices (Intune)
  "GET /beta/deviceManagement/managedDevices": {
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#deviceManagement/managedDevices",
    value: [
      { id: "d1e2f3a4-b5c6-7890-def1-234567890abc", deviceName: "DESKTOP-CONTOSO1", operatingSystem: "Windows", osVersion: "10.0.19045.3930", complianceState: "compliant", managementAgent: "mdm", enrolledDateTime: "2025-01-15T08:30:00Z", lastSyncDateTime: "2026-04-08T12:00:00Z", userDisplayName: "Adele Vance", userPrincipalName: "AdeleV@contoso.com", model: "Surface Pro 9", manufacturer: "Microsoft Corporation" },
      { id: "e2f3a4b5-c6d7-8901-ef12-345678901bcd", deviceName: "iPhone-AlexW", operatingSystem: "iOS", osVersion: "17.4.1", complianceState: "compliant", managementAgent: "mdm", enrolledDateTime: "2025-03-10T10:15:00Z", lastSyncDateTime: "2026-04-08T08:30:00Z", userDisplayName: "Alex Wilber", userPrincipalName: "AlexW@contoso.com", model: "iPhone 15 Pro", manufacturer: "Apple" },
      { id: "f3a4b5c6-d7e8-9012-f123-456789012cde", deviceName: "MacBook-DiegoS", operatingSystem: "macOS", osVersion: "14.4", complianceState: "noncompliant", managementAgent: "mdm", enrolledDateTime: "2025-06-20T14:00:00Z", lastSyncDateTime: "2026-04-07T18:45:00Z", userDisplayName: "Diego Siciliani", userPrincipalName: "DiegoS@contoso.com", model: "MacBook Pro 16", manufacturer: "Apple" },
    ],
  },

  // Device compliance policies
  "GET /v1.0/deviceManagement/deviceCompliancePolicies": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#deviceManagement/deviceCompliancePolicies",
    value: [
      { id: "p1a2b3c4-d5e6-f789-0abc-def123456789", displayName: "Windows 10 Compliance", "@odata.type": "#microsoft.graph.windows10CompliancePolicy", passwordRequired: true, osMinimumVersion: "10.0.19044", bitLockerEnabled: true, secureBootEnabled: true },
      { id: "p2b3c4d5-e6f7-8901-bcde-f12345678901", displayName: "iOS Compliance", "@odata.type": "#microsoft.graph.iosCompliancePolicy", passcodeRequired: true, osMinimumVersion: "16.0", securityBlockJailbrokenDevices: true },
      { id: "p3c4d5e6-f7a8-9012-cdef-234567890123", displayName: "macOS Compliance", "@odata.type": "#microsoft.graph.macOSCompliancePolicy", passwordRequired: true, osMinimumVersion: "13.0", firewallEnabled: true },
    ],
  },

  // Conditional Access
  "GET /v1.0/identity/conditionalAccess/policies": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#identity/conditionalAccess/policies",
    value: [
      { id: "ca1a2b3c-4d5e-6f78-9abc-def012345678", displayName: "Require MFA for All Users", state: "enabled", conditions: { users: { includeUsers: ["All"] }, applications: { includeApplications: ["All"] } }, grantControls: { operator: "OR", builtInControls: ["mfa"] } },
      { id: "ca2b3c4d-5e6f-7890-abcd-ef1234567890", displayName: "Block Legacy Authentication", state: "enabled", conditions: { users: { includeUsers: ["All"] }, clientAppTypes: ["exchangeActiveSync", "other"] }, grantControls: { operator: "OR", builtInControls: ["block"] } },
      { id: "ca3c4d5e-6f78-9012-bcde-f23456789012", displayName: "Require Compliant Device", state: "enabledForReportingButNotEnforced", conditions: { users: { includeUsers: ["All"] }, applications: { includeApplications: ["All"] }, platforms: { includePlatforms: ["windows", "iOS", "macOS"] } }, grantControls: { operator: "OR", builtInControls: ["compliantDevice"] } },
    ],
  },

  // Service Principals
  "GET /v1.0/servicePrincipals": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#servicePrincipals",
    value: [
      { id: "sp1a2b3c-4d5e-6f78-9abc-def012345678", displayName: "Microsoft Graph", appId: "00000003-0000-0000-c000-000000000000", servicePrincipalType: "Application" },
      { id: "sp2b3c4d-5e6f-7890-abcd-ef1234567890", displayName: "Contoso Portal", appId: "11111111-2222-3333-4444-555555555555", servicePrincipalType: "Application" },
      { id: "sp3c4d5e-6f78-9012-bcde-f23456789012", displayName: "Office 365 Exchange Online", appId: "00000002-0000-0ff1-ce00-000000000000", servicePrincipalType: "Application" },
    ],
  },

  // Teams
  "GET /v1.0/me/joinedTeams": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#me/joinedTeams",
    value: [
      { id: "t1a2b3c4-d5e6-f789-0abc-def123456789", displayName: "Engineering", description: "All engineering discussions and collaboration" },
      { id: "t2b3c4d5-e6f7-8901-bcde-f12345678901", displayName: "Marketing", description: "Marketing campaigns and brand strategy" },
      { id: "t3c4d5e6-f7a8-9012-cdef-234567890123", displayName: "All Company", description: "Company-wide announcements and discussions" },
    ],
  },

  // Drive
  "GET /v1.0/me/drive/root/children": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/drive/root/children",
    value: [
      { id: "01BYE5RZ6QN3ZWBTUFOFD3GSPGOHDJD36K", name: "Documents", folder: { childCount: 12 }, size: 45678901, lastModifiedDateTime: "2026-04-08T10:30:00Z" },
      { id: "01BYE5RZ5MYLM2SMX75ZBIPQZIHT6OZMOY", name: "Desktop", folder: { childCount: 5 }, size: 12345678, lastModifiedDateTime: "2026-04-07T15:20:00Z" },
      { id: "01BYE5RZZCHFDRG2HZ5VD2VLVF345KGPOV", name: "Pictures", folder: { childCount: 42 }, size: 234567890, lastModifiedDateTime: "2026-03-25T09:00:00Z" },
      { id: "01BYE5RZ4QQMTMPBYPO5GIURHPXJVDQQLA", name: "Q4 Budget.xlsx", file: { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, size: 1234567, lastModifiedDateTime: "2026-04-08T14:15:00Z" },
    ],
  },

  // Directory roles
  "GET /v1.0/directoryRoles": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#directoryRoles",
    value: [
      { id: "dr1a2b3c-4d5e-6f78-9abc-def012345678", displayName: "Global Administrator", description: "Can manage all aspects of Azure AD and Microsoft services", roleTemplateId: "62e90394-69f5-4237-9190-012177145e10" },
      { id: "dr2b3c4d-5e6f-7890-abcd-ef1234567890", displayName: "User Administrator", description: "Can manage all aspects of users and groups", roleTemplateId: "fe930be7-5e62-47db-91af-98c3a49a38b1" },
      { id: "dr3c4d5e-6f78-9012-bcde-f23456789012", displayName: "Security Administrator", description: "Can read security info and reports, manage configuration in Azure AD and Office 365", roleTemplateId: "194ae4cb-b126-40b2-bd5b-6091b380977d" },
      { id: "dr4d5e6f-7890-1234-cdef-345678901234", displayName: "Intune Administrator", description: "Can manage all aspects of the Intune product", roleTemplateId: "3a2c62db-5318-420d-8d74-23affee5d9d5" },
    ],
  },

  // Calendar events
  "GET /v1.0/me/events": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/events",
    value: [
      { id: "ev1a2b3c4d5e6f78", subject: "Weekly Standup", start: { dateTime: "2026-04-09T09:00:00", timeZone: "Pacific Standard Time" }, end: { dateTime: "2026-04-09T09:30:00", timeZone: "Pacific Standard Time" }, isOnlineMeeting: true, organizer: { emailAddress: { name: "Megan Bowen", address: "MeganB@contoso.com" } } },
      { id: "ev2b3c4d5e6f7890", subject: "1:1 with Manager", start: { dateTime: "2026-04-09T14:00:00", timeZone: "Pacific Standard Time" }, end: { dateTime: "2026-04-09T14:30:00", timeZone: "Pacific Standard Time" }, isOnlineMeeting: true, organizer: { emailAddress: { name: "Lee Gu", address: "LeeG@contoso.com" } } },
      { id: "ev3c4d5e6f789012", subject: "Team Offsite Planning", start: { dateTime: "2026-04-10T10:00:00", timeZone: "Pacific Standard Time" }, end: { dateTime: "2026-04-10T11:00:00", timeZone: "Pacific Standard Time" }, isOnlineMeeting: false, location: { displayName: "Conference Room A" }, organizer: { emailAddress: { name: "Alex Wilber", address: "AlexW@contoso.com" } } },
    ],
  },

  // Intune configuration profiles
  "GET /v1.0/deviceManagement/deviceConfigurations": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#deviceManagement/deviceConfigurations",
    value: [
      { id: "dc1a2b3c-4d5e-6f78", displayName: "Windows - BitLocker Encryption", "@odata.type": "#microsoft.graph.windows10EndpointProtectionConfiguration", lastModifiedDateTime: "2026-03-15T10:00:00Z" },
      { id: "dc2b3c4d-5e6f-7890", displayName: "iOS - Passcode Requirements", "@odata.type": "#microsoft.graph.iosGeneralDeviceConfiguration", lastModifiedDateTime: "2026-02-20T14:30:00Z" },
      { id: "dc3c4d5e-6f78-9012", displayName: "Windows - Firewall Settings", "@odata.type": "#microsoft.graph.windows10EndpointProtectionConfiguration", lastModifiedDateTime: "2026-01-10T08:00:00Z" },
    ],
  },

  // Intune apps
  "GET /beta/deviceAppManagement/mobileApps": {
    "@odata.context": "https://graph.microsoft.com/beta/$metadata#deviceAppManagement/mobileApps",
    value: [
      { id: "ma1a2b3c-4d5e", displayName: "Microsoft Teams", "@odata.type": "#microsoft.graph.winGetApp", publisher: "Microsoft Corporation", isFeatured: true, publishingState: "published" },
      { id: "ma2b3c4d-5e6f", displayName: "Google Chrome", "@odata.type": "#microsoft.graph.winGetApp", publisher: "Google LLC", isFeatured: false, publishingState: "published" },
      { id: "ma3c4d5e-6f78", displayName: "Zoom Workplace", "@odata.type": "#microsoft.graph.winGetApp", publisher: "Zoom Video Communications", isFeatured: false, publishingState: "published" },
      { id: "ma4d5e6f-7890", displayName: "Company Portal", "@odata.type": "#microsoft.graph.microsoftStoreForBusinessApp", publisher: "Microsoft Corporation", isFeatured: true, publishingState: "published" },
    ],
  },
};

// ── Lookup function ────────────────────────────────────────────────

/**
 * Normalise a full URL (or relative path) down to "METHOD /version/path"
 * for matching against sample keys.
 */
function normaliseKey(method: string, url: string): string {
  // Strip any Graph base URL prefix
  const stripped = url.replace(
    /^https:\/\/(graph\.microsoft\.(com|us|de)|dod-graph\.microsoft\.us|microsoftgraph\.chinacloudapi\.cn)/,
    "",
  );
  // Remove query strings for matching
  const path = stripped.split("?")[0]!;
  return `${method.toUpperCase()} ${path}`;
}

/**
 * Extract the Graph base host from a full URL (e.g. "dod-graph.microsoft.us").
 * Falls back to "graph.microsoft.com" if no known host is found.
 */
const GRAPH_HOST_RE =
  /^https:\/\/(graph\.microsoft\.(?:com|us|de)|dod-graph\.microsoft\.us|microsoftgraph\.chinacloudapi\.cn)/;

function extractGraphHost(url: string): string {
  const m = url.match(GRAPH_HOST_RE);
  return m ? m[1]! : "graph.microsoft.com";
}

/**
 * Look up a sample response for a given method + URL.
 * Rewrites @odata.context URLs to match the selected cloud endpoint.
 * Returns a full GraphResponse or undefined if no sample exists.
 */
export function getSampleResponse(method: string, url: string): GraphResponse | undefined {
  const key = normaliseKey(method, url);
  const data = SAMPLE_RESPONSES[key];
  if (!data) return undefined;

  let body = JSON.stringify(data, null, 2);

  // Rewrite hardcoded graph.microsoft.com to the actual cloud host
  const host = extractGraphHost(url);
  if (host !== "graph.microsoft.com") {
    body = body.replaceAll("graph.microsoft.com", host);
  }

  return {
    status: 200,
    statusText: "OK (Sample Data)",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-sample-data": "true",
    },
    body,
    timeMs: 0,
    sizeBytes: new Blob([body]).size,
  };
}

/**
 * Returns true if we have sample data for a given method + URL.
 */
export function hasSampleData(method: string, url: string): boolean {
  return !!SAMPLE_RESPONSES[normaliseKey(method, url)];
}
