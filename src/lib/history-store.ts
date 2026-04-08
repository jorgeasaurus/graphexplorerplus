const STORAGE_KEY = "gep-request-history";
const MAX_ENTRIES = 100;

export interface HistoryEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  timeMs: number;
  timestamp: string; // ISO string for serialization
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/** Strip email addresses and GUIDs from URLs before persisting */
function sanitizeUrl(url: string): string {
  return url
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "<email>")
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<id>");
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  const entries = getHistory();
  entries.unshift({
    ...entry,
    url: sanitizeUrl(entry.url),
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new Event("history-updated"));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("history-updated"));
}
