import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Graph Reports downloads.
 *
 * Graph Reports endpoints (e.g. /reports/getEmailActivityUserDetail) return
 * 302 redirects to pre-signed download URLs on *.office.com. The browser
 * can't follow these via fetch because the target doesn't set CORS headers.
 *
 * This route accepts the Graph URL + Bearer token from the client, follows
 * the redirect server-side (no CORS restrictions), and streams the file back.
 *
 * Security controls:
 *  - Caller must originate from same-site (Origin/Referer check)
 *  - Target URL must be a known Graph origin AND a /reports/ path
 *  - Redirects are followed manually; the Authorization header is stripped
 *  - Redirect destinations are validated against an allowlist
 */

const ALLOWED_ORIGINS = new Set([
  "https://graph.microsoft.com",
  "https://graph.microsoft.us",
  "https://dod-graph.microsoft.us",
  "https://graph.microsoft.de",
  "https://microsoftgraph.chinacloudapi.cn",
]);

const REPORTS_PATH_RE = /^\/(v1\.0|beta)\/reports\//i;

const ALLOWED_REDIRECT_HOSTS = [/\.office\.com$/i, /\.sharepoint\.com$/i];

function isAllowedRedirect(location: string): boolean {
  try {
    const url = new URL(location);
    if (ALLOWED_ORIGINS.has(url.origin)) return true;
    return ALLOWED_REDIRECT_HOSTS.some((re) => re.test(url.hostname));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validate the caller is same-site (not an external relay)
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    if (!origin && !referer) {
      return NextResponse.json(
        { error: "Forbidden: missing origin" },
        { status: 403 },
      );
    }

    const { url, token } = (await req.json()) as {
      url?: string;
      token?: string;
    };

    if (!url || !token) {
      return NextResponse.json(
        { error: "Missing url or token" },
        { status: 400 },
      );
    }

    const targetUrl = new URL(url);

    // Validate origin is a known Graph endpoint
    if (!ALLOWED_ORIGINS.has(targetUrl.origin)) {
      return NextResponse.json(
        { error: `Refusing to proxy request to non-Graph origin: ${targetUrl.origin}` },
        { status: 403 },
      );
    }

    // Restrict to /reports/ paths only
    if (!REPORTS_PATH_RE.test(targetUrl.pathname)) {
      return NextResponse.json(
        { error: "This proxy only supports /reports/ endpoints" },
        { status: 403 },
      );
    }

    // Initial request with auth — do NOT auto-follow redirects
    const graphResponse = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      redirect: "manual",
    });

    // Handle redirect: validate destination, follow WITHOUT the bearer token
    if (graphResponse.status >= 300 && graphResponse.status < 400) {
      const location = graphResponse.headers.get("location");
      if (!location) {
        return NextResponse.json(
          { error: "Redirect with no Location header" },
          { status: 502 },
        );
      }

      if (!isAllowedRedirect(location)) {
        return NextResponse.json(
          { error: `Refusing to follow redirect to: ${new URL(location).origin}` },
          { status: 403 },
        );
      }

      // Follow the redirect without the Authorization header
      const redirectResponse = await fetch(location, { redirect: "follow" });
      return streamResponse(redirectResponse);
    }

    if (!graphResponse.ok) {
      const errorText = await graphResponse.text();
      return NextResponse.json(
        { error: `Graph API returned ${graphResponse.status}`, details: errorText },
        { status: graphResponse.status },
      );
    }

    return streamResponse(graphResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function streamResponse(response: Response): NextResponse {
  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition") ?? "";

  const headers = new Headers({ "Content-Type": contentType });
  if (contentDisposition) {
    headers.set("Content-Disposition", contentDisposition);
  }

  return new NextResponse(response.body, { status: 200, headers });
}
