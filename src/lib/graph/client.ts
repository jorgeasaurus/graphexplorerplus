import { getAccessToken, getSelectedCloudEnvironment, AuthSessionExpiredError } from "~/lib/auth/authUtils";
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

    // Build full URL - if the user provides a full URL, use it; otherwise prepend the base
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

    const responseBody = await response.text();
    const sizeBytes = new Blob([responseBody]).size;

    // Collect response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

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
