# Graph Explorer Plus

A power-user alternative to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) built with the T3 stack. Designed for IT admins, security engineers, and developers who live in the Graph API daily.

## Why This Exists

The official Graph Explorer covers the basics. Graph Explorer Plus adds the features that power users have been asking for: AI-powered natural language queries, 201 curated samples with deep Intune coverage, inline consent flows, 8-language code snippets, a browseable resource explorer, shareable query URLs, and sovereign cloud support that actually works end-to-end.

## Features

### AI Query Builder

Describe what you need in plain English. The AI translates it to the correct Graph API call with proper OData filters, query parameters, and request bodies. Powered by Azure OpenAI with context-aware prompt engineering that understands Intune resource type casting, OData filter syntax, and Graph API conventions.

### Code Snippets (8 Languages)

Every query generates ready-to-use code in PowerShell, JavaScript, C#, Python, Go, Java, PHP, and cURL. PowerShell is the default tab (using `Invoke-MgGraphRequest`). Each language includes links to its SDK and documentation.

### Resource Explorer

Browse all 27,000+ Graph API endpoints as a navigable tree. Search instantly, toggle between v1.0 and beta, and click any method badge to load it into the query builder.

### Permission Inspector & Consent Flow

See required scopes for any endpoint before you send the request. When a query returns 403, a consent banner appears with the missing scopes. Click "Consent & Retry" to grant permissions via MSAL popup and re-run the query without leaving the app.

### Modify Permissions

Browse and consent to individual Microsoft Graph permissions directly from the explorer. Permissions that are already granted appear greyed out.

### Token Viewer

Decode your current access token in real time. Inspect claims, expiration, scopes, and tenant info without leaving the app.

### Multi-Cloud Support

Full support for 5 sovereign cloud environments. The URL bar, autocomplete, sample queries, and MSAL authority all switch together.

| Environment | Graph Endpoint |
|---|---|
| Global (Commercial) | `graph.microsoft.com` |
| US Gov (GCC High) | `graph.microsoft.us` |
| US Gov DoD | `dod-graph.microsoft.us` |
| Germany | `graph.microsoft.de` |
| China (21Vianet) | `microsoftgraph.chinacloudapi.cn` |

### 201 Sample Queries (25 Categories)

**General:** Getting Started, Users, Groups, Mail, Calendar, Teams, OneDrive/SharePoint, Planner/Tasks, App Registrations, Entra ID, Directory Roles, Security, Reports, Subscriptions

**Intune:** Devices, Compliance, Config, Apps, MAM, Enrollment, Scripts, Updates, Filters, Reporting, RBAC

### Share & Fullscreen

Copy a shareable URL for any query (encodes method, URL, version, and body). Expand responses to fullscreen for complex JSON payloads.

### Request History

All queries are persisted to localStorage. Click any history entry to reload it. Searchable and clearable.

### Additional Features

- **Draggable panel resize** between request and response panes
- **Binary response preview** with inline image rendering
- **Dark/light theme** with precision design tokens
- **Keyboard accessible** with focus-visible rings, ARIA roles, and reduced motion support
- **Endpoint autocomplete** with fuzzy search across 27,000+ paths

## Comparison with Official Graph Explorer

| Capability | Official | Plus |
|---|---|---|
| AI natural language queries | No | Yes |
| Code snippets | 4 languages (server-rendered) | 8 languages (client-side, with SDK links) |
| Resource explorer | Yes | Yes (tree + search + method badges) |
| Sample queries | ~40 | 201 across 25 categories |
| Intune coverage | Minimal | 11 dedicated categories |
| Inline consent flow | No | Yes (consent & retry) |
| Modify permissions | Yes | Yes (with greyed-out granted state) |
| Token viewer | No | Yes (JWT decode) |
| Shareable query URLs | Yes | Yes |
| Fullscreen response | No | Yes (portal modal) |
| Multi-cloud | Partial | Full (auth + endpoints + samples) |
| Persistent history | Session only | localStorage with search |
| Draggable panels | No | Yes |
| PowerShell-first | Listed last | Default tab |

## Quick Start

### 1. Create the App Registration

```powershell
# Requires Microsoft.Graph PowerShell module
./scripts/New-GraphExplorerPlusApp.ps1
```

Creates a multi-tenant SPA app registration with the necessary delegated permissions.

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

For the AI query builder, add your Azure OpenAI credentials:

```
NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT=<your-endpoint>
NEXT_PUBLIC_AZURE_OPENAI_KEY=<your-key>
NEXT_PUBLIC_AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, and start querying.

## Architecture

```
src/
  app/
    page.tsx              # Landing page
    explorer/
      page.tsx            # Explorer layout
      _components/
        query-builder.tsx     # URL bar, method selector, headers/body/params tabs
        response-viewer.tsx   # Response body, headers, fullscreen expand
        nl-query-bar.tsx      # AI natural language input
        code-snippets.tsx     # 8-language snippet generator
        resource-explorer.tsx # 27K endpoint tree browser
        sidebar.tsx           # Samples / Resources / History tabs
        sample-queries.tsx    # 201 curated queries
        history-panel.tsx     # Persistent request history
        permission-inspector.tsx  # Scope requirements per endpoint
        modify-permissions.tsx    # Browse and consent to permissions
        access-token-viewer.tsx   # JWT token decoder
        consent-banner.tsx    # 403 consent flow
        header-bar.tsx        # App header, theme toggle, cloud switcher
        status-bar.tsx        # Response status bar
  lib/
    auth/
      msalConfig.ts       # MSAL configuration, cloud environments
      authUtils.ts         # Token acquisition helpers
    ai/
      azure-openai.ts     # AI system prompt and API integration
```

All authentication and API calls happen client-side. The Next.js server only serves static assets.

## Tech Stack

- [Next.js 15](https://nextjs.org) with React 19 and App Router
- [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js) for Microsoft identity (client-side only)
- [Tailwind CSS v4](https://tailwindcss.com) with CSS-based design tokens
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) for natural language query translation
- [tRPC](https://trpc.io) for type-safe API layer
- [Prisma](https://prisma.io) for database ORM
- [Playwright](https://playwright.dev) for end-to-end testing

## Contributing

[Open an issue](https://github.com/jorgeasaurus/graphexplorerplus/issues/new/choose) using the bug report or feature request template.

## License

MIT
