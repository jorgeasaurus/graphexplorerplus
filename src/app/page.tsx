"use client";

import Link from "next/link";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { signIn, signOut } from "~/lib/auth/authUtils";

const features = [
  {
    title: "Service Principal Auth",
    description: "Test app-only permissions directly",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
      </svg>
    ),
  },
  {
    title: "Batch Requests",
    description: "Build and execute batch operations visually",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L12 17.25 6.43 14.25m11.141 0 4.179 2.25L12 21.75l-9.75-5.25 4.179-2.25" />
      </svg>
    ),
  },
  {
    title: "Response Diff",
    description: "Compare API responses side-by-side",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: "Code Generation",
    description: "Export to C#, Python, PowerShell & more",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: "Query Collections",
    description: "Save, organize, and share your queries",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
  },
  {
    title: "Schema Browser",
    description: "Explore the full API surface visually",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "Multi-Tenant",
    description: "Switch tenants without re-authenticating",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
  },
  {
    title: "Export Everything",
    description: "Download as CSV, JSON, or cURL commands",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

export default function Home() {
  const isAuth = useIsAuthenticated();
  const { accounts, inProgress } = useMsal();
  const displayName = accounts[0]?.name;
  const isLoading = inProgress !== InteractionStatus.None;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-deep font-sans text-text-primary">
      {/* ── Grid background ── */}
      <div
        aria-hidden="true"
        className="animate-grid-drift pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-accent) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, var(--color-accent) 0 1px, transparent 1px 60px)",
        }}
      />

      {/* ── Hero glow ── */}
      <div
        aria-hidden="true"
        className="animate-glow-pulse pointer-events-none absolute left-1/2 top-[18%] z-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,170,0.12) 0%, rgba(0,212,170,0.04) 40%, transparent 70%)",
        }}
      />

      {/* ── Nav ── */}
      <nav className="animate-fade-in sticky top-0 z-50 border-b border-border-subtle bg-bg-deep/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-wide text-text-primary">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-bg-deep">
              G+
            </span>
            <span className="hidden sm:inline">Graph Explorer<span className="text-accent">+</span></span>
          </Link>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <span className="px-4 py-2 text-sm text-text-muted">Signing in…</span>
            ) : isAuth ? (
              <>
                <span className="px-4 py-2 text-sm font-medium text-text-secondary">
                  {displayName}
                </span>
                <button
                  onClick={() => void signOut()}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => void signIn()}
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Sign In
              </button>
            )}
            <Link
              href="/explorer"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg-deep transition-colors hover:bg-accent-hover"
            >
              Launch Explorer →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-8 pt-24 text-center sm:pt-32 md:pt-40">
        {/* Method pills decoration */}
        <div
          className="animate-fade-in mx-auto mb-8 flex flex-wrap items-center justify-center gap-2"
          style={{ animationDelay: "0.1s" }}
        >
          {[
            { method: "GET", color: "var(--color-method-get)" },
            { method: "POST", color: "var(--color-method-post)" },
            { method: "PUT", color: "var(--color-method-put)" },
            { method: "PATCH", color: "var(--color-method-patch)" },
            { method: "DELETE", color: "var(--color-method-delete)" },
          ].map(({ method, color }) => (
            <span
              key={method}
              className="rounded-full px-3 py-0.5 font-mono text-xs font-semibold"
              style={{
                color,
                backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
              }}
            >
              {method}
            </span>
          ))}
        </div>

        <h1
          className="animate-fade-up text-5xl font-bold uppercase leading-none tracking-tighter sm:text-7xl md:text-8xl lg:text-[8.5rem]"
          style={{ textWrap: 'balance' }}
        >
          <span className="bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">
            Graph Explorer
          </span>
          <span
            className="inline-block text-accent"
            style={{
              filter: "drop-shadow(0 0 24px rgba(0,212,170,0.5))",
            }}
          >
            +
          </span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-text-secondary sm:text-xl"
          style={{ animationDelay: "0.15s" }}
        >
          The Microsoft Graph API explorer you&apos;ve been waiting for.
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ animationDelay: "0.25s" }}
        >
          <Link
            href="/explorer"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-base font-semibold text-bg-deep shadow-[0_0_32px_rgba(0,212,170,0.25)] transition-colors hover:bg-accent-hover hover:shadow-[0_0_48px_rgba(0,212,170,0.35)]"
          >
            Launch Explorer
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
          <a
            href="https://github.com/jorgeasaurus/graphexplorerplus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border-default px-8 py-3.5 text-base font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </section>

      {/* ── Mock Terminal ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div
          className="animate-fade-up overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-[0_0_60px_rgba(0,212,170,0.06)]"
          style={{ animationDelay: "0.4s" }}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-border-subtle bg-bg-elevated px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#f43f5e]" />
            <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span className="h-3 w-3 rounded-full bg-[#10b981]" />
            <span className="ml-3 font-mono text-xs text-text-muted">
              graph-explorer-plus
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-5 font-mono text-sm leading-relaxed sm:p-6">
            {/* Request line */}
            <div className="flex items-center gap-2">
              <span className="text-text-muted">$</span>
              <span className="font-semibold text-method-get">GET</span>
              <span className="text-text-secondary">
                https://graph.microsoft.com/v1.0/me
              </span>
            </div>

            {/* Separator */}
            <div className="my-3 h-px bg-border-subtle" />

            {/* Status */}
            <div className="mb-3 flex items-center gap-2 text-xs">
              <span className="rounded bg-success/15 px-2 py-0.5 font-semibold text-success">
                200 OK
              </span>
              <span className="text-text-muted">· 42ms</span>
            </div>

            {/* JSON response */}
            <pre className="text-xs leading-relaxed sm:text-sm">
              <span className="text-text-muted">{"{"}</span>{"\n"}
              <span className="text-text-muted">{"  "}</span>
              <span className="text-accent">&quot;displayName&quot;</span>
              <span className="text-text-muted">: </span>
              <span className="text-method-put">&quot;Jorge Gomez&quot;</span>
              <span className="text-text-muted">,</span>{"\n"}
              <span className="text-text-muted">{"  "}</span>
              <span className="text-accent">&quot;mail&quot;</span>
              <span className="text-text-muted">: </span>
              <span className="text-method-put">&quot;jorge@contoso.com&quot;</span>
              <span className="text-text-muted">,</span>{"\n"}
              <span className="text-text-muted">{"  "}</span>
              <span className="text-accent">&quot;jobTitle&quot;</span>
              <span className="text-text-muted">: </span>
              <span className="text-method-put">&quot;Senior Engineer&quot;</span>
              <span className="text-text-muted">,</span>{"\n"}
              <span className="text-text-muted">{"  "}</span>
              <span className="text-accent">&quot;officeLocation&quot;</span>
              <span className="text-text-muted">: </span>
              <span className="text-method-put">&quot;Building 42&quot;</span>{"\n"}
              <span className="text-text-muted">{"}"}</span>
            </pre>

            {/* Blinking cursor */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-text-muted">$</span>
              <span className="animate-terminal-blink inline-block h-4 w-2 bg-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-12 sm:py-20">
        <h2
          className="animate-fade-up mb-4 text-center text-sm font-semibold uppercase tracking-widest text-accent"
          style={{ animationDelay: "0.5s", textWrap: 'balance' }}
        >
          Power Features
        </h2>
        <p
          className="animate-fade-up mx-auto mb-12 max-w-md text-center text-text-secondary"
          style={{ animationDelay: "0.55s" }}
        >
          Everything you need to master the Microsoft Graph API, in one place.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-fade-up group rounded-xl border border-border-subtle bg-bg-surface p-5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-default hover:shadow-lg hover:shadow-accent/5"
              style={{ animationDelay: `${0.6 + i * 0.07}s` }}
            >
              <div className="mb-3 inline-flex rounded-lg bg-accent-subtle p-2 text-accent">
                {feature.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-sm text-text-muted">
            Built for power users · Graph Explorer<span className="text-accent">+</span>
          </p>
          <a
            href="https://github.com/jorgeasaurus/graphexplorerplus"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted transition-colors hover:text-text-secondary"
          >
            GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
