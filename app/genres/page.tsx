import { runQuery, DatabaseUnavailableError, DatabaseConfigError } from "@/lib/neo4j";
import { QUERIES } from "@/lib/queries";
import { DbErrorState, EmptyState, Chip } from "@/components/ui";

export const dynamic = "force-dynamic";

interface GenreRow {
  name: string;
  description: string;
}
interface ExplorerRow {
  description: string;
  artists: string[];
  songs: { title: string; year: number }[];
}

export default async function GenresPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;

  let genres: GenreRow[] = [];
  let detail: ExplorerRow | null = null;
  let error: string | null = null;

  try {
    const { records } = await runQuery<GenreRow>(QUERIES.listGenres.cypher);
    genres = records;

    if (g) {
      const { records: d } = await runQuery<ExplorerRow>(
        QUERIES.genreExplorer.cypher,
        { genre: g }
      );
      detail = d[0] ?? null;
    }
  } catch (err) {
    if (
      err instanceof DatabaseUnavailableError ||
      err instanceof DatabaseConfigError
    ) {
      error = err.message;
    } else {
      error = "Unexpected error loading genres.";
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Genres</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          Genres are the threads that tie songs and artists into the network.
        </p>
      </div>

      {error ? (
        <DbErrorState message={error} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const active = genre.name === g;
              return (
                <a
                  key={genre.name}
                  href={`/genres?g=${encodeURIComponent(genre.name)}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "border border-black/10 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
                  }`}
                >
                  {genre.name}
                </a>
              );
            })}
          </div>

          {g ? (
            <div className="space-y-5 rounded-2xl border border-black/5 bg-white p-6 dark:bg-white/5">
              <div>
                <h2 className="text-xl font-semibold">{g}</h2>
                {detail?.description && (
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {detail.description}
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Artists
                </h3>
                {detail && detail.artists.filter(Boolean).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {detail.artists.filter(Boolean).map((n, i) => (
                      <Chip key={i}>{n}</Chip>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No artists in this genre yet" />
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Songs
                </h3>
                {detail && detail.songs.filter((s) => s.title).length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {detail.songs
                      .filter((s) => s.title)
                      .map((s, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-black/5 px-3 py-1.5 text-sm dark:border-white/10"
                        >
                          {s.title}{" "}
                          <span className="text-slate-400">({s.year})</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <EmptyState title="No songs in this genre yet" />
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="Select a genre above to explore its network" />
          )}
        </>
      )}
    </div>
  );
}
