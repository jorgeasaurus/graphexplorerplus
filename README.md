# Graph Explorer Plus

A power-user alternative to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) built with Next.js, MSAL, and Tailwind CSS.

## Why This Exists

The official Graph Explorer is great for getting started, but it lacks features that IT admins and developers need daily. Graph Explorer Plus fills those gaps.

## Features vs. Official Graph Explorer

| Feature | Official | Plus |
|---|---|---|
| Run Graph API queries | Yes | Yes |
| MSAL authentication | Yes | Yes |
| Response body / headers | Yes | Yes |
| v1.0 / beta toggle | Yes | Yes |
| **Multi-cloud support** (GCC, DoD, Germany, China) | Partial | **Full — URL bar, auth, and samples all switch** |
| **Incremental consent** | Manual portal grant | **In-app consent banner with retry** |
| **198 curated sample queries** | ~40 | **198 across 25 categories** |
| **Deep Intune coverage** | Minimal | **11 Intune categories (devices, compliance, config, apps, MAM, enrollment, scripts, updates, filters, reporting, RBAC)** |
| **Entra ID / Security / Reports samples** | Few | **Conditional Access, risky users, audit logs, MFA, secure score, usage reports** |
| **SDK code snippets** | Yes (server-rendered) | **Client-side: PowerShell (default), JavaScript, C#, Python, Go, cURL** |
| **PowerShell-first snippets** | PowerShell listed last | **PowerShell is default tab, uses `Invoke-MgGraphRequest`** |
| **Permission inspector** | Separate tab | **Inline below URL bar — see required scopes before you send** |
| **27K endpoint autocomplete** | Yes | **Yes — fuzzy search across all Graph API endpoints** |
| **Request history** | Session only, no click-to-reload | **localStorage-persisted, click to reload, searchable, clearable** |
| **Draggable panel resize** | Fixed | **Mouse-drag divider between request and response panels** |
| **Binary response preview** | Download link | **Inline image preview (base64)** |
| **App registration script** | Manual setup | **PowerShell script included (`scripts/New-GraphExplorerPlusApp.ps1`)** |
| **Dark theme** | Toggle | **Dark-first precision theme with electric teal accent** |
| **Keyboard accessible** | Partial | **Full — focus-visible rings, ARIA roles, reduced motion support** |

## Quick Start

### 1. Create the App Registration

```powershell
# Requires Microsoft.Graph PowerShell module
./scripts/New-GraphExplorerPlusApp.ps1
```

This creates a multi-tenant SPA app registration with the necessary delegated permissions. Others just sign in and accept the consent prompt.

### 2. Configure Environment

```bash
cp .env.example .env
```

Set these values (the script outputs them):

```
NEXT_PUBLIC_MSAL_CLIENT_ID=<your-app-id>
NEXT_PUBLIC_MSAL_AUTHORITY=https://login.microsoftonline.com/common
NEXT_PUBLIC_MSAL_REDIRECT_URI=http://localhost:3000
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, and start querying.

## Architecture

- **Next.js 15** with React 19, App Router
- **MSAL.js** (client-side only) — no server secrets, no NextAuth
- **Tailwind v4** with CSS-based design tokens
- **27,723 Graph API endpoints** indexed for autocomplete
- **6,072 permissions** mapped for the permission inspector

All authentication and API calls happen client-side. The server only serves static assets.

## Multi-Cloud

Switch between cloud environments via the settings gear in the header:

| Environment | Graph Endpoint |
|---|---|
| Global (Commercial) | `graph.microsoft.com` |
| US Gov (GCC High) | `graph.microsoft.us` |
| US Gov DoD | `dod-graph.microsoft.us` |
| Germany | `graph.microsoft.de` |
| China (21Vianet) | `microsoftgraph.chinacloudapi.cn` |

The URL bar, autocomplete, sample queries, and auth authority all update to match.

## Consent Flow

When a query returns 403, Graph Explorer Plus:

1. Parses the error for required scopes
2. Shows a consent banner with scope pills
3. Offers "Consent & Retry" (grants permissions and re-runs the query) or "Consent Only"
4. Uses MSAL's `acquireTokenPopup` with `prompt: "consent"` for incremental consent

No portal visits needed for most permission grants.

## Sample Query Categories

**General:** Getting Started, Users, Groups, Mail, Calendar, Teams, OneDrive/SharePoint, Planner/Tasks, App Registrations, Entra ID, Directory Roles, Security, Reports, Subscriptions

**Intune:** Devices, Compliance, Config, Apps, MAM, Enrollment, Scripts, Updates, Filters, Reporting, RBAC

## Tech Stack

- [Next.js](https://nextjs.org) — React framework
- [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js) — Microsoft identity
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [tRPC](https://trpc.io) — Type-safe API layer
- [Prisma](https://prisma.io) — Database ORM

## License

MIT
