"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { signIn, signOut } from "~/lib/auth/authUtils";
import { type CloudEnvironment } from "~/lib/auth/msalConfig";
import { ThemeToggle } from "~/components/theme-toggle";
import { CloudEnvironmentDialog } from "./explorer/_components/cloud-environment-dialog";

// ── Typewriter effect for the AI demo ──────────────────────

function useTypewriter(text: string, speed = 40, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ── Feature data (real, built features only) ───────────────

const FEATURES = [
  {
    label: "AI Queries",
    title: "Natural Language to Graph API",
    description: "Describe what you need in plain English. AI translates it to the exact Graph API call.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
  },
  {
    label: "8 Languages",
    title: "Code Snippets with SDK Links",
    description: "Instant code generation in PowerShell, JavaScript, C#, Python, Go, Java, PHP, and cURL.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    label: "27K Endpoints",
    title: "Resource Explorer",
    description: "Browse the entire Graph API surface as a navigable tree with instant search.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
      </svg>
    ),
  },
  {
    label: "Permissions",
    title: "Consent Flow & Token Inspector",
    description: "See required scopes per endpoint, consent inline, and decode your JWT in real time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    label: "Multi-Cloud",
    title: "5 Sovereign Cloud Environments",
    description: "Global, US Gov, US Gov DoD, Germany, and China. Switch without re-authenticating.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.466.733-3.559" />
      </svg>
    ),
  },
  {
    label: "Share & Expand",
    title: "Shareable URLs & Fullscreen",
    description: "Copy a link to any query. Expand responses fullscreen for complex payloads.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
      </svg>
    ),
  },
];

// ── Stat counter ───────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          let start = 0;
          const duration = 1200;
          const step = Math.ceil(target / (duration / 16));
          const interval = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(start);
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ── Nav auth controls ──────────────────────────────────────

