"use client";

import { useState, useCallback, useRef } from "react";
import QueryBuilder from "./_components/query-builder";
import { ResponseViewer } from "./_components/response-viewer";
import { NLQueryBar } from "./_components/nl-query-bar";
import type { GraphResponse } from "~/lib/graph/client";

export default function ExplorerPage() {
  const [response, setResponse] = useState<GraphResponse | null | undefined>(undefined);
  const [request, setRequest] = useState<{ method: string; url: string; headers?: Record<string, string>; body?: string } | undefined>();
  const sendRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [topBasis, setTopBasis] = useState(45);
  const dragging = useRef(false);

  const handleRetry = useCallback(() => {
    sendRef.current?.();
  }, []);

  const handleNLQuery = useCallback((query: { method: string; url: string; body?: string }) => {
    window.dispatchEvent(
      new CustomEvent("select-query", {
        detail: { method: query.method, url: query.url, body: query.body },
      }),
    );
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const container = containerRef.current;
    if (!container) return;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const rect = container.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setTopBasis(Math.min(Math.max(pct, 15), 85));
    };

    const onMouseUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1 flex-col gap-0">
      {/* AI Query Bar */}
      <div className="mb-2">
        <NLQueryBar onQueryGenerated={handleNLQuery} />
      </div>

      {/* Request Panel */}
      <div
        className="flex min-w-0 flex-col overflow-hidden rounded-t-lg border border-border-default bg-bg-surface"
        style={{ flexBasis: `${topBasis}%` }}
      >
        <QueryBuilder onResponse={setResponse} onRequest={setRequest} sendRef={sendRef} />
      </div>

      {/* Draggable Divider */}
      <div
        role="separator"
        aria-label="Resize panels"
        aria-valuenow={Math.round(topBasis)}
        tabIndex={0}
        onMouseDown={handleMouseDown}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const delta = e.key === "ArrowUp" ? -5 : 5;
            setTopBasis((prev) => Math.min(Math.max(prev + delta, 15), 85));
          }
        }}
        className="group relative z-10 flex h-2 shrink-0 cursor-row-resize items-center justify-center"
      >
        <div className="h-px w-full bg-border-subtle transition-colors group-hover:bg-accent" />
        <div className="absolute h-1 w-10 rounded-full bg-border-default transition-colors group-hover:bg-accent" />
      </div>

      {/* Response Panel */}
      <div
        className="flex min-w-0 flex-col overflow-hidden rounded-b-lg border border-border-default bg-bg-surface"
        style={{ flexBasis: `${100 - topBasis}%` }}
      >
        <ResponseViewer response={response} request={request} onRetry={handleRetry} />
      </div>
    </div>
  );
}
