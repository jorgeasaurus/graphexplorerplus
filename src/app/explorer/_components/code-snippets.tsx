"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────

interface CodeSnippetsProps {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

type Language = "javascript" | "csharp" | "python" | "powershell" | "go" | "java" | "php" | "curl";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "powershell", label: "PowerShell" },
  { id: "javascript", label: "JavaScript" },
  { id: "csharp", label: "C#" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "php", label: "PHP" },
  { id: "curl", label: "cURL" },
];

const SDK_LINKS: Record<Language, { sdk: string; docs: string } | null> = {
  javascript: { sdk: "https://www.npmjs.com/package/@microsoft/microsoft-graph-client", docs: "https://learn.microsoft.com/en-us/graph/sdks/sdk-installation#install-the-microsoft-graph-javascript-sdk" },
  csharp: { sdk: "https://www.nuget.org/packages/Microsoft.Graph", docs: "https://aka.ms/csharpsdk" },
  python: { sdk: "https://pypi.org/project/msgraph-sdk/", docs: "https://learn.microsoft.com/en-us/graph/sdks/sdk-installation#install-the-microsoft-graph-python-sdk" },
  powershell: { sdk: "https://www.powershellgallery.com/packages/Microsoft.Graph", docs: "https://aka.ms/pshellsdk" },
  go: { sdk: "https://github.com/microsoftgraph/msgraph-sdk-go", docs: "https://aka.ms/graphgosdk" },
  java: { sdk: "https://github.com/microsoftgraph/msgraph-sdk-java", docs: "https://learn.microsoft.com/en-us/graph/sdks/sdk-installation#install-the-microsoft-graph-java-sdk" },
  php: { sdk: "https://github.com/microsoftgraph/msgraph-sdk-php", docs: "https://learn.microsoft.com/en-us/graph/sdks/sdk-installation#install-the-microsoft-graph-php-sdk" },
  curl: null,
};

// ── Snippet Generators ─────────────────────────────────────

// Extract the API path (e.g. "/me" or "/users") from a full Graph URL
function extractApiPath(url: string): { version: string; path: string } {
  const match = url.match(/(?:graph\.microsoft\.com\/)?(v1\.0|beta)(\/.*)/);
  if (match) return { version: match[1]!, path: match[2]! };
  // Fallback: try to extract relative path
  const relMatch = url.match(/^\/(v1\.0|beta)(\/.*)/);
  if (relMatch) return { version: relMatch[1]!, path: relMatch[2]! };
  return { version: "v1.0", path: url.startsWith("/") ? url : `/${url}` };
}

function generateJavaScript(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { path } = extractApiPath(url);
  const methodLower = method.toLowerCase();

  const bodyArg = body ? `${body}` : "";
  const callChain = body
    ? `.api("${path}")\n  .${methodLower}(${bodyArg})`
    : `.api("${path}")\n  .${methodLower}()`;

  return `import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider }
  from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { DeviceCodeCredential } from "@azure/identity";

const credential = new DeviceCodeCredential({
  tenantId: "{tenant-id}",
  clientId: "{client-id}",
});

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const client = Client.initWithMiddleware({ authProvider });

const result = await client
  ${callChain};

console.log(JSON.stringify(result, null, 2));`;
}

function generateCSharp(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { path } = extractApiPath(url);
  const methodMap: Record<string, string> = {
    GET: "GetAsync", POST: "PostAsync", PUT: "PutAsync", PATCH: "PatchAsync", DELETE: "DeleteAsync",
  };
  const httpMethod = methodMap[method] ?? "GetAsync";

  const bodyBlock = body
    ? `\nvar requestBody = new StringContent(
    @"${body.replace(/"/g, '""')}",
    Encoding.UTF8,
    "application/json");\n`
    : "";

  const sendCall = body
    ? `var response = await graphClient.RequestAdapter
    .SendPrimitiveAsync<Stream>(
        new RequestInformation
        {
            HttpMethod = Method.${method},
            UrlTemplate = "{+baseurl}${path}",
            Content = requestBody,
        });`
    : `var response = await graphClient.RequestAdapter
    .SendPrimitiveAsync<Stream>(
        new RequestInformation
        {
            HttpMethod = Method.${method},
            UrlTemplate = "{+baseurl}${path}",
        });`;

  return `using Microsoft.Graph;
using Azure.Identity;

var scopes = new[] { "https://graph.microsoft.com/.default" };
var credential = new DeviceCodeCredential(new DeviceCodeCredentialOptions
{
    TenantId = "{tenant-id}",
    ClientId = "{client-id}",
});

var graphClient = new GraphServiceClient(credential, scopes);
${bodyBlock}
${sendCall}

using var reader = new StreamReader(response);
Console.WriteLine(await reader.ReadToEndAsync());`;
}

