# Security Review — Graph Explorer Plus

**Date:** 2026-04-08
**Reviewers:** Claude Opus 4.6 · GPT-5.3-Codex · GPT-5.4
**Scope:** Full `src/` tree, `next.config.js`

---

## Summary

| # | Finding | Severity | Claude | Codex | GPT |
|---|---------|----------|:------:|:-----:|:---:|
| 1 | SSRF via unvalidated redirect in proxy | High | ✅ | ✅ | |
| 2 | Bearer token leakage on cross-origin redirect | High | ✅ | | |
| 3 | Unauthenticated server proxy endpoint | Medium | ✅ | ✅ | |
| 4 | Sensitive data in shareable URL params | High | | ✅ | |
| 5 | Share link injects code into generated snippets | Medium | | | ✅ |
| 6 | Share URL bypasses UI trust boundary | Medium | ✅ | | |
| 7 | CSP allows unsafe-inline and unsafe-eval | Medium | ✅ | ✅ | ✅ |
| 8 | Proxy path scope overly broad (not limited to /reports/) | Medium | ✅ | | |
| 9 | `data:` URI download allows dangerous MIME types | Low | ✅ | | |

**Consensus findings** (flagged by 2+ reviewers): #1, #3, #7

---

## Finding 1 — SSRF via Unvalidated Redirect in Proxy

**Severity:** High
**File:** `src/app/api/report-download/route.ts:37-52`
**Flagged by:** Claude, Codex

The proxy validates the initial URL origin against `ALLOWED_ORIGINS`, but uses `redirect: "follow"` which blindly follows any 302 Graph returns. If a Graph endpoint redirects to an unexpected destination (internal metadata service `169.254.169.254`, IMDS, private network), the server fetches it from its own network context.

**Fix:** Use `redirect: "manual"`, inspect the `Location` header, validate against an allowlist, then follow manually without the Authorization header.

---

## Finding 2 — Bearer Token Leakage on Cross-Origin Redirect

**Severity:** High
**File:** `src/app/api/report-download/route.ts:46-52`
**Flagged by:** Claude

The `Authorization: Bearer` header is set on the initial request. When `redirect: "follow"` causes a cross-origin redirect, whether the header is stripped depends on the Node.js runtime's fetch implementation. This is an implicit runtime behavior, not an explicit security control.

**Fix:** Use `redirect: "manual"` and make follow-up requests to redirect targets without the Authorization header.

---

## Finding 3 — Unauthenticated Server Proxy Endpoint

**Severity:** Medium
**File:** `src/app/api/report-download/route.ts:22`
**Flagged by:** Claude, Codex

The `/api/report-download` endpoint has no server-side authentication. It accepts `{ url, token }` from any caller with no session check, API key, or origin verification. This makes it a semi-open proxy — anyone who discovers the URL can proxy Graph requests through your server's IP.

**Fix:** Add session verification or CSRF protection to ensure only authenticated app users can call this endpoint.

---

## Finding 4 — Sensitive Data in Shareable URL Params

**Severity:** High
**File:** `src/app/explorer/_components/query-builder.tsx:682-687`
**Flagged by:** Codex

The share feature encodes the full request state into URL params including the request body (`b` param). Bodies can contain secrets, PII, tokens, or tenant data. Putting them in the URL leaks them to browser history, server logs, CDN telemetry, and anyone the link is shared with.

**Fix:** Consider omitting the body from share links, or warn users when sharing requests with bodies. Alternatively, use a short-lived server-side store for shared state.

---

## Finding 5 — Share Link Injects Code into Generated Snippets

**Severity:** Medium
**File:** `src/app/explorer/_components/query-builder.tsx:334-342`, `src/app/explorer/_components/code-snippets.tsx:41-57`
**Flagged by:** GPT

The explorer loads `u`/`b` from URL query params into request state, then code-snippet generators interpolate those values into executable snippets without escaping. A crafted share link can inject attacker-controlled code into JavaScript/cURL/Go/PowerShell snippets that a user might copy-paste and execute.

Example: `?u=https://graph.microsoft.com/v1.0/me"); require("child_process").execSync("echo PWNED"); //`

**Fix:** Serialize URL/body as properly escaped data in every snippet generator. Reject values that cannot be safely represented.

---

## Finding 6 — Share URL Bypasses UI Trust Boundary

**Severity:** Medium
**File:** `src/app/explorer/_components/query-builder.tsx:336-340`
**Flagged by:** Claude

The `?u=` query parameter sets the API URL directly into the URL bar without validation (`if (u) setUrl(u)`). An attacker can craft a link populating the bar with a malicious endpoint. While `GraphClient` validates the origin before sending tokens, the URL appears legitimate in the UI (social engineering vector).

**Fix:** Validate that `?u=` starts with a known Graph API host before accepting it into state.

---

## Finding 7 — CSP Allows unsafe-inline and unsafe-eval

**Severity:** Medium
**File:** `next.config.js:42`
**Flagged by:** Claude, Codex, GPT (unanimous)

The CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`, permitting `eval()`, `new Function()`, and inline scripts. This significantly weakens XSS mitigation. The `'unsafe-inline'` is currently required by the theme bootstrap script in `layout.tsx` using `dangerouslySetInnerHTML`.

**Fix:** Move the theme bootstrap to a nonce/hash-based script. Remove `'unsafe-eval'` (conditionally include it only in development if needed for HMR/DevTools).

---

## Finding 8 — Proxy Path Scope Overly Broad

**Severity:** Medium
**File:** `src/app/api/report-download/route.ts:37-38`
**Flagged by:** Claude

The proxy validates only the URL's origin — any path on Graph is allowed. The route is intended for `/reports/*` endpoints, but an attacker with a valid token can proxy any Graph API call (`/me/messages`, `/users/{id}`) through the server.

**Fix:** Validate that the URL pathname matches `/v1.0/reports/` or `/beta/reports/`.

---

## Finding 9 — `data:` URI Download Allows Dangerous MIME Types

**Severity:** Low
**File:** `src/app/explorer/_components/response-viewer.tsx:396-401`
**Flagged by:** Claude

Binary responses rendered as `<a href={data:...} download>` don't filter MIME types. A malicious Graph response with `data:text/html,...` could navigate to executable HTML if the browser ignores the `download` attribute.

**Fix:** Allowlist safe MIME types (`image/*`, `application/json`, `text/csv`, `application/octet-stream`) before rendering the download link.
