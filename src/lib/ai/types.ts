import { z } from "zod";

export const NLQueryResultSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().startsWith("https://graph.microsoft.com"),
  body: z.union([z.string(), z.record(z.unknown()), z.null()]).optional().default(null),
});

export type NLQueryResult = z.infer<typeof NLQueryResultSchema>;
