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

    const headers = await this.getHeaders(customHeaders, scopes);

    const startTime = performance.now();

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET" && method !== "DELETE") {
      fetchOptions.body = body;
    }

    const response = await fetch(fullUrl, fetchOptions);
    const timeMs = Math.round(performance.now() - startTime);

    const responseHeaders: Record<string, string> = Object.fromEntries(response.headers.entries());

    const contentType = response.headers.get("content-type") ?? "";
    const isBinary = /^(image\/|audio\/|video\/|application\/octet-stream|application\/pdf)/.test(contentType);

    let responseBody: string;
    let sizeBytes: number;

    if (isBinary) {
      const buf = await response.arrayBuffer();
      sizeBytes = buf.byteLength;
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]!);
      }
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
