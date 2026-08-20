export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-24 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="h-9 w-64 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl bg-black/5 dark:bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}
