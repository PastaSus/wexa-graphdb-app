import Link from "next/link";
import { notFound } from "next/navigation";
import { runQuery, DatabaseUnavailableError, DatabaseConfigError } from "@/lib/neo4j";
import { QUERIES } from "@/lib/queries";
import { DbErrorState, EmptyState, Chip, BackLink } from "@/components/ui";
import type { ConnectionResult } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ProfileRow {
  a: { properties: { name: string; country: string; activeSince: number } };
  bands: { band: string; role: string; years: number }[];
  songs: { title: string; year: number; streams: number }[];
  influencedBy: string[];
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let profile: ProfileRow | null = null;
  let connections: ConnectionResult[] = [];
  let error: string | null = null;

  try {
    const { records } = await runQuery<ProfileRow>(
      QUERIES.artistProfile.cypher,
      { id }
    );
    profile = records[0] ?? null;

    if (profile) {
      const { records: conn } = await runQuery<ConnectionResult>(
        QUERIES.collaborationWeb.cypher,
        { name: profile.a.properties.name, limit: 40 }
      );
      connections = conn;
    }
  } catch (err) {
    if (
      err instanceof DatabaseUnavailableError ||
      err instanceof DatabaseConfigError
    ) {
      error = err.message;
    } else {
      error = "Unexpected error loading this artist.";
    }
  }

  if (error) return <DbErrorState message={error} />;
  if (!profile) notFound();

  const { name, country, activeSince } = profile.a.properties;

  return (
    <div className="space-y-8">
      <BackLink href="/artists" label="All artists" />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {country} · active since {activeSince}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Bands">
          {profile.bands.filter((b) => b.band).length === 0 ? (
            <EmptyState title="No bands listed" />
          ) : (
            <ul className="space-y-2">
              {profile.bands
                .filter((b) => b.band)
                .map((b, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-black/5 bg-white p-3 dark:bg-white/5"
                  >
                    <div className="font-medium">{b.band}</div>
                    <div className="text-xs text-slate-500">
                      {b.role} · {b.years} yr
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Section>

        <Section title="Songs played on">
          {profile.songs.filter((s) => s.title).length === 0 ? (
            <EmptyState title="No songs listed" />
          ) : (
            <ul className="space-y-2">
              {profile.songs
                .filter((s) => s.title)
                .map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-black/5 bg-white p-3 dark:bg-white/5"
                  >
                    <span className="font-medium">{s.title}</span>
                    <span className="text-xs text-slate-500">
                      {s.year} · {s.streams}M
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </Section>

        <Section title="Influenced by">
          {profile.influencedBy.filter(Boolean).length === 0 ? (
            <EmptyState title="No influences listed" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.influencedBy
                .filter(Boolean)
                .map((n, i) => (
                  <Chip key={i}>{n}</Chip>
                ))}
            </div>
          )}
        </Section>
      </div>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Collaboration web
          </h2>
          <span className="text-sm text-slate-500">
            artists 2–3 hops away via shared bandmates
          </span>
        </div>
        {connections.length === 0 ? (
          <EmptyState
            title="No secondary connections"
            hint="This artist sits at the edge of the seeded graph."
          />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((c, i) => (
              <li
                key={i}
                className="rounded-lg border border-black/5 bg-white p-3 dark:bg-white/5"
              >
                <Link
                  href={`/artists/${encodeURIComponent(c.elementId)}`}
                  className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {c.name}
                </Link>
                <div className="text-xs text-slate-500">via {c.via}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </div>
  );
}
