"use client";

import { useState } from "react";

interface ArtistOption {
  elementId: string;
  name: string;
}

export default function DegreeExplorer({
  artists,
}: {
  artists: ArtistOption[];
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [path, setPath] = useState<{ label: string; name: string }[] | null>(
    null
  );
  const [degrees, setDegrees] = useState<number | null>(null);

  async function compute() {
    setError(null);
    setPath(null);
    if (!from || !to) {
      setError("Please choose two artists.");
      return;
    }
    if (from === to) {
      setError("Choose two different artists.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/degree?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
      } else {
        setPath(data.path);
        setDegrees(data.degrees);
      }
    } catch {
      setError("Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label="Artist A" value={from} onChange={setFrom} artists={artists} />
        <Select label="Artist B" value={to} onChange={setTo} artists={artists} />
      </div>

      <button
        onClick={compute}
        disabled={loading}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Tracing path…" : "Find the connection"}
      </button>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          {error}
        </div>
      )}

      {path && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {degrees} degree{degrees === 1 ? "" : "s"} of separation
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {path.map((node, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium shadow-sm dark:bg-white/10">
                  {node.name}
                  <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {node.label}
                  </span>
                </span>
                {i < path.length - 1 && (
                  <span className="text-slate-400">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  artists,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  artists: ArtistOption[];
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-white/15 dark:bg-white/5"
      >
        <option value="">Select an artist…</option>
        {artists.map((a) => (
          <option key={a.elementId} value={a.name}>
            {a.name}
          </option>
        ))}
      </select>
    </label>
  );
}
