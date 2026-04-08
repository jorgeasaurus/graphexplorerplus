import { z } from "zod";

const GRAPH_URL_PREFIXES = [
  "https://graph.microsoft.com",
  "https://graph.microsoft.us",
  "https://dod-graph.microsoft.us",
  "https://graph.microsoft.de",
  "https://microsoftgraph.chinacloudapi.cn",
];

export const NLQueryResultSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().refine(
    (url) => GRAPH_URL_PREFIXES.some((prefix) => url.startsWith(prefix)),
    { message: "URL must start with a valid Microsoft Graph endpoint" },
  ),
  body: z.union([z.string(), z.record(z.unknown()), z.null()]).optional().default(null),
});

export type NLQueryResult = z.infer<typeof NLQueryResultSchema>;
