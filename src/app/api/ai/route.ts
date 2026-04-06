import { NextRequest, NextResponse } from "next/server";

interface NLQueryResult {
  method: string;
  url: string;
  body: string | null;
}

export async function POST(request: NextRequest) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!endpoint || !key || !deployment) {
    return NextResponse.json(
      { error: "Azure OpenAI is not configured on the server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { prompt } = body as { prompt?: string };

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "\"prompt\" is required and must be a string." },
      { status: 400 },
    );
  }

  if (prompt.length > 2000) {
    return NextResponse.json(
      { error: "Prompt must be 2000 characters or fewer." },
      { status: 400 },
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const systemPrompt = [
    `You are a Microsoft Graph API expert. Today is ${today}. Convert natural language to a Graph API call.`,
    'Return ONLY valid json: {"method":"GET","url":"https://graph.microsoft.com/v1.0/...","body":null}',
    "Rules: URL MUST include version: https://graph.microsoft.com/v1.0/... or /beta/..., NEVER omit v1.0 or beta. NEVER use any()/all() lambdas, lowercase OData functions (startswith/endswith/contains), single-quote strings, booleans/dates/GUIDs unquoted.",
    "Endpoints: Users /users, Groups /groups, Devices /deviceManagement/managedDevices, CA /identity/conditionalAccess/policies, Apps /deviceAppManagement/mobileApps, Alerts /security/alerts_v2, Sign-ins /auditLogs/signIns, Audit /auditLogs/directoryAudits, Risky users /identityProtection/riskyUsers, Mail /me/messages, Calendar /me/events, Teams /me/joinedTeams, Drive /me/drive, Sites /sites, Planner /me/planner/tasks, Applications /applications.",
    "Special: Windows 11 = operatingSystem eq 'Windows' and osVersion ge '10.0.26200' (property is operatingSystem NOT osType), M365 groups = mailEnabled eq true and securityEnabled eq false, Admin roles = /roleManagement/directory/roleAssignments?$expand=principal, App credentials = $select=id,displayName,passwordCredentials,keyCredentials (no filter), Mobile app types = /graph.win32LobApp URL segment on beta, Risky sign-ins = /auditLogs/signIns?$filter=riskLevelDuringSignIn ne 'none' (NOT /identityProtection/riskySignIns which does not exist).",
  ].join(" ");

  const apiUrl = `${endpoint.replace(/\/$/, "")}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Azure OpenAI error (${res.status}): ${err}`);
    return NextResponse.json(
      { error: `Azure OpenAI request failed (${res.status}).` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    return NextResponse.json(
      { error: "No response from Azure OpenAI." },
      { status: 502 },
    );
  }

  let parsed: NLQueryResult;
  try {
    parsed = JSON.parse(content) as NLQueryResult;
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response." },
      { status: 502 },
    );
  }

  if (!parsed.method || !parsed.url) {
    return NextResponse.json(
      { error: "Invalid response format from AI." },
      { status: 502 },
    );
  }

  // Fix missing API version (e.g. /graph.microsoft.com/auditLogs → /v1.0/auditLogs)
  parsed.url = parsed.url.replace(
    /^(https:\/\/graph\.microsoft\.com)\/(?!v1\.0\/|beta\/)/,
    "$1/v1.0/",
  );

  return NextResponse.json(parsed);
}
