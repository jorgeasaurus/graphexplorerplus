import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "~/lib/ai/system-prompt";
import { NLQueryResultSchema } from "~/lib/ai/types";

// ---------------------------------------------------------------------------
// Responses API types (Azure OpenAI 2025-04-01-preview)
// ---------------------------------------------------------------------------
interface ResponsesAPIResponse {
  output: {
    type: string;
    content?: { type: string; text: string }[];
  }[];
}

// ---------------------------------------------------------------------------
// Security: allowed origins for the AI route
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
]);

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // In production, check against deployed URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    ALLOWED_ORIGINS.add(`https://${vercelUrl}`);
  }
  const prodUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (prodUrl) {
    ALLOWED_ORIGINS.add(prodUrl.replace(/\/+$/, ""));
  }

  if (origin && ALLOWED_ORIGINS.has(origin)) return true;
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (ALLOWED_ORIGINS.has(refOrigin)) return true;
    } catch { /* invalid referer */ }
  }

  // Allow same-origin requests (no Origin header in same-origin fetch)
  return !origin && !referer;
}

// ---------------------------------------------------------------------------
// Security: simple in-memory rate limiter
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Origin validation
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden." },
      { status: 403 },
    );
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const key = process.env.AZURE_OPENAI_KEY;
  const model = process.env.AZURE_OPENAI_DEPLOYMENT;

  if (!endpoint || !key || !model) {
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

  const { prompt, graphBase } = body as { prompt?: string; graphBase?: string };

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

  // Log suspicious prompt injection attempts
  if (/ignore.*instruction|system.*prompt|jailbreak|disregard.*previous/i.test(prompt)) {
    console.warn("[SECURITY] Potential prompt injection attempt:", {
      prompt: prompt.slice(0, 100),
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  // Validate graphBase against known sovereign cloud endpoints
  const ALLOWED_GRAPH_BASES = [
    "https://graph.microsoft.com",
    "https://graph.microsoft.us",
    "https://dod-graph.microsoft.us",
    "https://graph.microsoft.de",
    "https://microsoftgraph.chinacloudapi.cn",
  ];
  const resolvedBase = ALLOWED_GRAPH_BASES.includes(graphBase ?? "")
    ? graphBase!
    : "https://graph.microsoft.com";

  const base = endpoint.replace(/\/+$/, "");
  const apiUrl = `${base}/openai/responses?api-version=2025-04-01-preview`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": key,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "developer", content: buildSystemPrompt(resolvedBase) },
        { role: "user", content: prompt },
      ],
      text: {
        format: {
          type: "json_object",
        },
      },
      max_output_tokens: 500,
      temperature: 0.1,
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

  const data = (await res.json()) as ResponsesAPIResponse;

  // Extract text from the first message output
  const messageOutput = data.output?.find((o) => o.type === "message");
  const content = messageOutput?.content?.find((c) => c.type === "output_text")?.text;

  if (!content) {
    return NextResponse.json(
      { error: "No response from Azure OpenAI." },
      { status: 502 },
    );
  }

  try {
    const parseResult = NLQueryResultSchema.safeParse(JSON.parse(content));
    if (!parseResult.success) {
      console.error("AI response validation failed:", parseResult.error.flatten());
      return NextResponse.json(
        { error: "AI returned an invalid response.", code: "AI_BAD_RESPONSE" },
        { status: 502 },
      );
    }
    return NextResponse.json(parseResult.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response." },
      { status: 502 },
    );
  }
}
