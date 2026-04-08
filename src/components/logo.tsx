export function Logo({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Graph Explorer Plus"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M10 22V14l6-4 6 4v8"
        stroke="var(--color-bg-deep, #09090b)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 18v4"
        stroke="var(--color-bg-deep, #09090b)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 8h-4M22 6v4"
        stroke="var(--color-bg-deep, #09090b)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
