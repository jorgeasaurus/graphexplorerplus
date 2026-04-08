/** Tailwind color classes keyed by HTTP method. */
export const METHOD_CLASSES: Record<string, string> = {
  GET: "text-method-get bg-method-get/10",
  POST: "text-method-post bg-method-post/10",
  PUT: "text-method-put bg-method-put/10",
  PATCH: "text-method-patch bg-method-patch/10",
  DELETE: "text-method-delete bg-method-delete/10",
};

/** Returns the Tailwind color classes for a given HTTP method. */
export function getMethodColor(method: string): string {
  return METHOD_CLASSES[method.toUpperCase()] ?? "text-text-muted";
}