function NavAuthControls({
  isLoading,
  isAuth,
  displayName,
}: {
  isLoading: boolean;
  isAuth: boolean;
  displayName: string | undefined;
}): React.ReactNode {
  const [showCloudDialog, setShowCloudDialog] = useState(false);

  const handleCloudSelect = async (env: CloudEnvironment) => {
    setShowCloudDialog(false);
    try {
      await signIn(env);
    } catch (err) {
      console.error("Sign in error:", err);
    }
  };

  if (isLoading) {
    return <span className="px-4 py-2 text-sm text-text-muted">Signing in...</span>;
  }

  if (isAuth) {
    return (
      <>
        <span className="hidden px-4 py-2 text-sm font-medium text-text-secondary sm:block">
          {displayName}
        </span>
        <button
          onClick={() => void signOut()}
          className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Sign Out
        </button>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowCloudDialog(true)}
        className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        Sign In
      </button>
      <CloudEnvironmentDialog
        open={showCloudDialog}
        onCancel={() => setShowCloudDialog(false)}
        onSelect={(env) => void handleCloudSelect(env)}
      />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────

export default function Home() {
  const isAuth = useIsAuthenticated();
  const { accounts, inProgress } = useMsal();
  const displayName = accounts[0]?.name;
  const isLoading = inProgress !== InteractionStatus.None;

  const nlQuery = "Show me all users with admin roles";
  const { displayed: typedQuery, done: queryDone } = useTypewriter(nlQuery, 45, 1200);

  const generatedMethod = "GET";
  const generatedUrl = "/v1.0/directoryRoles?$expand=members";

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-deep font-sans text-text-primary">
      {/* ── Grid background ── */}
      <div
        aria-hidden="true"
        className="animate-grid-drift pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-accent) 0 1px, transparent 1px 80px), repeating-linear-gradient(90deg, var(--color-accent) 0 1px, transparent 1px 80px)",
        }}
      />

      {/* ── Hero glow ── */}
      <div
        aria-hidden="true"
        className="animate-glow-pulse pointer-events-none absolute left-1/2 top-[20%] z-0 h-[700px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,170,0.10) 0%, rgba(0,212,170,0.03) 45%, transparent 70%)",
        }}
      />

      {/* ── Nav ── */}
      <nav className="animate-fade-in sticky top-0 z-50 border-b border-border-subtle bg-bg-deep/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-sans text-lg font-bold tracking-tight text-text-primary">
            Graph Explorer<span className="text-accent">+</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NavAuthControls isLoading={isLoading} isAuth={isAuth} displayName={displayName} />
            <Link
              href="/explorer"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg-deep transition-colors hover:bg-accent-hover"
            >
              Launch Explorer
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-4 pt-20 text-center sm:pt-28 md:pt-36">
        <p
          className="animate-fade-in mb-5 font-mono text-xs font-medium uppercase tracking-[0.25em] text-accent"
          style={{ animationDelay: "0.05s" }}
        >
          The power-user Graph API tool
        </p>

        <h1
          className="animate-fade-up text-5xl font-bold leading-[0.9] tracking-tighter sm:text-7xl md:text-8xl"
          style={{ textWrap: "balance" }}
        >
          <span className="bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">
            Ask in English.
          </span>
          <br />
          <span className="bg-gradient-to-b from-text-primary to-text-secondary bg-clip-text text-transparent">
            Get the API call.
          </span>
        </h1>

        <p
          className="animate-fade-up mx-auto mt-6 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg"
          style={{ animationDelay: "0.12s" }}
        >
          AI-powered query builder, 27K endpoint autocomplete, 8-language code snippets, permission consent flow, and everything the official explorer doesn&apos;t have.
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            href="/explorer"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-8 text-base font-semibold text-bg-deep shadow-[0_0_32px_rgba(0,212,170,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_48px_rgba(0,212,170,0.3)]"
          >
            Launch Explorer
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
          <a
            href="https://github.com/jorgeasaurus/graphexplorerplus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border-default px-8 text-base font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
            </svg>
            GitHub
          </a>
        </div>
      </section>

      {/* ── AI Demo Card ── */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <div
          className="animate-fade-up overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-[0_0_80px_rgba(0,212,170,0.05)]"
          style={{ animationDelay: "0.35s" }}
        >
          {/* Natural language input */}
          <div className="border-b border-border-subtle px-5 py-4">
            <div className="mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-accent">
                AI Query Builder
              </span>
            </div>
            <p className="font-sans text-base text-text-primary">
              {typedQuery}
              {!queryDone && <span className="animate-terminal-blink ml-0.5 inline-block h-4 w-0.5 bg-accent align-middle" />}
            </p>
          </div>

          {/* Generated API call */}
          <div className="bg-bg-deep/50 px-5 py-4">
            <div
              className={`transition-all duration-500 ${queryDone ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
            >
              <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-widest text-text-muted">
                Generated API Call
              </p>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="rounded bg-method-get/15 px-2 py-0.5 text-xs font-bold text-method-get">
                  {generatedMethod}
                </span>
                <span className="text-text-secondary">
                  {generatedUrl}
                </span>
              </div>
            </div>
          </div>

          {/* Mock response preview */}
          <div
            className={`border-t border-border-subtle px-5 py-4 transition-all delay-300 duration-500 ${queryDone ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-success/15 px-2 py-0.5 font-mono text-xs font-semibold text-success">
                200 OK
              </span>
              <span className="font-mono text-xs text-text-muted">38ms</span>
              <span className="font-mono text-xs text-text-muted">2.1 KB</span>
            </div>

            <pre className="font-mono text-xs leading-relaxed">
              <span className="text-text-muted">{"{"}</span>{"\n"}
              <span className="text-text-muted">{"  "}</span>
              <span className="text-accent">&quot;value&quot;</span>
              <span className="text-text-muted">: [{"{"} </span>
              <span className="text-accent">&quot;displayName&quot;</span>
              <span className="text-text-muted">: </span>
              <span className="text-method-put">&quot;Global Administrator&quot;</span>
              <span className="text-text-muted">, </span>
              <span className="text-accent">&quot;members&quot;</span>
              <span className="text-text-muted">: [...]</span>
              <span className="text-text-muted"> {"}"}]</span>{"\n"}
              <span className="text-text-muted">{"}"}</span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section
        className="animate-fade-up relative z-10 mx-auto max-w-4xl px-6 py-6"
        style={{ animationDelay: "0.5s" }}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: 27000, suffix: "+", label: "Endpoints" },
            { value: 8, suffix: "", label: "Languages" },
            { value: 198, suffix: "", label: "Sample Queries" },
            { value: 5, suffix: "", label: "Cloud Envs" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-mono text-2xl font-bold tabular-nums text-text-primary sm:text-3xl">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.label}
              className="animate-fade-up group rounded-xl border border-border-subtle bg-bg-surface/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/20 hover:bg-bg-surface"
              style={{ animationDelay: `${0.55 + i * 0.06}s` }}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-accent transition-colors group-hover:bg-accent-muted">
                  {feature.icon}
                </div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
                  {feature.label}
                </span>
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-tertiary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section
        className="animate-fade-up relative z-10 mx-auto max-w-2xl px-6 pb-20 text-center"
        style={{ animationDelay: "0.8s" }}
      >
        <p className="mb-6 text-lg font-medium text-text-secondary">
          Ready to explore?
        </p>
        <Link
          href="/explorer"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-10 text-base font-semibold text-bg-deep shadow-[0_0_32px_rgba(0,212,170,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_48px_rgba(0,212,170,0.3)]"
        >
          Launch Graph Explorer+
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <p className="text-sm text-text-muted">
            Built for power users
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jorgeasaurus/graphexplorerplus/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text-secondary"
            >
              Report Issue
            </a>
            <a
              href="https://github.com/jorgeasaurus/graphexplorerplus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted transition-colors hover:text-text-secondary"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