function generatePython(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { path } = extractApiPath(url);
  const methodLower = method.toLowerCase();

  const bodyBlock = body
    ? `\nbody = ${body}\n`
    : "";
  const bodyArg = body ? ", content=body" : "";

  return `from azure.identity import DeviceCodeCredential
from msgraph import GraphServiceClient
from msgraph_core import GraphClientFactory
import httpx

credential = DeviceCodeCredential(
    tenant_id="{tenant-id}",
    client_id="{client-id}",
)

scopes = ["https://graph.microsoft.com/.default"]
client = GraphServiceClient(credentials=credential, scopes=scopes)
${bodyBlock}
# For arbitrary Graph API paths, use the request adapter
response = await client.request_adapter.send_primitive_async(
    request_info=client.request_adapter.create_request_information(
        method="${methodLower}",
        url_template="{+baseurl}${path}"${bodyArg}
    ),
    response_type=bytes
)

print(response.decode("utf-8"))`;
}

function generatePowerShell(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { version, path } = extractApiPath(url);
  const uri = "/" + version + path;
  const scope = guessScope(path);

  const lines: string[] = [
    "# Requires Microsoft.Graph module",
    "# Install-Module Microsoft.Graph -Scope CurrentUser",
    "",
    'Connect-MgGraph -Scopes "' + scope + '"',
    "",
  ];

  if (body) {
    lines.push("$body = @'");
    lines.push(body);
    lines.push("'@");
    lines.push("");
  }

  lines.push("Invoke-MgGraphRequest `");
  lines.push('    -Uri "' + uri + '" `');

  if (body) {
    lines.push("    -Method " + method + " `");
    lines.push("    -Body $body `");
    lines.push("    -ContentType 'application/json' |");
  } else {
    lines.push("    -Method " + method + " |");
  }

  lines.push("    ConvertTo-Json -Depth 10");

  return lines.join("\n");
}

function guessScope(path: string): string {
  const p = path.toLowerCase();
  if (p.includes("devicemanagement") || p.includes("deviceapp"))
    return "DeviceManagementConfiguration.Read.All";
  if (p.includes("user") || p.startsWith("/me"))
    return "User.Read.All";
  if (p.includes("group")) return "Group.Read.All";
  if (p.includes("mail") || p.includes("message"))
    return "Mail.Read";
  if (p.includes("calendar") || p.includes("event"))
    return "Calendars.Read";
  if (p.includes("drive") || p.includes("file"))
    return "Files.Read.All";
  if (p.includes("team")) return "Team.ReadBasic.All";
  if (p.includes("application") || p.includes("serviceprincipal"))
    return "Application.Read.All";
  if (p.includes("directory") || p.includes("role"))
    return "Directory.Read.All";
  if (p.includes("security")) return "SecurityEvents.Read.All";
  return "User.Read";
}

