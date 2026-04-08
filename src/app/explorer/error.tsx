"use client";

export default function ExplorerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Explorer Error</h2>
        <p className="mb-4 text-sm text-text-muted">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="rounded-md bg-accent-muted px-4 py-2 text-sm font-medium text-accent hover:opacity-80 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
