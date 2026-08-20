import { QUERIES } from "@/lib/queries";

const NODES = [
  { label: "Artist", props: "name, country, activeSince" },
  { label: "Band", props: "name, formed, country" },
  { label: "Song", props: "title, year, streams" },
  { label: "Genre", props: "name, description" },
  { label: "Label", props: "name, country" },
];

const RELS = [
  "Artist -[:MEMBER_OF {role, years}]-> Band",
  "Artist -[:PLAYED_ON]-> Song",
  "Band -[:RELEASED]-> Song",
  "Song -[:BELONGS_TO_GENRE]-> Genre",
  "Artist -[:INFLUENCED_BY]-> Artist",
  "Band -[:SIGNED_TO]-> Label",
];

export default function ModelPage() {
  return (
    <div className="prose-graph max-w-3xl space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Data Model</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          How SonicGraph is modeled as a graph, and why that matters.
        </p>
      </header>

      <section>
        <h2>Why a graph database?</h2>
        <p>
          A relational schema would store artists, bands, songs and genres in
          separate tables joined by foreign keys. That works for &ldquo;show me
          this artist&rsquo;s songs,&rdquo; but it fights you the moment the
          question becomes about <em>relationships</em>:
        </p>
        <ul>
          <li>
            <strong>Degrees of separation</strong> — the shortest chain linking
            two artists — needs recursive self-joins of unbounded depth in SQL,
            or a stored procedure. In a graph it is a single{" "}
            <code>shortestPath</code> call.
          </li>
          <li>
            <strong>Multi-hop collaboration webs</strong> — &ldquo;artists
            connected through shared bandmates&rsquo; other projects&rdquo; — are
            natural walks in a graph and explosive, slow joins in SQL.
          </li>
          <li>
            The data is inherently connected and uneven: one artist is in three
            bands, another in none. A schema-less-ish labeled-property graph
            models that without empty columns or junction-table explosions.
          </li>
        </ul>
      </section>

      <section>
        <h2>The model</h2>
        <div className="not-prose grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NODES.map((n) => (
            <div
              key={n.label}
              className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20"
            >
              <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                {n.label}
              </div>
              <div className="mt-1 font-mono text-xs text-slate-500">
                {n.props}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Relationships (typed, and some carry properties):
        </p>
        <ul className="mt-2 space-y-1 font-mono text-sm">
          {RELS.map((r) => (
            <li
              key={r}
              className="rounded-lg bg-black/5 px-3 py-2 dark:bg-white/5"
            >
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Main queries</h2>
        <p>
          Every query below is parameterized through the official Neo4j driver —
          user input is never concatenated into Cypher.
        </p>
        <div className="not-prose space-y-5">
          {Object.entries(QUERIES).map(([name, q]) => (
            <div
              key={name}
              className="rounded-2xl border border-black/5 bg-white p-5 dark:bg-white/5"
            >
              <h3 className="font-semibold">{name}</h3>
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                {q.description}
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
                <code>{q.cypher.trim()}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