function generateGo(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { path } = extractApiPath(url);

  const imports = body
    ? `\t"context"
\t"fmt"
\t"strings"

\tazidentity "github.com/Azure/azure-sdk-for-go/sdk/azidentity"
\tmsgraphsdk "github.com/microsoftgraph/msgraph-sdk-go"
\tabstractions "github.com/microsoft/kiota-abstractions-go"`
    : `\t"context"
\t"fmt"

\tazidentity "github.com/Azure/azure-sdk-for-go/sdk/azidentity"
\tmsgraphsdk "github.com/microsoftgraph/msgraph-sdk-go"
\tabstractions "github.com/microsoft/kiota-abstractions-go"`;

  const bodySetup = body
    ? `\n\treqBody := strings.NewReader(\`${body}\`)\n`
    : "";

  return `package main

import (
${imports}
)

func main() {
\tcred, _ := azidentity.NewDeviceCodeCredential(&azidentity.DeviceCodeCredentialOptions{
\t\tTenantID: "{tenant-id}",
\t\tClientID: "{client-id}",
\t})

\tclient, _ := msgraphsdk.NewGraphServiceClientWithCredentials(
\t\tcred, []string{"https://graph.microsoft.com/.default"},
\t)
${bodySetup}
\treqInfo := abstractions.NewRequestInformation()
\treqInfo.Method = abstractions.${method}
\treqInfo.UrlTemplate = "{+baseurl}${path}"

\tresult, _ := client.RequestAdapter().SendPrimitive(
\t\tcontext.Background(), reqInfo, "string", nil,
\t)

\tfmt.Println(result)
}`;
}

function generateJava(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { path } = extractApiPath(url);
  const methodUpper = method.toUpperCase();

  const bodyBlock = body
    ? `\nString requestBody = "${body.replace(/"/g, '\\"').replace(/\n/g, "\\n")}";\n`
    : "";

  const bodyArg = body ? ", requestBody" : "";

  return `import com.azure.identity.DeviceCodeCredentialBuilder;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.microsoft.kiota.RequestInformation;
import com.microsoft.kiota.HttpMethod;

DeviceCodeCredential credential = new DeviceCodeCredentialBuilder()
    .tenantId("{tenant-id}")
    .clientId("{client-id}")
    .build();

String[] scopes = new String[]{"https://graph.microsoft.com/.default"};
GraphServiceClient graphClient = new GraphServiceClient(credential, scopes);
${bodyBlock}
RequestInformation requestInfo = new RequestInformation();
requestInfo.httpMethod = HttpMethod.${methodUpper};
requestInfo.urlTemplate = "{+baseurl}${path}";

var result = graphClient.getRequestAdapter()
    .sendPrimitive(requestInfo, null, String.class${bodyArg});

System.out.println(result);`;
}

function generatePhp(method: string, url: string, _headers?: Record<string, string>, body?: string): string {
  const { path } = extractApiPath(url);
  const methodLower = method.toLowerCase();

  const bodyBlock = body
    ? `\n$body = json_decode('${body.replace(/'/g, "\\'")}', true);\n`
    : "";

  const bodyArg = body ? ", $body" : "";

  return `<?php
use Microsoft\\Graph\\GraphServiceClient;
use Microsoft\\Kiota\\Authentication\\Php\\PhpLeagueAuthenticationProvider;

$tokenRequestContext = new \\Microsoft\\Kiota\\Authentication\\Php\\PhpLeagueAccessTokenProvider(
    '{tenant-id}',
    '{client-id}',
    '{client-secret}',
    ['https://graph.microsoft.com/.default']
);

$authProvider = new PhpLeagueAuthenticationProvider($tokenRequestContext);
$graphClient = new GraphServiceClient($authProvider);
${bodyBlock}
$requestInfo = new \\Microsoft\\Kiota\\Abstractions\\RequestInformation();
$requestInfo->httpMethod = \\Microsoft\\Kiota\\Abstractions\\HttpMethod::${methodLower.charAt(0).toUpperCase() + methodLower.slice(1)}();
$requestInfo->urlTemplate = '{+baseurl}${path}';

$result = $graphClient->getRequestAdapter()
    ->sendPrimitiveAsync($requestInfo, 'string'${bodyArg})
    ->wait();

echo $result;`;
}

function generateCurl(method: string, url: string, headers?: Record<string, string>, body?: string): string {
  const customHeaders = Object.entries(headers ?? {})
    .filter(([k]) => k.toLowerCase() !== "content-type")
    .map(([k, v]) => ` \\\n  -H "${k}: ${v}"`)
    .join("");

  const bodyArg = body ? ` \\\n  -d '${body}'` : "";

  return `curl -X ${method} "${url}" \\
  -H "Authorization: Bearer {access_token}" \\
  -H "Content-Type: application/json"${customHeaders}${bodyArg}`;
}

