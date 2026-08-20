import DegreeExplorer from "@/components/DegreeExplorer";
import { runQuery, DatabaseUnavailableError, DatabaseConfigError } from "@/lib/neo4j";
import { QUERIES } from "@/lib/queries";
import { DbErrorState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  let artists: { elementId: string; name: string }[] = [];
  let error: string | null = null;

  try {
    const { records } = await runQuery<{ elementId: string; name: string }>(
      QUERIES.listArtists.cypher
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
        <h1 className="text-3xl font-semibold tracking-tight">
          Degrees of Separation
        </h1>
        <p className="mt-1 max-w-2xl text-slate-600 dark:text-slate-300">
          This is the query a relational database dreads: the shortest path
          between two people across an arbitrary-depth network. Pick any two
          artists and let the graph trace the chain.
        </p>
      </div>

      {error ? (
        <DbErrorState message={error} />
      ) : artists.length === 0 ? (
        <DbErrorState message="The graph is empty. Run `pnpm seed` to load artists." />
      ) : (
        <DegreeExplorer artists={artists} />
      )}
    </div>
  );
}
