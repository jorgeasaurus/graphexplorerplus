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

  // ── 20 additional sample responses ───────────────────────────────

  // Organization
  "GET /v1.0/organization": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#organization",
    value: [
      {
        id: "84841066-274d-4ec0-a5c1-276be684bdd3",
        displayName: "Contoso Ltd.",
        tenantType: "AAD",
        verifiedDomains: [
          { capabilities: "Email, OfficeCommunicationsOnline", isDefault: true, isInitial: false, name: "contoso.com", type: "Managed" },
          { capabilities: "Email", isDefault: false, isInitial: true, name: "contoso.onmicrosoft.com", type: "Managed" },
        ],
        assignedPlans: [
          { assignedDateTime: "2025-01-15T00:00:00Z", capabilityStatus: "Enabled", service: "MicrosoftOffice", servicePlanId: "43de0ff5-c92c-492b-9116-175376d08c38" },
        ],
        city: "Redmond",
        state: "WA",
        country: "US",
        postalCode: "98052",
      },
    ],
  },

  // Domains
  "GET /v1.0/domains": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#domains",
    value: [
      { id: "contoso.com", isDefault: true, isInitial: false, isVerified: true, authenticationType: "Managed", availabilityStatus: null },
      { id: "contoso.onmicrosoft.com", isDefault: false, isInitial: true, isVerified: true, authenticationType: "Managed", availabilityStatus: null },
      { id: "fabrikam.com", isDefault: false, isInitial: false, isVerified: true, authenticationType: "Federated", availabilityStatus: null },
    ],
  },

  // Subscribed SKUs (Licenses)
  "GET /v1.0/subscribedSkus": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#subscribedSkus",
    value: [
      { id: "sku1a2b3c4d-5e6f", skuPartNumber: "ENTERPRISEPREMIUM", skuId: "05e9a617-0261-4cee-bb36-b42d6cb57e35", consumedUnits: 85, prepaidUnits: { enabled: 100, suspended: 0, warning: 0 }, appliesTo: "User" },
      { id: "sku2b3c4d5e-6f7a", skuPartNumber: "EMSPREMIUM", skuId: "b05e124f-c7cc-45a0-a6aa-8cf78c946968", consumedUnits: 50, prepaidUnits: { enabled: 100, suspended: 0, warning: 0 }, appliesTo: "User" },
      { id: "sku3c4d5e6f-7a8b", skuPartNumber: "POWER_BI_PRO", skuId: "f8a1db68-be16-40ed-86d5-cb42ce701161", consumedUnits: 30, prepaidUnits: { enabled: 50, suspended: 0, warning: 0 }, appliesTo: "User" },
      { id: "sku4d5e6f7a-8b9c", skuPartNumber: "WIN_DEF_ATP", skuId: "111046dc-6b87-48d1-9e02-4d1ee1a5e15d", consumedUnits: 85, prepaidUnits: { enabled: 100, suspended: 0, warning: 0 }, appliesTo: "User" },
    ],
  },

  // Contacts
  "GET /v1.0/me/contacts": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/contacts",
    value: [
      { id: "ct1a2b3c4d", displayName: "Pradeep Gupta", emailAddresses: [{ name: "Pradeep Gupta", address: "pradeep@fabrikam.com" }], businessPhones: ["+1 206 555 0120"], companyName: "Fabrikam Inc." },
      { id: "ct2b3c4d5e", displayName: "Miriam Graham", emailAddresses: [{ name: "Miriam Graham", address: "miriam@northwindtraders.com" }], businessPhones: ["+1 312 555 0190"], companyName: "Northwind Traders" },
      { id: "ct3c4d5e6f", displayName: "Nestor Wilke", emailAddresses: [{ name: "Nestor Wilke", address: "nestor@tailspintoys.com" }], businessPhones: ["+1 425 555 0145"], companyName: "Tailspin Toys" },
    ],
  },

  // Mail Folders
  "GET /v1.0/me/mailFolders": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/mailFolders",
    value: [
      { id: "mf-inbox", displayName: "Inbox", parentFolderId: "root", childFolderCount: 2, unreadItemCount: 5, totalItemCount: 142 },
      { id: "mf-drafts", displayName: "Drafts", parentFolderId: "root", childFolderCount: 0, unreadItemCount: 0, totalItemCount: 3 },
      { id: "mf-sent", displayName: "Sent Items", parentFolderId: "root", childFolderCount: 0, unreadItemCount: 0, totalItemCount: 256 },
      { id: "mf-deleted", displayName: "Deleted Items", parentFolderId: "root", childFolderCount: 0, unreadItemCount: 0, totalItemCount: 18 },
      { id: "mf-archive", displayName: "Archive", parentFolderId: "root", childFolderCount: 0, unreadItemCount: 0, totalItemCount: 412 },
      { id: "mf-junk", displayName: "Junk Email", parentFolderId: "root", childFolderCount: 0, unreadItemCount: 0, totalItemCount: 7 },
    ],
  },

  // My Drive
  "GET /v1.0/me/drive": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#drives/$entity",
    id: "b!F1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6",
    driveType: "business",
    name: "OneDrive",
    owner: { user: { displayName: "Adele Vance", id: "87d349ed-44d7-43e1-9a83-5f2406dee5bd" } },
    quota: { deleted: 1234567, remaining: 1099511627776, state: "normal", total: 1099511627776, used: 345678901 },
  },

  // Calendar Groups
  "GET /v1.0/me/calendarGroups": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/calendarGroups",
    value: [
      { id: "cg-default", name: "My Calendars", classId: "0006f0b7-0000-0000-c000-000000000046", changeKey: "nfZyf7VcrEkLKI5hIsM7GAABC" },
      { id: "cg-other", name: "Other Calendars", classId: "0006f0b8-0000-0000-c000-000000000046", changeKey: "xyzabcdef123456" },
    ],
  },

  // My Calendars
  "GET /v1.0/me/calendars": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/calendars",
    value: [
      { id: "cal-default", name: "Calendar", color: "auto", isDefaultCalendar: true, canEdit: true, owner: { name: "Adele Vance", address: "AdeleV@contoso.com" } },
      { id: "cal-birthdays", name: "Birthdays", color: "auto", isDefaultCalendar: false, canEdit: false, owner: { name: "Adele Vance", address: "AdeleV@contoso.com" } },
      { id: "cal-holidays", name: "United States holidays", color: "auto", isDefaultCalendar: false, canEdit: false, owner: { name: "Adele Vance", address: "AdeleV@contoso.com" } },
    ],
  },

  // Audit Logs - Sign-ins
  "GET /v1.0/auditLogs/signIns": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#auditLogs/signIns",
    value: [
      { id: "si1a2b3c4d-5e6f-7890-abcd-ef1234567890", createdDateTime: "2026-04-08T14:30:00Z", userDisplayName: "Adele Vance", userPrincipalName: "AdeleV@contoso.com", appDisplayName: "Microsoft Teams", ipAddress: "198.51.100.42", clientAppUsed: "Browser", status: { errorCode: 0, failureReason: null, additionalDetails: "MFA requirement satisfied by claim in the token" }, location: { city: "Redmond", state: "Washington", countryOrRegion: "US" }, conditionalAccessStatus: "success" },
      { id: "si2b3c4d5e-6f78-9012-bcde-f23456789012", createdDateTime: "2026-04-08T13:15:00Z", userDisplayName: "Alex Wilber", userPrincipalName: "AlexW@contoso.com", appDisplayName: "Outlook Mobile", ipAddress: "203.0.113.15", clientAppUsed: "Mobile Apps and Desktop clients", status: { errorCode: 0, failureReason: null, additionalDetails: null }, location: { city: "Seattle", state: "Washington", countryOrRegion: "US" }, conditionalAccessStatus: "success" },
      { id: "si3c4d5e6f-7890-1234-cdef-345678901234", createdDateTime: "2026-04-08T12:00:00Z", userDisplayName: "Unknown", userPrincipalName: "attacker@malicious.com", appDisplayName: "Azure Portal", ipAddress: "192.0.2.99", clientAppUsed: "Browser", status: { errorCode: 50126, failureReason: "Invalid username or password", additionalDetails: null }, location: { city: "Moscow", state: "Moscow", countryOrRegion: "RU" }, conditionalAccessStatus: "failure" },
    ],
  },

  // Audit Logs - Directory Audits
  "GET /v1.0/auditLogs/directoryAudits": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#auditLogs/directoryAudits",
    value: [
      { id: "da1a2b3c4d", activityDisplayName: "Add member to group", activityDateTime: "2026-04-08T14:00:00Z", category: "GroupManagement", result: "success", initiatedBy: { user: { displayName: "Diego Siciliani", userPrincipalName: "DiegoS@contoso.com" } }, targetResources: [{ displayName: "Engineering", type: "Group" }] },
      { id: "da2b3c4d5e", activityDisplayName: "Update user", activityDateTime: "2026-04-08T12:30:00Z", category: "UserManagement", result: "success", initiatedBy: { user: { displayName: "Joni Sherman", userPrincipalName: "JoniS@contoso.com" } }, targetResources: [{ displayName: "Alex Wilber", type: "User" }] },
      { id: "da3c4d5e6f", activityDisplayName: "Add conditional access policy", activityDateTime: "2026-04-08T10:00:00Z", category: "Policy", result: "success", initiatedBy: { user: { displayName: "Lee Gu", userPrincipalName: "LeeG@contoso.com" } }, targetResources: [{ displayName: "Block Legacy Auth", type: "Policy" }] },
    ],
  },

  // Managed Devices (v1.0)
  "GET /v1.0/deviceManagement/managedDevices": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#deviceManagement/managedDevices",
    value: [
      { id: "md1a2b3c-4d5e-6f78-9abc", deviceName: "DESKTOP-CONTOSO1", operatingSystem: "Windows", osVersion: "10.0.19045.3930", complianceState: "compliant", managementAgent: "mdm", enrolledDateTime: "2025-01-15T08:30:00Z", lastSyncDateTime: "2026-04-08T12:00:00Z", userDisplayName: "Adele Vance", model: "Surface Pro 9", manufacturer: "Microsoft Corporation" },
      { id: "md2b3c4d-5e6f-7890-abcd", deviceName: "iPhone-AlexW", operatingSystem: "iOS", osVersion: "17.4.1", complianceState: "compliant", managementAgent: "mdm", enrolledDateTime: "2025-03-10T10:15:00Z", lastSyncDateTime: "2026-04-08T08:30:00Z", userDisplayName: "Alex Wilber", model: "iPhone 15 Pro", manufacturer: "Apple" },
      { id: "md3c4d5e-6f78-9012-bcde", deviceName: "MacBook-DiegoS", operatingSystem: "macOS", osVersion: "14.4", complianceState: "noncompliant", managementAgent: "mdm", enrolledDateTime: "2025-06-20T14:00:00Z", lastSyncDateTime: "2026-04-07T18:45:00Z", userDisplayName: "Diego Siciliani", model: "MacBook Pro 16", manufacturer: "Apple" },
      { id: "md4d5e6f-7890-1234-cdef", deviceName: "Pixel-JoniS", operatingSystem: "Android", osVersion: "14", complianceState: "compliant", managementAgent: "mdm", enrolledDateTime: "2025-09-01T09:00:00Z", lastSyncDateTime: "2026-04-08T07:15:00Z", userDisplayName: "Joni Sherman", model: "Pixel 8 Pro", manufacturer: "Google" },
    ],
  },

  // Risky Users (Identity Protection)
  "GET /v1.0/identityProtection/riskyUsers": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#identityProtection/riskyUsers",
    value: [
      { id: "ru1a2b3c4d-5e6f", userDisplayName: "Unknown User", userPrincipalName: "suspicious@contoso.com", riskLevel: "high", riskState: "atRisk", riskDetail: "adminConfirmedSigninCompromised", riskLastUpdatedDateTime: "2026-04-08T10:30:00Z" },
      { id: "ru2b3c4d5e-6f7a", userDisplayName: "Grady Archie", userPrincipalName: "GradyA@contoso.com", riskLevel: "medium", riskState: "atRisk", riskDetail: "aiConfirmedSigninSuspicious", riskLastUpdatedDateTime: "2026-04-07T16:00:00Z" },
      { id: "ru3c4d5e6f-7a8b", userDisplayName: "Henrietta Mueller", userPrincipalName: "HenriettaM@contoso.com", riskLevel: "low", riskState: "remediated", riskDetail: "userPerformedSecuredPasswordReset", riskLastUpdatedDateTime: "2026-04-06T08:00:00Z" },
    ],
  },

  // Risk Detections
  "GET /v1.0/identityProtection/riskDetections": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#identityProtection/riskDetections",
    value: [
      { id: "rd1a2b3c4d", riskEventType: "unfamiliarFeatures", riskLevel: "medium", riskState: "atRisk", userDisplayName: "Grady Archie", userPrincipalName: "GradyA@contoso.com", ipAddress: "203.0.113.200", location: { city: "Lagos", state: "Lagos", countryOrRegion: "NG" }, detectedDateTime: "2026-04-07T15:30:00Z", detectionTimingType: "realtime", source: "IdentityProtection" },
      { id: "rd2b3c4d5e", riskEventType: "anonymizedIPAddress", riskLevel: "high", riskState: "atRisk", userDisplayName: "Unknown User", userPrincipalName: "suspicious@contoso.com", ipAddress: "192.0.2.99", location: { city: "Unknown", state: "Unknown", countryOrRegion: "TOR" }, detectedDateTime: "2026-04-08T10:00:00Z", detectionTimingType: "realtime", source: "IdentityProtection" },
    ],
  },

  // Security Alerts
  "GET /v1.0/security/alerts_v2": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#security/alerts_v2",
    value: [
      { id: "sa1a2b3c4d-5e6f", title: "Suspicious sign-in from anonymous IP address", severity: "high", status: "new", category: "InitialAccess", createdDateTime: "2026-04-08T10:15:00Z", description: "A sign-in was detected from an IP address identified as an anonymous proxy.", assignedTo: null, serviceSource: "microsoftDefenderForCloudApps" },
      { id: "sa2b3c4d5e-6f78", title: "Impossible travel activity", severity: "medium", status: "inProgress", category: "InitialAccess", createdDateTime: "2026-04-07T14:00:00Z", description: "Two sign-ins from geographically distant locations within an impossibly short time.", assignedTo: "LeeG@contoso.com", serviceSource: "microsoftDefenderForCloudApps" },
      { id: "sa3c4d5e6f-7890", title: "Malware detected on endpoint", severity: "high", status: "new", category: "Execution", createdDateTime: "2026-04-08T09:30:00Z", description: "Windows Defender detected potentially malicious software on DESKTOP-CONTOSO3.", assignedTo: null, serviceSource: "microsoftDefenderForEndpoint" },
    ],
  },

  // Security Incidents
  "GET /v1.0/security/incidents": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#security/incidents",
    value: [
      { id: "inc1a2b3c4d", displayName: "Multi-stage incident involving credential theft", severity: "high", status: "active", createdDateTime: "2026-04-08T10:00:00Z", lastUpdateDateTime: "2026-04-08T14:00:00Z", assignedTo: "LeeG@contoso.com", classification: "truePositive", determination: "compromisedUser" },
      { id: "inc2b3c4d5e", displayName: "Suspicious mailbox forwarding rule", severity: "medium", status: "active", createdDateTime: "2026-04-07T08:00:00Z", lastUpdateDateTime: "2026-04-08T10:00:00Z", assignedTo: null, classification: "unknown", determination: "unknown" },
    ],
  },

  // SharePoint Sites - Root
  "GET /v1.0/sites/root": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#sites/$entity",
    id: "contoso.sharepoint.com,2C712604-1370-44E7-A1F5-426573FDA80A,2D2244C3-251A-49EA-93A8-39E1C3A060FE",
    displayName: "Contoso",
    name: "root",
    webUrl: "https://contoso.sharepoint.com",
    siteCollection: { hostname: "contoso.sharepoint.com" },
    createdDateTime: "2024-03-15T10:00:00Z",
    lastModifiedDateTime: "2026-04-08T16:00:00Z",
  },

  // To-Do Lists
  "GET /v1.0/me/todo/lists": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/todo/lists",
    value: [
      { id: "td-default", displayName: "Tasks", isOwner: true, isShared: false, wellknownListName: "defaultList" },
      { id: "td-flagged", displayName: "Flagged Emails", isOwner: true, isShared: false, wellknownListName: "flaggedEmails" },
      { id: "td-project", displayName: "Project Alpha", isOwner: true, isShared: true, wellknownListName: "none" },
      { id: "td-personal", displayName: "Personal", isOwner: true, isShared: false, wellknownListName: "none" },
    ],
  },

  // My Direct Reports
  "GET /v1.0/me/directReports": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#directoryObjects",
    value: [
      { "@odata.type": "#microsoft.graph.user", id: "4562bcc8-c436-4f95-b7c0-4f8ce89dca5e", displayName: "Alex Wilber", mail: "AlexW@contoso.com", jobTitle: "Marketing Assistant" },
      { "@odata.type": "#microsoft.graph.user", id: "b587d4c3-1d1f-4b2a-92e7-63c7e5a2d140", displayName: "Isaiah Langer", mail: "IsaiahL@contoso.com", jobTitle: "Sales Rep" },
    ],
  },

  // My Manager
  "GET /v1.0/me/manager": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#directoryObjects/$entity",
    "@odata.type": "#microsoft.graph.user",
    id: "98dc9c4a-b975-4017-b998-5e36c6d18ab1",
    displayName: "Lee Gu",
    mail: "LeeG@contoso.com",
    userPrincipalName: "LeeG@contoso.com",
    jobTitle: "Director",
    officeLocation: "18/2100",
  },

  // My Member Of (groups & roles)
  "GET /v1.0/me/memberOf": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#directoryObjects",
    value: [
      { "@odata.type": "#microsoft.graph.group", id: "02bd9fd6-8f93-4758-87c3-1fb73740a315", displayName: "All Employees", mailEnabled: true, securityEnabled: false },
      { "@odata.type": "#microsoft.graph.group", id: "13be6971-79db-4f33-9d41-b25589ca25af", displayName: "Engineering", mailEnabled: true, securityEnabled: false },
      { "@odata.type": "#microsoft.graph.directoryRole", id: "dr2b3c4d-5e6f-7890-abcd-ef1234567890", displayName: "User Administrator", roleTemplateId: "fe930be7-5e62-47db-91af-98c3a49a38b1" },
    ],
  },

  // OAuth2 Permission Grants
  "GET /v1.0/oauth2PermissionGrants": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#oauth2PermissionGrants",
    value: [
      { id: "og1a2b3c4d", clientId: "sp2b3c4d-5e6f-7890-abcd-ef1234567890", consentType: "AllPrincipals", principalId: null, resourceId: "sp1a2b3c-4d5e-6f78-9abc-def012345678", scope: "User.Read User.ReadWrite Mail.Read" },
      { id: "og2b3c4d5e", clientId: "sp3c4d5e-6f78-9012-bcde-f23456789012", consentType: "Principal", principalId: "87d349ed-44d7-43e1-9a83-5f2406dee5bd", resourceId: "sp1a2b3c-4d5e-6f78-9abc-def012345678", scope: "Calendars.Read Mail.Send" },
    ],
  },

  // Named Locations (Conditional Access)
  "GET /v1.0/identity/conditionalAccess/namedLocations": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#identity/conditionalAccess/namedLocations",
    value: [
      { "@odata.type": "#microsoft.graph.ipNamedLocation", id: "nl1a2b3c4d", displayName: "Corporate Network", isTrusted: true, ipRanges: [{ "@odata.type": "#microsoft.graph.iPv4CidrRange", cidrAddress: "198.51.100.0/24" }, { "@odata.type": "#microsoft.graph.iPv4CidrRange", cidrAddress: "203.0.113.0/24" }] },
      { "@odata.type": "#microsoft.graph.countryNamedLocation", id: "nl2b3c4d5e", displayName: "Blocked Countries", countriesAndRegions: ["KP", "IR", "RU"], includeUnknownCountriesAndRegions: false },
    ],
  },

  // Planner Tasks
  "GET /v1.0/me/planner/tasks": {
    "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('me')/planner/tasks",
    value: [
      { id: "pt1a2b3c4d", planId: "plan-alpha-001", bucketId: "bucket-todo", title: "Update deployment documentation", percentComplete: 50, startDateTime: "2026-04-07T00:00:00Z", dueDateTime: "2026-04-12T00:00:00Z", priority: 3, createdDateTime: "2026-04-05T09:00:00Z", assignments: { "87d349ed-44d7-43e1-9a83-5f2406dee5bd": { orderHint: "8585" } } },
      { id: "pt2b3c4d5e", planId: "plan-alpha-001", bucketId: "bucket-inprogress", title: "Review pull request #142", percentComplete: 0, startDateTime: null, dueDateTime: "2026-04-09T00:00:00Z", priority: 1, createdDateTime: "2026-04-08T10:00:00Z", assignments: { "87d349ed-44d7-43e1-9a83-5f2406dee5bd": { orderHint: "8586" } } },
      { id: "pt3c4d5e6f", planId: "plan-alpha-001", bucketId: "bucket-done", title: "Set up CI/CD pipeline", percentComplete: 100, startDateTime: "2026-04-01T00:00:00Z", dueDateTime: "2026-04-05T00:00:00Z", priority: 5, createdDateTime: "2026-03-28T14:00:00Z", assignments: {} },
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