const GENERATORS: Record<Language, (m: string, u: string, h?: Record<string, string>, b?: string) => string> = {
  javascript: generateJavaScript,
  csharp: generateCSharp,
  python: generatePython,
  powershell: generatePowerShell,
  go: generateGo,
  java: generateJava,
  php: generatePhp,
  curl: generateCurl,
};

// ── Syntax Highlighting ────────────────────────────────────

const KEYWORD_PATTERNS: Record<Language, RegExp> = {
  javascript: /\b(const|let|var|await|async|function|import|from|export|return|new|if|else|try|catch|throw)\b/g,
  csharp: /\b(using|var|new|await|async|class|public|private|static|void|string|int|bool|null|return|if|else|try|catch|throw)\b/g,
  python: /\b(import|from|def|class|return|if|else|elif|try|except|raise|with|as|print|None|True|False|await)\b/g,
  powershell: /(\$\w+|\b(\w+-Mg\w+|Connect-MgGraph|Invoke-MgGraphRequest|ConvertTo-Json|ConvertFrom-Json|Install-Module)\b|-Uri\b|-Method\b|-Body\b|-ContentType\b|-Depth\b|-Scopes\b|-Scope\b)/g,
  go: /\b(package|import|func|var|defer|nil|string|main|context)\b/g,
  java: /\b(import|new|var|public|private|static|void|String|class|return|if|else|try|catch|throw|final)\b/g,
  php: /\b(use|new|echo|function|return|if|else|try|catch|throw|class|public|private|null)\b/g,
  curl: /\b(curl)\b/g,
};

