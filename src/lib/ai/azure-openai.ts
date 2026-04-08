import type { NLQueryResult } from "./types";

export type { NLQueryResult };

export function isAIConfigured(): boolean {
  return process.env.NEXT_PUBLIC_AI_ENABLED === "true";
}

export async function naturalLanguageToQuery(
  prompt: string,
  options?: { signal?: AbortSignal },
): Promise<NLQueryResult> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal: options?.signal,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `AI request failed (${res.status})`);
  }

  return (await res.json()) as NLQueryResult;
}
