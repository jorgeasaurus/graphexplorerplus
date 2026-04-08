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
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
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
        { role: "developer", content: buildSystemPrompt() },
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
