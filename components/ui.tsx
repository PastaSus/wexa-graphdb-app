import Link from "next/link";

/** Friendly error state shown when the database is unreachable or unconfigured. */
export function DbErrorState({ message }: { message: string }) {
  const isConfig =
    message.includes("Missing required environment") ||
    message.includes("COGNODB");
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
        {isConfig ? "Database not configured" : "Could not reach the database"}
      </h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{message}</p>
      {isConfig && (
        <div className="mt-4 rounded-lg bg-white/70 p-4 text-sm dark:bg-black/20">
          <p className="mb-2 font-medium">To connect SonicGraph to CognoDB:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Copy <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.local.example</code> to{" "}
              <code className="rounded bg-black/5 px-1 dark:bg-white/10">.env.local</code>
            </li>
            <li>
              Provision a free c0 instance at{" "}
              <a className="underline" href="https://console.cognodb.com/signup">
                console.cognodb.com
              </a>{" "}
              and paste the URI + password
            </li>
            <li>
              Run <code className="rounded bg-black/5 px-1 dark:bg-white/10">pnpm seed</code> to load the graph
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/40 p-10 text-center dark:border-slate-700 dark:bg-white/5">
      <p className="font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {hint && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 text-center shadow-sm dark:bg-white/5">
      <div className="text-2xl font-semibold tracking-tight text-indigo-600 dark:text-indigo-300">
        {value}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
      {children}
    </span>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm text-slate-500 transition-colors hover:text-indigo-600"
    >
      ← {label}
    </Link>
  );
}
