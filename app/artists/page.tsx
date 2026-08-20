import Link from "next/link";
import { runQuery, DatabaseUnavailableError, DatabaseConfigError } from "@/lib/neo4j";
import { QUERIES } from "@/lib/queries";
import { DbErrorState, EmptyState } from "@/components/ui";
import type { Artist } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  let artists: Artist[] = [];
  let error: string | null = null;

  try {
    const { records } = await runQuery<Artist>(
      QUERIES.searchArtists.cypher,
      { term: q, limit: 60 }
    );
    artists = records;
  } catch (err) {
    if (
      err instanceof DatabaseUnavailableError ||
      err instanceof DatabaseConfigError
    ) {
      error = err.message;
    } else {
      error = "Unexpected error loading artists.";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Artists</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Search the network by name, then open a profile to see their
          connections.
        </p>
      </div>

      <form action="/artists" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search artists…"
          className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-white/15 dark:bg-white/5"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {error ? (
        <DbErrorState message={error} />
      ) : artists.length === 0 ? (
        <EmptyState
          title="No artists found"
          hint={q ? `Nothing matches “${q}”.` : "The graph is empty — run the seed script."}
        />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((a) => (
            <li key={a.elementId}>
              <Link
                href={`/artists/${encodeURIComponent(a.elementId)}`}
                className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5"
              >
                <span className="font-medium">{a.name}</span>
                <span className="text-xs text-slate-500">{a.country}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