const METHOD_CALL_PATTERNS: Record<Language, RegExp> = {
  javascript: /\b(Client\.initWithMiddleware|TokenCredentialAuthenticationProvider|DeviceCodeCredential|client\.api|\.get|\.post|\.put|\.patch|\.delete|console\.log|JSON\.stringify)\b/g,
  csharp: /\b(GraphServiceClient|DeviceCodeCredential|DeviceCodeCredentialOptions|RequestInformation|SendPrimitiveAsync|RequestAdapter|StreamReader|ReadToEndAsync|Console\.WriteLine|Method\.\w+|Encoding\.UTF8|StringContent)\b/g,
  python: /\b(GraphServiceClient|DeviceCodeCredential|GraphClientFactory|request_adapter|send_primitive_async|create_request_information|decode)\b/g,
  powershell: /(?:^|\s)(@\{|@')/g,
  go: /\b(azidentity\.NewDeviceCodeCredential|msgraphsdk\.NewGraphServiceClientWithCredentials|abstractions\.NewRequestInformation|RequestAdapter|SendPrimitive|fmt\.Println|strings\.NewReader)\b/g,
  java: /\b(GraphServiceClient|DeviceCodeCredential|DeviceCodeCredentialBuilder|RequestInformation|HttpMethod|getRequestAdapter|sendPrimitive|System\.out\.println)\b/g,
  php: /\b(GraphServiceClient|PhpLeagueAuthenticationProvider|PhpLeagueAccessTokenProvider|RequestInformation|HttpMethod|getRequestAdapter|sendPrimitiveAsync|json_decode)\b/g,
  curl: /(-X|-H|-d)\b/g,
};

function highlightCode(code: string, language: Language): React.ReactNode[] {
  const lines = code.split("\n");

  return lines.map((line, lineIdx) => {
    const segments: React.ReactNode[] = [];
    const kwPattern = KEYWORD_PATTERNS[language];
    const fnPattern = METHOD_CALL_PATTERNS[language];

    // Combine all matches with their type, then sort by position
    type Match = { start: number; end: number; text: string; type: "keyword" | "string" | "comment" | "fn" };
    const matches: Match[] = [];

    // Strings
    const strRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`)/g;
    let m: RegExpExecArray | null;
    while ((m = strRegex.exec(line)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "string" });
    }

    // Comments
    const commentRegex = /(\/\/.*$|#.*$)/g;
    while ((m = commentRegex.exec(line)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "comment" });
    }

    // Keywords
    kwPattern.lastIndex = 0;
    while ((m = kwPattern.exec(line)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "keyword" });
    }

    // Function calls
    fnPattern.lastIndex = 0;
    while ((m = fnPattern.exec(line)) !== null) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], type: "fn" });
    }

    // Sort by start position, prioritize comments > strings > fn > keyword
    const priority: Record<string, number> = { comment: 0, string: 1, fn: 2, keyword: 3 };
    matches.sort((a, b) => a.start - b.start || priority[a.type]! - priority[b.type]!);

    // Remove overlapping matches (earlier/higher-priority wins)
    const resolved: Match[] = [];
    let lastEnd = 0;
    for (const match of matches) {
      if (match.start >= lastEnd) {
        resolved.push(match);
        lastEnd = match.end;
      }
    }

    // Build segments
    let pos = 0;
    for (const match of resolved) {
      if (match.start > pos) {
        segments.push(
          <span key={`${lineIdx}-t-${pos}`} className="text-text-primary">
            {line.slice(pos, match.start)}
          </span>,
        );
      }

      const colorClass =
        match.type === "keyword"
          ? "text-method-patch"
          : match.type === "string"
            ? "text-success"
            : match.type === "comment"
              ? "text-text-muted italic"
              : "text-info";

      segments.push(
        <span key={`${lineIdx}-${match.type}-${match.start}`} className={colorClass}>
          {match.text}
        </span>,
      );
      pos = match.end;
    }

    if (pos < line.length) {
      segments.push(
        <span key={`${lineIdx}-t-${pos}`} className="text-text-primary">
          {line.slice(pos)}
        </span>,
      );
    }

    if (segments.length === 0) {
      segments.push(<span key={`${lineIdx}-empty`}>{" "}</span>);
    }

    return segments;
  });
}

// ── Icons ──────────────────────────────────────────────────

function ClipboardIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────

export function CodeSnippets({ method, url, headers, body }: CodeSnippetsProps) {
  const [activeLanguage, setActiveLanguage] = useState<Language>("powershell");
  const [copied, setCopied] = useState(false);

  const snippet = GENERATORS[activeLanguage](method, url, headers, body);
  const highlighted = highlightCode(snippet, activeLanguage);

  const lineCount = snippet.split("\n").length;
  const gutterWidth = String(lineCount).length;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [snippet]);

  return (
    <div className="flex h-full flex-col">
      {/* ── Language Tabs ───────────────────────────────────── */}
      <div className="flex items-end gap-1 border-b border-border-subtle px-3 pt-1">
        {LANGUAGES.map((lang) => {
          const isActive = activeLanguage === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => setActiveLanguage(lang.id)}
              className={`relative px-2.5 pb-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {lang.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
              )}
            </button>
          );
        })}

        {/* Spacer */}
        <div className="flex-1" />

        {/* SDK links */}
        {SDK_LINKS[activeLanguage] && (
          <div className="mb-1 flex items-center gap-2">
            <a
              href={SDK_LINKS[activeLanguage]!.sdk}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] text-text-tertiary transition-colors hover:bg-bg-hover hover:text-accent"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              SDK
            </a>
            <a
              href={SDK_LINKS[activeLanguage]!.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] text-text-tertiary transition-colors hover:bg-bg-hover hover:text-accent"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              Docs
            </a>
          </div>
        )}

        {/* Copy button */}
        <button
          onClick={() => void handleCopy()}
          className="mb-1 inline-flex h-6 items-center gap-1 rounded px-1.5 text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
          title="Copy snippet"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <>
              <CheckIcon />
              <span className="text-[10px] text-success">Copied!</span>
            </>
          ) : (
            <ClipboardIcon />
          )}
        </button>
      </div>

      {/* ── Code Area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-bg-deep">
        <pre className="font-mono text-xs leading-5">
          <code>
            {highlighted.map((tokens, idx) => (
              <div key={idx} className="flex">
                <span
                  className="shrink-0 select-none border-r border-border-subtle pr-3 text-right text-text-muted"
                  style={{ width: `${Math.max(gutterWidth * 0.6 + 1.4, 2)}rem` }}
                >
                  {idx + 1}
                </span>
                <span className="pl-4">{tokens}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
