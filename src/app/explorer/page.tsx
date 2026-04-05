"use client";

import { useState } from "react";
import QueryBuilder from "./_components/query-builder";
import { ResponseViewer } from "./_components/response-viewer";
import type { GraphResponse } from "~/lib/graph/client";

export default function ExplorerPage() {
  const [response, setResponse] = useState<GraphResponse | null | undefined>(undefined);
  const [request, setRequest] = useState<{ method: string; url: string; headers?: Record<string, string>; body?: string } | undefined>();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-0">
      {/* Request Panel – 45% */}
      <div className="flex min-w-0 basis-[45%] flex-col overflow-hidden rounded-t-lg border border-border-default bg-bg-surface">
        <QueryBuilder onResponse={setResponse} onRequest={setRequest} />
      </div>

      {/* Draggable Divider */}
      <div
        role="separator"
        aria-label="Resize panels"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const container = e.currentTarget.parentElement;
            if (!container) return;
            const top = container.children[0] as HTMLElement;
            const bottom = container.children[2] as HTMLElement;
            const currentBasis = parseFloat(top.style.flexBasis || "45");
            const delta = e.key === "ArrowUp" ? -5 : 5;
            const newTop = Math.min(Math.max(currentBasis + delta, 10), 90);
            top.style.flexBasis = `${newTop}%`;
            bottom.style.flexBasis = `${100 - newTop}%`;
          }
        }}
        className="group relative z-10 flex h-1.5 shrink-0 cursor-row-resize items-center justify-center"
      >
        <div className="h-px w-full bg-border-subtle transition-colors group-hover:bg-accent" />
        <div className="absolute h-1 w-8 rounded-full bg-border-default transition-colors group-hover:bg-accent" />
      </div>

      {/* Response Panel – 55% */}
      <div className="flex min-w-0 basis-[55%] flex-col overflow-hidden rounded-b-lg border border-border-default bg-bg-surface">
        <ResponseViewer response={response} request={request} />
      </div>
    </div>
  );
}
