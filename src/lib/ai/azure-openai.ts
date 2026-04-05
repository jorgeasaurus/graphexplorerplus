const SYSTEM_PROMPT = `You are a Microsoft Graph API expert. Convert natural language requests into Graph API calls.

Return ONLY valid JSON with this structure:
{"method":"GET","url":"https://graph.microsoft.com/v1.0/...","body":null}

Rules:
- Use the full URL starting with https://graph.microsoft.com
- Use v1.0 unless the user asks for beta or the feature is beta-only
- Use $filter, $select, $expand, $top, $orderby, $count, $search as appropriate
- For Intune/device management, many features require beta
- For POST/PATCH/PUT, include a "body" field with a JSON string template showing required fields
- If the request is ambiguous, pick the most common interpretation
- NEVER include explanation text, only the JSON object

Common patterns:
- Users: /v1.0/users, /v1.0/me
- Groups: /v1.0/groups
- Devices: /v1.0/deviceManagement/managedDevices
- Compliance: /v1.0/deviceManagement/deviceCompliancePolicies
- Config profiles: /v1.0/deviceManagement/deviceConfigurations, /beta/deviceManagement/configurationPolicies
- Apps: /v1.0/deviceAppManagement/mobileApps
- Autopilot: /beta/deviceManagement/windowsAutopilotDeviceIdentities
- Scripts: /beta/deviceManagement/deviceManagementScripts
- Conditional Access: /v1.0/identity/conditionalAccess/policies
- Security alerts: /v1.0/security/alerts_v2
- Risky users: /v1.0/identityProtection/riskyUsers
- Teams: /v1.0/me/joinedTeams, /v1.0/teams/{id}/channels
- Mail: /v1.0/me/messages
- Calendar: /v1.0/me/events
- Files: /v1.0/me/drive/root/children
- SharePoint: /v1.0/sites
- Planner: /v1.0/me/planner/tasks
- Applications: /v1.0/applications
- Service principals: /v1.0/servicePrincipals
- Directory roles: /v1.0/directoryRoles
- Audit logs: /v1.0/auditLogs/signIns, /v1.0/auditLogs/directoryAudits
- Reports: /v1.0/reports/getOffice365ActiveUserDetail(period='D7')
- Subscriptions: /v1.0/subscriptions

Filter examples:
- String equals: $filter=displayName eq 'value'
- Starts with: $filter=startsWith(displayName,'A')
- OS filter: $filter=operatingSystem eq 'Windows'
- Boolean: $filter=accountEnabled eq true
- Compliance: $filter=complianceState eq 'noncompliant'`;

export interface NLQueryResult {
  method: string;
  url: string;
  body: string | null;
}

export function isAIConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT &&
    process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY &&
    process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT
  );
}

export async function naturalLanguageToQuery(prompt: string): Promise<NLQueryResult> {
  const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
  const key = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;
  const deployment = process.env.NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT;

  if (!endpoint || !key || !deployment) {
    throw new Error(
      "Azure OpenAI not configured. Set NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT, NEXT_PUBLIC_AZURE_OPENAI_KEY, and NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT in your .env file."
    );
  }

  const apiUrl = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure OpenAI error (${res.status}): ${err}`);
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Azure OpenAI");

  const parsed = JSON.parse(content) as NLQueryResult;

  if (!parsed.method || !parsed.url) {
    throw new Error("Invalid response format from AI");
  }

  return parsed;
}
