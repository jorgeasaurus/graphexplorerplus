export interface NLQueryResult {
  method: string;
  url: string;
  body: string | null;
}

export function isAIConfigured(): boolean {
  return process.env.NEXT_PUBLIC_AI_ENABLED === "true";
}

export async function naturalLanguageToQuery(prompt: string): Promise<NLQueryResult> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `AI request failed (${res.status})`);
  }

  return (await res.json()) as NLQueryResult;
}
