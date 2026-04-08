export function SearchIcon({
  className = "shrink-0 text-text-muted",
  size = 14,
}: {
  className?: string;
  size?: number;
} = {}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
