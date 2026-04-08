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
 */

const ALLOWED_ORIGINS = new Set([
  "https://graph.microsoft.com",
  "https://graph.microsoft.us",
  "https://dod-graph.microsoft.us",
  "https://graph.microsoft.de",
  "https://microsoftgraph.chinacloudapi.cn",
]);

export async function POST(req: NextRequest) {
  try {
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

    // Validate the target URL is a known Graph endpoint
    const targetOrigin = new URL(url).origin;
    if (!ALLOWED_ORIGINS.has(targetOrigin)) {
      return NextResponse.json(
        { error: `Refusing to proxy request to non-Graph origin: ${targetOrigin}` },
        { status: 403 },
      );
    }

    // Follow redirects server-side (no CORS issues)
    const graphResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      redirect: "follow",
    });

    if (!graphResponse.ok && graphResponse.status !== 200) {
      const errorText = await graphResponse.text();
      return NextResponse.json(
        { error: `Graph API returned ${graphResponse.status}`, details: errorText },
        { status: graphResponse.status },
      );
    }

    // Stream the response body back to the client
    const contentType =
      graphResponse.headers.get("content-type") ?? "application/octet-stream";
    const contentDisposition =
      graphResponse.headers.get("content-disposition") ?? "";

    const headers = new Headers({
      "Content-Type": contentType,
    });
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition);
    }

    return new NextResponse(graphResponse.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
