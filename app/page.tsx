import Link from "next/link";
import { runQuery, DatabaseUnavailableError, DatabaseConfigError } from "@/lib/neo4j";
import { QUERIES } from "@/lib/queries";
import { DbErrorState, Stat } from "@/components/ui";
import type { GraphStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    href: "/explore",
    title: "Degrees of Separation",
    body: "Pick any two artists and watch the shortest collaboration path light up between them.",
  },
  {
    href: "/artists",
    title: "Artist Profiles",
    body: "See an artist's bands, songs, and who influenced them — all in one connected view.",
  },
  {
    href: "/genres",
    title: "Genre Webs",
    body: "Browse how genres bind artists and songs together across the network.",
  },
];

export default async function Home() {
  let stats: GraphStats | null = null;
  let error: string | null = null;

  try {
    const { records } = await runQuery<GraphStats>(QUERIES.stats.cypher);
    if (records[0]) stats = records[0];
  } catch (err) {
    if (
      err instanceof DatabaseUnavailableError ||
      err instanceof DatabaseConfigError
    ) {
      error = err.message;
    } else {
      error = "Unexpected error loading the graph.";
    }
  }

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          Powered by a graph database
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Explore how music is{" "}
          <span className="text-indigo-600 dark:text-indigo-400">connected</span>.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          SonicGraph maps artists, bands, genres, songs and labels as a living
          network. The interesting questions aren&apos;t &ldquo;list the rows&rdquo; —
          they&apos;re &ldquo;how is this artist two steps away from that one?&rdquo;
          That is exactly what a graph database is built for.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/explore"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Start exploring →
          </Link>
          <Link
            href="/model"
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            See the data model
          </Link>
        </div>
      </section>

      {error ? (
        <DbErrorState message={error} />
      ) : stats ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Artists" value={stats.artists} />
          <Stat label="Bands" value={stats.bands} />
          <Stat label="Songs" value={stats.songs} />
          <Stat label="Genres" value={stats.genres} />
          <Stat label="Labels" value={stats.labels} />
          <Stat label="Links" value={stats.relationships} />
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5"
          >
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {f.body}
            </p>
            <span className="mt-3 inline-block text-sm text-indigo-600 group-hover:underline dark:text-indigo-400">
              Open →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
