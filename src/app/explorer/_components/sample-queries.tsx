"use client";

import { useMemo, useState } from "react";
import { getSelectedCloudEnvironment } from "~/lib/auth/authUtils";
import { getGraphEndpoint } from "~/lib/auth/msalConfig";

// ── Types ──────────────────────────────────────────────────────────

interface SampleQuery {
  method: string;
  path: string;
  name: string;
}

interface SampleCategory {
  name: string;
  expanded?: boolean;
  queries: SampleQuery[];
}

export interface SampleQueriesProps {
  onSelectQuery?: (query: { method: string; url: string }) => void;
}

// ── Curated Samples ────────────────────────────────────────────────

const SAMPLE_CATEGORIES: SampleCategory[] = [
  {
    name: "Getting Started",
    expanded: true,
    queries: [
      { method: "GET", path: "/v1.0/me", name: "My profile" },
      { method: "GET", path: "/v1.0/me/photo/$value", name: "My photo" },
      { method: "GET", path: "/v1.0/me/messages", name: "My messages" },
      { method: "GET", path: "/v1.0/me/drive/root/children", name: "My files" },
      { method: "GET", path: "/v1.0/me/events", name: "My events" },
      { method: "GET", path: "/v1.0/me/contacts", name: "My contacts" },
      { method: "GET", path: "/v1.0/me/memberOf", name: "My groups & roles" },
      { method: "GET", path: "/v1.0/me/todo/lists", name: "My To Do lists" },
      { method: "GET", path: "/v1.0/me/manager", name: "My manager" },
      { method: "GET", path: "/v1.0/me/directReports", name: "My direct reports" },
    ],
  },
  {
    name: "Users",
    queries: [
      { method: "GET", path: "/v1.0/users", name: "List all users" },
      { method: "GET", path: "/v1.0/users?$top=10&$select=displayName,mail", name: "Users (select fields)" },
      { method: "GET", path: "/v1.0/users?$filter=startswith(displayName,'A')", name: "Filter users by name" },
      { method: "GET", path: "/v1.0/users/{user-id}", name: "Get user by ID" },
      { method: "GET", path: "/v1.0/users?$count=true", name: "Count users" },
      { method: "GET", path: "/v1.0/users?$filter=accountEnabled eq false", name: "Disabled users" },
      { method: "GET", path: "/v1.0/users?$filter=userType eq 'Guest'", name: "Guest users" },
      { method: "GET", path: "/v1.0/users/{user-id}/appRoleAssignments", name: "User app role assignments" },
      { method: "GET", path: "/beta/users/{user-id}/authentication/methods", name: "User auth methods" },
      { method: "PATCH", path: "/v1.0/users/{user-id}", name: "Update user" },
    ],
  },
  {
    name: "Groups",
    queries: [
      { method: "GET", path: "/v1.0/groups", name: "List all groups" },
      { method: "GET", path: "/v1.0/groups?$filter=mailEnabled eq true and securityEnabled eq false", name: "Microsoft 365 groups" },
      { method: "GET", path: "/v1.0/groups?$filter=securityEnabled eq true", name: "Security groups" },
      { method: "GET", path: "/v1.0/groups/{group-id}/members", name: "Group members" },
      { method: "GET", path: "/v1.0/groups/{group-id}/owners", name: "Group owners" },
      { method: "GET", path: "/v1.0/groups/{group-id}/transitiveMembers", name: "Transitive members" },
      { method: "POST", path: "/v1.0/groups", name: "Create group" },
      { method: "GET", path: "/beta/groups?$filter=membershipRuleProcessingState eq 'On'", name: "Dynamic groups" },
    ],
  },
  {
    name: "Mail",
    queries: [
      { method: "GET", path: "/v1.0/me/messages?$top=10", name: "Recent messages" },
      { method: "GET", path: "/v1.0/me/mailFolders", name: "Mail folders" },
      { method: "GET", path: '/v1.0/me/messages?$search="subject:meeting"', name: "Search messages" },
      { method: "GET", path: "/v1.0/me/messages?$filter=hasAttachments eq true", name: "Messages with attachments" },
      { method: "GET", path: "/v1.0/me/messages?$filter=isRead eq false", name: "Unread messages" },
      { method: "GET", path: "/v1.0/me/mailFolders/inbox/messageRules", name: "Inbox rules" },
      { method: "POST", path: "/v1.0/me/sendMail", name: "Send mail" },
    ],
  },
  {
    name: "Calendar",
    queries: [
      { method: "GET", path: "/v1.0/me/events?$top=10", name: "My events" },
      { method: "GET", path: "/v1.0/me/calendar/calendarView?startDateTime=2026-01-01T00:00:00Z&endDateTime=2026-12-31T00:00:00Z", name: "Calendar view" },
      { method: "GET", path: "/v1.0/me/calendars", name: "My calendars" },
      { method: "GET", path: "/v1.0/me/events?$filter=isOnlineMeeting eq true", name: "Online meetings" },
      { method: "POST", path: "/v1.0/me/events", name: "Create event" },
      { method: "GET", path: "/v1.0/me/calendarGroups", name: "Calendar groups" },
    ],
  },
  {
    name: "Teams",
    queries: [
      { method: "GET", path: "/v1.0/me/joinedTeams", name: "My teams" },
      { method: "GET", path: "/v1.0/teams/{team-id}/channels", name: "Team channels" },
      { method: "GET", path: "/v1.0/teams/{team-id}/members", name: "Team members" },
      { method: "GET", path: "/v1.0/me/chats", name: "My chats" },
      { method: "GET", path: "/v1.0/me/chats/{chat-id}/messages", name: "Chat messages" },
      { method: "GET", path: "/v1.0/teams/{team-id}/channels/{channel-id}/messages", name: "Channel messages" },
      { method: "GET", path: "/beta/teams/{team-id}/tags", name: "Team tags" },
    ],
  },
  {
    name: "OneDrive / SharePoint",
    queries: [
      { method: "GET", path: "/v1.0/me/drive", name: "My drive" },
      { method: "GET", path: "/v1.0/me/drive/root/children", name: "Root folder items" },
      { method: "GET", path: "/v1.0/me/drive/recent", name: "Recent files" },
      { method: "GET", path: "/v1.0/me/drive/sharedWithMe", name: "Shared with me" },
      { method: "GET", path: "/v1.0/sites/root", name: "Root SharePoint site" },
      { method: "GET", path: "/v1.0/sites?search=*", name: "Search all sites" },
      { method: "GET", path: "/v1.0/sites/{site-id}/lists", name: "Site lists" },
      { method: "GET", path: "/v1.0/sites/{site-id}/drives", name: "Site document libraries" },
      { method: "GET", path: "/v1.0/sites/{site-id}/lists/{list-id}/items", name: "List items" },
      { method: "GET", path: "/v1.0/drives/{drive-id}/root/search(q='budget')", name: "Search in drive" },
    ],
  },
  {
    name: "Planner / Tasks",
    queries: [
      { method: "GET", path: "/v1.0/me/planner/tasks", name: "My Planner tasks" },
      { method: "GET", path: "/v1.0/groups/{group-id}/planner/plans", name: "Group plans" },
      { method: "GET", path: "/v1.0/planner/plans/{plan-id}/buckets", name: "Plan buckets" },
      { method: "GET", path: "/v1.0/planner/plans/{plan-id}/tasks", name: "Plan tasks" },
      { method: "GET", path: "/v1.0/me/todo/lists", name: "To Do lists" },
      { method: "GET", path: "/v1.0/me/todo/lists/{list-id}/tasks", name: "To Do tasks" },
    ],
  },
  {
    name: "App Registrations",
    queries: [
      { method: "GET", path: "/v1.0/applications", name: "List applications" },
      { method: "GET", path: "/v1.0/applications?$filter=signInAudience eq 'AzureADMultipleOrgs'", name: "Multi-tenant apps" },
      { method: "GET", path: "/v1.0/servicePrincipals", name: "Service principals" },
      { method: "GET", path: "/v1.0/servicePrincipals?$filter=appId eq '{app-id}'", name: "SP by app ID" },
      { method: "GET", path: "/v1.0/oauth2PermissionGrants", name: "OAuth2 permission grants" },
      { method: "GET", path: "/v1.0/applications/{application-id}/owners", name: "App owners" },
      { method: "GET", path: "/v1.0/applications?$select=id,displayName,passwordCredentials,keyCredentials&$top=50", name: "Apps with credentials" },
      { method: "GET", path: "/v1.0/servicePrincipals/{servicePrincipal-id}/appRoleAssignedTo", name: "SP role assignments" },
    ],
  },
  {
    name: "Entra ID",
    queries: [
      { method: "GET", path: "/v1.0/identity/conditionalAccess/policies", name: "Conditional Access policies" },
      { method: "GET", path: "/v1.0/identity/conditionalAccess/namedLocations", name: "Named locations" },
      { method: "GET", path: "/v1.0/identityProtection/riskyUsers", name: "Risky users" },
      { method: "GET", path: "/v1.0/identityProtection/riskDetections", name: "Risk detections" },
      { method: "GET", path: "/beta/identityProtection/riskyServicePrincipals", name: "Risky service principals" },
      { method: "GET", path: "/v1.0/policies/authenticationMethodsPolicy", name: "Auth methods policy" },
      { method: "GET", path: "/beta/policies/authenticationMethodsPolicy/authenticationMethodConfigurations", name: "Auth method configs" },
      { method: "GET", path: "/v1.0/policies/tokenLifetimePolicies", name: "Token lifetime policies" },
      { method: "GET", path: "/beta/identity/userFlows", name: "User flows" },
    ],
  },
  {
    name: "Directory Roles",
    queries: [
      { method: "GET", path: "/v1.0/directoryRoles", name: "Active directory roles" },
      { method: "GET", path: "/v1.0/directoryRoles/{directoryRole-id}/members", name: "Role members" },
      { method: "GET", path: "/v1.0/roleManagement/directory/roleAssignments", name: "Role assignments" },
      { method: "GET", path: "/v1.0/roleManagement/directory/roleDefinitions", name: "Role definitions" },
      { method: "GET", path: "/v1.0/domains", name: "Domains" },
      { method: "GET", path: "/v1.0/organization", name: "Organization details" },
      { method: "GET", path: "/v1.0/subscribedSkus", name: "Subscribed licenses" },
      { method: "GET", path: "/beta/directory/deletedItems/microsoft.graph.user", name: "Deleted users" },
      { method: "GET", path: "/beta/directory/deletedItems/microsoft.graph.group", name: "Deleted groups" },
    ],
  },
  {
    name: "Security",
    queries: [
      { method: "GET", path: "/v1.0/security/alerts_v2", name: "Security alerts" },
      { method: "GET", path: "/v1.0/security/incidents", name: "Security incidents" },
      { method: "GET", path: "/beta/security/secureScores?$top=1", name: "Latest secure score" },
      { method: "GET", path: "/beta/security/secureScoreControlProfiles", name: "Secure score controls" },
      { method: "GET", path: "/v1.0/security/threatIntelligence/hosts/{host}", name: "Threat intel host" },
      { method: "GET", path: "/beta/security/attackSimulation/simulations", name: "Attack simulations" },
      { method: "GET", path: "/v1.0/auditLogs/signIns?$top=20", name: "Recent sign-ins" },
      { method: "GET", path: "/v1.0/auditLogs/directoryAudits?$top=20", name: "Directory audit logs" },
      { method: "GET", path: "/beta/auditLogs/provisioning?$top=20", name: "Provisioning logs" },
    ],
  },
  {
    name: "Reports",
    queries: [
      { method: "GET", path: "/v1.0/reports/getEmailActivityUserDetail(period='D7')", name: "Email activity (7 days)" },
      { method: "GET", path: "/v1.0/reports/getOffice365ActiveUserDetail(period='D30')", name: "Active users (30 days)" },
      { method: "GET", path: "/v1.0/reports/getOneDriveUsageAccountDetail(period='D7')", name: "OneDrive usage" },
      { method: "GET", path: "/v1.0/reports/getTeamsUserActivityUserDetail(period='D7')", name: "Teams user activity" },
      { method: "GET", path: "/v1.0/reports/getSharePointSiteUsageDetail(period='D7')", name: "SharePoint site usage" },
      { method: "GET", path: "/beta/reports/getM365AppUserDetail(period='D7')", name: "M365 app usage" },
      { method: "GET", path: "/beta/reports/authenticationMethods/usersRegisteredByMethod", name: "MFA registration" },
      { method: "GET", path: "/beta/reports/credentialUserRegistrationDetails", name: "Credential registration" },
    ],
  },
  {
    name: "Subscriptions",
    queries: [
      { method: "GET", path: "/v1.0/subscriptions", name: "Active subscriptions" },
      { method: "POST", path: "/v1.0/subscriptions", name: "Create subscription" },
      { method: "GET", path: "/v1.0/communications/presences/{user-id}", name: "User presence" },
      { method: "GET", path: "/v1.0/me/activities/recent", name: "Recent activities" },
    ],
  },
  {
    name: "Intune - Devices",
    queries: [
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices", name: "All managed devices" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices?$filter=operatingSystem eq 'Windows'", name: "Windows devices" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices?$filter=operatingSystem eq 'iOS'", name: "iOS devices" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices?$filter=operatingSystem eq 'Android'", name: "Android devices" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices?$filter=operatingSystem eq 'macOS'", name: "macOS devices" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices?$filter=complianceState eq 'noncompliant'", name: "Non-compliant devices" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices?$select=deviceName,operatingSystem,osVersion,complianceState,lastSyncDateTime,userPrincipalName", name: "Devices (key fields)" },
      { method: "GET", path: "/v1.0/deviceManagement/managedDevices/{managedDevice-id}", name: "Get device by ID" },
      { method: "GET", path: "/beta/deviceManagement/managedDevices?$filter=managedDeviceOwnerType eq 'company'", name: "Corporate-owned devices" },
      { method: "GET", path: "/beta/deviceManagement/managedDevices/{managedDevice-id}/detectedApps", name: "Device detected apps" },
      { method: "POST", path: "/v1.0/deviceManagement/managedDevices/{managedDevice-id}/syncDevice", name: "Sync device" },
      { method: "POST", path: "/v1.0/deviceManagement/managedDevices/{managedDevice-id}/rebootNow", name: "Reboot device" },
      { method: "POST", path: "/v1.0/deviceManagement/managedDevices/{managedDevice-id}/retire", name: "Retire device" },
      { method: "POST", path: "/v1.0/deviceManagement/managedDevices/{managedDevice-id}/wipe", name: "Wipe device" },
    ],
  },
  {
    name: "Intune - Compliance",
    queries: [
      { method: "GET", path: "/v1.0/deviceManagement/deviceCompliancePolicies", name: "All compliance policies" },
      { method: "GET", path: "/v1.0/deviceManagement/deviceCompliancePolicies/{deviceCompliancePolicy-id}/deviceStatuses", name: "Policy device statuses" },
      { method: "GET", path: "/v1.0/deviceManagement/deviceCompliancePolicies/{deviceCompliancePolicy-id}/assignments", name: "Policy assignments" },
      { method: "GET", path: "/v1.0/deviceManagement/deviceCompliancePolicyDeviceStateSummary", name: "Compliance state summary" },
      { method: "GET", path: "/beta/deviceManagement/deviceCompliancePolicies/{deviceCompliancePolicy-id}/deviceSettingStateSummaries", name: "Setting state summaries" },
      { method: "GET", path: "/beta/deviceManagement/compliancePolicies", name: "Compliance policies (v2)" },
    ],
  },
  {
    name: "Intune - Config",
    queries: [
      { method: "GET", path: "/v1.0/deviceManagement/deviceConfigurations", name: "All config profiles" },
      { method: "GET", path: "/v1.0/deviceManagement/deviceConfigurations/{deviceConfiguration-id}/assignments", name: "Profile assignments" },
      { method: "GET", path: "/v1.0/deviceManagement/deviceConfigurations/{deviceConfiguration-id}/deviceStatuses", name: "Profile device statuses" },
      { method: "GET", path: "/beta/deviceManagement/configurationPolicies", name: "Settings Catalog policies" },
      { method: "GET", path: "/beta/deviceManagement/configurationPolicies/{deviceManagementConfigurationPolicy-id}/settings", name: "Settings Catalog settings" },
      { method: "GET", path: "/beta/deviceManagement/groupPolicyConfigurations", name: "Group Policy (ADMX)" },
      { method: "GET", path: "/beta/deviceManagement/templates", name: "Security baselines" },
      { method: "GET", path: "/beta/deviceManagement/intents", name: "Endpoint security intents" },
      { method: "GET", path: "/beta/deviceManagement/reusablePolicySettings", name: "Reusable settings" },
    ],
  },
  {
    name: "Intune - Apps",
    queries: [
      { method: "GET", path: "/v1.0/deviceAppManagement/mobileApps", name: "All mobile apps" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/graph.win32LobApp", name: "Win32 apps" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/graph.winGetApp", name: "WinGet apps" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/graph.iosStoreApp", name: "iOS Store apps" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/graph.androidManagedStoreApp", name: "Android Managed apps" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/graph.macOSDmgApp", name: "macOS DMG apps" },
      { method: "GET", path: "/v1.0/deviceAppManagement/mobileApps/graph.macOSLobApp", name: "macOS LOB apps" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/graph.microsoftStoreForBusinessApp", name: "Store for Business apps" },
      { method: "GET", path: "/v1.0/deviceAppManagement/mobileApps/{mobileApp-id}/assignments", name: "App assignments" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/{mobileApp-id}/deviceStatuses", name: "App install statuses" },
      { method: "GET", path: "/v1.0/deviceAppManagement/mobileAppCategories", name: "App categories" },
      { method: "GET", path: "/v1.0/deviceAppManagement/mobileAppConfigurations", name: "App config policies" },
      { method: "GET", path: "/beta/deviceAppManagement/mobileApps/{mobileApp-id}/relationships", name: "App dependencies" },
    ],
  },
  {
    name: "Intune - MAM",
    queries: [
      { method: "GET", path: "/v1.0/deviceAppManagement/managedAppPolicies", name: "All app protection policies" },
      { method: "GET", path: "/v1.0/deviceAppManagement/androidManagedAppProtections", name: "Android app protection" },
      { method: "GET", path: "/v1.0/deviceAppManagement/iosManagedAppProtections", name: "iOS app protection" },
      { method: "GET", path: "/v1.0/deviceAppManagement/mdmWindowsInformationProtectionPolicies", name: "Windows Info Protection" },
      { method: "GET", path: "/v1.0/deviceAppManagement/managedAppRegistrations", name: "App registrations" },
      { method: "GET", path: "/v1.0/deviceAppManagement/managedAppStatuses", name: "App protection status" },
    ],
  },
  {
    name: "Intune - Enrollment",
    queries: [
      { method: "GET", path: "/beta/deviceManagement/windowsAutopilotDeviceIdentities", name: "Autopilot devices" },
      { method: "GET", path: "/beta/deviceManagement/windowsAutopilotDeploymentProfiles", name: "Autopilot profiles" },
      { method: "GET", path: "/v1.0/deviceManagement/deviceEnrollmentConfigurations", name: "Enrollment configs" },
      { method: "GET", path: "/beta/deviceManagement/depOnboardingSettings", name: "Apple DEP tokens" },
      { method: "GET", path: "/beta/deviceManagement/applePushNotificationCertificate", name: "Apple push cert" },
      { method: "GET", path: "/beta/deviceManagement/importedWindowsAutopilotDeviceIdentities", name: "Imported Autopilot devices" },
      { method: "GET", path: "/beta/deviceManagement/deviceCategories", name: "Device categories" },
      { method: "GET", path: "/beta/deviceManagement/windowsFeatureUpdateProfiles", name: "Feature update profiles" },
    ],
  },
  {
    name: "Intune - Scripts",
    queries: [
      { method: "GET", path: "/beta/deviceManagement/deviceManagementScripts", name: "PowerShell scripts" },
      { method: "GET", path: "/beta/deviceManagement/deviceShellScripts", name: "Shell scripts (macOS)" },
      { method: "GET", path: "/beta/deviceManagement/deviceHealthScripts", name: "Proactive remediations" },
      { method: "GET", path: "/beta/deviceManagement/deviceCustomAttributeShellScripts", name: "Custom attribute scripts" },
      { method: "GET", path: "/beta/deviceManagement/deviceManagementScripts/{deviceManagementScript-id}/deviceRunStates", name: "Script run states" },
    ],
  },
  {
    name: "Intune - Updates",
    queries: [
      { method: "GET", path: "/beta/deviceManagement/windowsFeatureUpdateProfiles", name: "Feature update profiles" },
      { method: "GET", path: "/beta/deviceManagement/windowsQualityUpdateProfiles", name: "Quality update profiles" },
      { method: "GET", path: "/beta/deviceManagement/windowsDriverUpdateProfiles", name: "Driver update profiles" },
      { method: "GET", path: "/beta/deviceManagement/softwareUpdateStatusSummary", name: "Update status summary" },
      { method: "GET", path: "/beta/admin/windows/updates/deployments", name: "WUfB deployments" },
      { method: "GET", path: "/beta/admin/windows/updates/catalog/entries", name: "WUfB catalog entries" },
    ],
  },
  {
    name: "Intune - Filters",
    queries: [
      { method: "GET", path: "/beta/deviceManagement/assignmentFilters", name: "Assignment filters" },
      { method: "GET", path: "/beta/deviceManagement/assignmentFilters/{deviceAndAppManagementAssignmentFilter-id}", name: "Filter details" },
      { method: "GET", path: "/beta/deviceManagement/roleScopeTags", name: "Scope tags" },
      { method: "GET", path: "/beta/deviceManagement/windowsAutopilotSettings", name: "Autopilot settings" },
      { method: "GET", path: "/beta/deviceManagement/virtualEndpoint/provisioningPolicies", name: "Cloud PC policies" },
    ],
  },
  {
    name: "Intune - Reporting",
    queries: [
      { method: "GET", path: "/v1.0/deviceManagement/reports", name: "Reports overview" },
      { method: "GET", path: "/v1.0/deviceManagement/auditEvents", name: "Audit events" },
      { method: "GET", path: "/v1.0/deviceManagement/detectedApps", name: "Detected apps" },
      { method: "GET", path: "/beta/deviceManagement/managedDeviceOverview", name: "Device overview" },
      { method: "POST", path: "/beta/deviceManagement/reports/getDeviceNonComplianceReport", name: "Non-compliance report" },
      { method: "POST", path: "/beta/deviceManagement/reports/getConfigurationPolicyNonComplianceReport", name: "Config policy report" },
      { method: "POST", path: "/beta/deviceManagement/reports/getDeviceInstallStatusReport", name: "App install status report" },
      { method: "GET", path: "/beta/deviceManagement/virtualEndpoint/cloudPCs", name: "Cloud PCs" },
      { method: "GET", path: "/beta/deviceManagement/userExperienceAnalyticsOverview", name: "UX Analytics overview" },
      { method: "GET", path: "/beta/deviceManagement/userExperienceAnalyticsDeviceScores", name: "UX Analytics scores" },
    ],
  },
  {
    name: "Intune - RBAC",
    queries: [
      { method: "GET", path: "/v1.0/deviceManagement/roleDefinitions", name: "Role definitions" },
      { method: "GET", path: "/v1.0/deviceManagement/roleAssignments", name: "Role assignments" },
      { method: "GET", path: "/beta/deviceManagement/resourceOperations", name: "Resource operations" },
      { method: "GET", path: "/beta/deviceManagement/roleScopeTags", name: "Scope tags" },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

const METHOD_CLASSES: Record<string, string> = {
  GET: "text-method-get bg-method-get/10",
  POST: "text-method-post bg-method-post/10",
  PUT: "text-method-put bg-method-put/10",
  PATCH: "text-method-patch bg-method-patch/10",
  DELETE: "text-method-delete bg-method-delete/10",
};

function getBaseUrl() {
  return getGraphEndpoint(getSelectedCloudEnvironment());
}

// ── Icons ───────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-text-muted"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
    >
      <polyline
        points="9 6 15 12 9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SamplesIcon() {
  return (
    <svg
      aria-hidden="true"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      className="text-text-muted"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="14 2 14 8 20 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────

export function SampleQueries({ onSelectQuery }: SampleQueriesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(SAMPLE_CATEGORIES.filter((c) => c.expanded).map((c) => c.name)),
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SAMPLE_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return SAMPLE_CATEGORIES.map((cat) => ({
      ...cat,
      queries: cat.queries.filter(
        (query) =>
          query.name.toLowerCase().includes(q) ||
          query.path.toLowerCase().includes(q) ||
          query.method.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.queries.length > 0);
  }, [searchQuery]);

  function toggleCategory(name: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function handleSelect(query: SampleQuery) {
    const url = `${getBaseUrl()}${query.path}`;
    window.dispatchEvent(
      new CustomEvent("select-query", {
        detail: { method: query.method, url },
      }),
    );
    onSelectQuery?.({ method: query.method, url });
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-2">
        <div className="flex items-center gap-2 rounded border border-border-subtle bg-bg-elevated px-2 py-1.5">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search samples…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search samples"
            name="search-samples"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-xs text-text-primary placeholder:text-text-muted outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <SamplesIcon />
            <p className="text-xs text-text-muted">No matching samples</p>
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = isSearching || expandedCategories.has(category.name);
            return (
              <div key={category.name}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="sticky top-0 z-10 flex w-full cursor-pointer items-center gap-1.5 bg-bg-deep px-3 pt-3 pb-1 transition-colors hover:text-text-secondary"
                >
                  <ChevronIcon expanded={isExpanded} />
                  <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    {category.name}
                  </span>
                  <span className="ml-auto text-[10px] tabular-nums text-text-tertiary">
                    {category.queries.length}
                  </span>
                </button>

                {/* Query items */}
                {isExpanded && (
                  <div className="flex flex-col gap-0.5 px-2 pb-1">
                    {category.queries.map((query) => (
                      <button
                        key={`${query.method}-${query.path}`}
                        onClick={() => handleSelect(query)}
                        title={`${query.method} ${query.path}`}
                        className="group flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-bg-hover"
                      >
                        <span
                          className={`shrink-0 rounded px-1 py-px font-mono text-[10px] font-bold uppercase leading-tight ${METHOD_CLASSES[query.method] ?? "text-text-muted bg-bg-elevated"}`}
                        >
                          {query.method}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
                          {query.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
