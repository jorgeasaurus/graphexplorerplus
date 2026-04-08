/**
 * Strips the Graph API base URL and version prefix, returning the resource path.
 *
 * Handles full URLs (https://graph.microsoft.com/v1.0/me) and
 * relative paths (/v1.0/me, v1.0/me).
 */
export function extractGraphPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/(v1\.0|beta)/, "");
  } catch {
    const path = url.startsWith("/") ? url : `/${url}`;
    return path.replace(/^\/(v1\.0|beta)/, "");
  }
}
