export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-200 animate-pulse rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
      <SkeletonLine className="h-4 w-24" />
      <SkeletonLine className="h-8 w-16" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 4 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonLine className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-6 py-4">
              <SkeletonLine className={`h-4 ${j === 0 ? 'w-40' : 'w-24'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
