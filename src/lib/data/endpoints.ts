export interface EndpointEntry {
  m: string; // HTTP method
  p: string; // path
  s?: string; // summary
}

interface EndpointIndex {
  count: number;
  endpoints: EndpointEntry[];
}

let cache: EndpointIndex | null = null;
let loading: Promise<EndpointIndex> | null = null;

export async function loadEndpoints(): Promise<EndpointIndex> {
  if (cache) return cache;
  if (loading) return loading;

  loading = fetch("/data/endpoints.json")
    .then((r) => r.json())
    .then((data: EndpointIndex) => {
      cache = data;
      return data;
    });

  return loading;
}

export function searchEndpoints(
  endpoints: EndpointEntry[],
  query: string,
  method?: string,
  limit = 15,
): EndpointEntry[] {
  const q = query.toLowerCase().replace(/^\//, "");
  return endpoints
    .filter((ep) => {
      if (method && ep.m !== method) return false;
      return (
        ep.p.toLowerCase().includes(q) ||
        (ep.s && ep.s.toLowerCase().includes(q))
      );
    })
    .slice(0, limit);
}
