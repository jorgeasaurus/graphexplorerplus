import { getAccessToken, getSelectedCloudEnvironment } from "~/lib/auth/authUtils";
import { getGraphEndpoint, type CloudEnvironment } from "~/lib/auth/msalConfig";

export interface GraphRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: string;
  scopes?: string[];
}

export interface GraphResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
}

export class GraphClient {
  private baseUrl: string;

  constructor(environment?: CloudEnvironment) {
    this.baseUrl = getGraphEndpoint(environment ?? getSelectedCloudEnvironment());
  }

  private async getHeaders(customHeaders?: Record<string, string>, scopes?: string[]): Promise<HeadersInit> {
    const token = await getAccessToken(scopes);
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "client-request-id": crypto.randomUUID(),
      ...customHeaders,
    };
  }

  /**
   * Execute a raw Graph API request. This is the primary method used by the explorer
   * to send whatever the user has typed in the URL bar.
   */
  async executeRequest(options: GraphRequestOptions): Promise<GraphResponse> {
    const { method, url, headers: customHeaders, body, scopes } = options;

    const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;

    // Validate URL targets a known Graph endpoint to prevent token leakage
    const allowedOrigins = [
      "https://graph.microsoft.com",
      "https://graph.microsoft.us",
      "https://dod-graph.microsoft.us",
      "https://graph.microsoft.de",
      "https://microsoftgraph.chinacloudapi.cn",
    ];
    const targetUrl = url.startsWith("http") ? url : `https://graph.microsoft.com${url}`;
    const targetOrigin = new URL(targetUrl).origin;
    if (!allowedOrigins.includes(targetOrigin)) {
      return {
        status: 403,
        statusText: "Forbidden",
        headers: {},
        body: JSON.stringify({ error: `Refusing to send token to non-Graph origin: ${targetOrigin}` }),
        timeMs: 0,
        sizeBytes: 0,
      };
    }

    const headers = await this.getHeaders(customHeaders, scopes);

    const startTime = performance.now();

    const fetchOptions: RequestInit = {
      method,
      headers,
      redirect: "manual",
    };

    if (body && method !== "GET" && method !== "DELETE") {
      fetchOptions.body = body;
    }

    const response = await fetch(fullUrl, fetchOptions);
    const timeMs = Math.round(performance.now() - startTime);

    // Graph Reports endpoints (and others) return 302 redirects to a pre-signed
    // download URL on a different origin. With redirect:"manual" the browser
    // returns an opaque-redirect we can't read, so detect and handle it.
    if (response.type === "opaqueredirect" || (response.status >= 300 && response.status < 400)) {
      const location = response.headers.get("location") ?? "";
      return {
        status: response.status || 302,
        statusText: response.statusText || "Redirect",
        headers: location ? { location } : {},
        body: JSON.stringify({
          message: "This endpoint returned a redirect to a downloadable report.",
          downloadUrl: location || "(browser blocked cross-origin redirect — open this endpoint in a new tab to download)",
          hint: "Reports endpoints return CSV/file downloads via redirect. Open the URL directly or use PowerShell: Invoke-MgGraphRequest",
        }, null, 2),
        timeMs,
        sizeBytes: 0,
      };
    }

    const responseHeaders: Record<string, string> = Object.fromEntries(response.headers.entries());

    const contentType = response.headers.get("content-type") ?? "";
    const isBinary = /^(image\/|audio\/|video\/|application\/octet-stream|application\/pdf)/.test(contentType);

    let responseBody: string;
    let sizeBytes: number;

    if (isBinary) {
      const buf = await response.arrayBuffer();
      sizeBytes = buf.byteLength;

      // Intune report endpoints return CSV/JSON as application/octet-stream.
      // Try to decode as UTF-8 text first — if it's valid text, return it directly.
      if (contentType.includes("octet-stream")) {
        try {
          const decoded = new TextDecoder("utf-8", { fatal: true }).decode(buf);
          // If decoding succeeded and contains printable text, treat as text
          if (decoded.length > 0 && !decoded.includes("\0")) {
            responseBody = decoded;
            return {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              body: responseBody,
              timeMs,
              sizeBytes,
            };
          }
        } catch {
          // Not valid UTF-8 — fall through to base64 encoding
        }
      }

      const bytes = new Uint8Array(buf);
      const CHUNK_SIZE = 8192;
      const chunks: string[] = [];
      for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
        chunks.push(String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE)));
      }
      const binary = chunks.join("");
      const mimeType = contentType.split(";")[0]!.trim();
      responseBody = `data:${mimeType};base64,${btoa(binary)}`;
    } else {
      responseBody = await response.text();
      sizeBytes = new Blob([responseBody]).size;
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      timeMs,
      sizeBytes,
    };
  }

  // Convenience methods

  async get(endpoint: string, scopes?: string[]): Promise<GraphResponse> {
    return this.executeRequest({ method: "GET", url: endpoint, scopes });
  }

  async post(endpoint: string, data: unknown, scopes?: string[]): Promise<GraphResponse> {
    return this.executeRequest({
      method: "POST",
      url: endpoint,
      body: JSON.stringify(data),
      scopes,
    });
  }

  async patch(endpoint: string, data: unknown, scopes?: string[]): Promise<GraphResponse> {
    return this.executeRequest({
      method: "PATCH",
      url: endpoint,
      body: JSON.stringify(data),
      scopes,
    });
  }

  async put(endpoint: string, data: unknown, scopes?: string[]): Promise<GraphResponse> {
    return this.executeRequest({
      method: "PUT",
      url: endpoint,
      body: JSON.stringify(data),
      scopes,
    });
  }

  async delete(endpoint: string, scopes?: string[]): Promise<GraphResponse> {
    return this.executeRequest({ method: "DELETE", url: endpoint, scopes });
  }
}

export function createGraphClient(environment?: CloudEnvironment): GraphClient {
  return new GraphClient(environment);
}
