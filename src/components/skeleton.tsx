export function Skeleton({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonLine({ width = "100%" }: { width?: string | number }) {
  return <Skeleton height={14} width={width} className="my-1" />;
}

const SKELETON_WIDTHS = ["75%", "88%", "65%", "92%", "70%", "85%", "78%", "95%", "68%", "82%"];

export function SkeletonBlock({ lines = 6 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]} />
      ))}
    </div>
  );
}
