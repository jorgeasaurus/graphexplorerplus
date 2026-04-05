"use client";

import { useState, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────

interface CodeSnippetsProps {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

type Language = "javascript" | "csharp" | "python" | "powershell" | "go" | "curl";

const LANGUAGES: { id: Language; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "csharp", label: "C#" },
  { id: "python", label: "Python" },
  { id: "powershell", label: "PowerShell" },
  { id: "go", label: "Go" },
  { id: "curl", label: "cURL" },
];

// ── Snippet Generators ─────────────────────────────────────

function generateJavaScript(method: string, url: string, headers?: Record<string, string>, body?: string): string {
  const customHeaders = Object.entries(headers ?? {})
    .filter(([k]) => k.toLowerCase() !== "content-type")
    .map(([k, v]) => `\n    "${k}": "${v}"`)
    .join(",");

  const headerBlock = `    "Authorization": "Bearer {access_token}",\n    "Content-Type": "application/json"${customHeaders ? `,${customHeaders}` : ""}`;

  const bodyLine = body ? `,\n  body: JSON.stringify(${body})` : "";

  return `const response = await fetch("${url}", {
  method: "${method}",
  headers: {
${headerBlock}
  }${bodyLine}
});

const data = await response.json();
console.log(data);`;
}

function generateCSharp(method: string, url: string, headers?: Record<string, string>, body?: string): string {
  const methodMap: Record<string, string> = {
    GET: "Get", POST: "Post", PUT: "Put", PATCH: "Patch", DELETE: "Delete",
  };
  const csMethod = methodMap[method] ?? "Get";

  const customHeaders = Object.entries(headers ?? {})
    .filter(([k]) => k.toLowerCase() !== "content-type")
    .map(([k, v]) => `client.DefaultRequestHeaders.Add("${k}", "${v}");`)
    .join("\n");
  const headerLines = customHeaders ? `\n${customHeaders}\n` : "";

  if (body) {
    return `using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", "{access_token}");
${headerLines}
var content = new StringContent(
    @"${body}",
    Encoding.UTF8,
    "application/json");

var response = await client.${csMethod}Async("${url}", content);

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`;
  }

  return `using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", "{access_token}");
${headerLines}
var response = await client.${csMethod}Async("${url}");

var result = await response.Content.ReadAsStringAsync();
Console.WriteLine(result);`;
}

function generatePython(method: string, url: string, headers?: Record<string, string>, body?: string): string {
  const customHeaders = Object.entries(headers ?? {})
    .filter(([k]) => k.toLowerCase() !== "content-type")
    .map(([k, v]) => `\n    "${k}": "${v}"`)
    .join(",");

  const headerBlock = `    "Authorization": "Bearer {access_token}",\n    "Content-Type": "application/json"${customHeaders ? `,${customHeaders}` : ""}`;

  const bodyArg = body ? `,\n    json=${body}` : "";

  return `import requests

headers = {
${headerBlock}
}

response = requests.${method.toLowerCase()}(
    "${url}",
    headers=headers${bodyArg}
)

print(response.json())`;
}

function generatePowerShell(method: string, url: string, headers?: Record<string, string>, body?: string): string {
  const customHeaders = Object.entries(headers ?? {})
    .filter(([k]) => k.toLowerCase() !== "content-type")
    .map(([k, v]) => `\n    "${k}" = "${v}"`)
    .join("");

  const headerBlock = `    "Authorization" = "Bearer {access_token}"\n    "Content-Type" = "application/json"${customHeaders}`;

  const bodyBlock = body
    ? `$body = @'\n${body}\n'@\n\n`
    : "";

  const bodyParam = body ? " `\n    -Body $body" : "";

  return `$headers = @{
${headerBlock}
}

${bodyBlock}$response = Invoke-RestMethod -Uri "${url}" \`
    -Method ${method} \`
    -Headers $headers${bodyParam}

$response | ConvertTo-Json -Depth 10`;
}

function generateGo(method: string, url: string, headers?: Record<string, string>, body?: string): string {
  const customHeaders = Object.entries(headers ?? {})
    .filter(([k]) => k.toLowerCase() !== "content-type")
    .map(([k, v]) => `\n    req.Header.Set("${k}", "${v}")`)
    .join("");

  const imports = body
    ? `    "fmt"\n    "io"\n    "net/http"\n    "strings"`
    : `    "fmt"\n    "io"\n    "net/http"`;

  const reqLine = body
    ? `    body := strings.NewReader(\`${body}\`)\n    req, _ := http.NewRequest("${method}", "${url}", body)`
    : `    req, _ := http.NewRequest("${method}", "${url}", nil)`;

  return `package main

import (
${imports}
)

func main() {
${reqLine}
    req.Header.Set("Authorization", "Bearer {access_token}")
    req.Header.Set("Content-Type", "application/json")${customHeaders}

    resp, _ := http.DefaultClient.Do(req)
    defer resp.Body.Close()

    data, _ := io.ReadAll(resp.Body)
    fmt.Println(string(data))
}`;
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
  curl: generateCurl,
};

// ── Syntax Highlighting ────────────────────────────────────

const KEYWORD_PATTERNS: Record<Language, RegExp> = {
  javascript: /\b(const|let|var|await|async|function|import|from|export|return|new|if|else|try|catch|throw)\b/g,
  csharp: /\b(using|var|new|await|async|class|public|private|static|void|string|int|bool|null|return|if|else|try|catch|throw)\b/g,
  python: /\b(import|from|def|class|return|if|else|elif|try|except|raise|with|as|print|None|True|False)\b/g,
  powershell: /(\$\w+|\b(Invoke-RestMethod|ConvertTo-Json)\b|-Uri\b|-Method\b|-Headers\b|-Body\b|-Depth\b)/g,
  go: /\b(package|import|func|var|defer|nil|string|main)\b/g,
  curl: /\b(curl)\b/g,
};

const METHOD_CALL_PATTERNS: Record<Language, RegExp> = {
  javascript: /\b(fetch|JSON\.stringify|response\.json|console\.log)\b/g,
  csharp: /\b(ReadAsStringAsync|Console\.WriteLine|AuthenticationHeaderValue|StringContent|HttpClient|Encoding\.UTF8)\b/g,
  python: /\b(requests\.\w+|response\.json)\b/g,
  powershell: /(?:^|\s)(@\{|@')/g,
  go: /\b(http\.NewRequest|http\.DefaultClient\.Do|io\.ReadAll|fmt\.Println|strings\.NewReader|resp\.Body\.Close)\b/g,
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
  const [activeLanguage, setActiveLanguage] = useState<Language>("javascript");
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
