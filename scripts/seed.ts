/**
 * Seed script for SonicGraph — loads a realistic music collaboration and
 * influence graph into CognoDB (or any Bolt/openCypher database).
 *
 * Run with:  pnpm seed
 *
 * All writes use MERGE on a unique business key, so the script is safe to
 * re-run. Every value is passed as a driver parameter — never concatenated
 * into the Cypher string.
 */
import { loadEnvConfig } from "@next/env";
import neo4j from "neo4j-driver";

loadEnvConfig(process.cwd());

const URI = process.env.COGNODB_URI;
const USER = process.env.COGNODB_USER;
const PASSWORD = process.env.COGNODB_PASSWORD;

if (!URI || !USER || !PASSWORD) {
  console.error(
    "Missing COGNODB_URI / COGNODB_USER / COGNODB_PASSWORD in .env.local"
  );
  process.exit(1);
}

// ---- Curated, realistic core dataset --------------------------------------

const genres = [
  { name: "Rock", description: "Guitar-driven music with strong rhythms." },
  { name: "Pop", description: "Catchy, melody-forward mainstream music." },
  { name: "Jazz", description: "Improvisation-heavy music with complex harmony." },
  { name: "Hip-Hop", description: "Rhythmical spoken-word and beat culture." },
  { name: "Electronic", description: "Synthesizer and computer-generated sound." },
  { name: "Folk", description: "Acoustic, story-song tradition." },
  { name: "Metal", description: "Heavy, distorted, high-energy rock." },
  { name: "R&B", description: "Rhythm and blues; soulful vocal tradition." },
];

const labels = [
  { name: "Meridian Records", country: "United States" },
  { name: "Northwind Audio", country: "United Kingdom" },
  { name: "Lumen Sounds", country: "Sweden" },
  { name: "Atlas Independent", country: "United States" },
  { name: "Cobalt Tracks", country: "Germany" },
  { name: "Pacific Wave", country: "Japan" },
];

const artists = [
  { name: "Mara Vance", country: "United States", activeSince: 2009 },
  { name: "Eli Frost", country: "United Kingdom", activeSince: 2006 },
  { name: "Noor Haddad", country: "Lebanon", activeSince: 2012 },
  { name: "Theo Lindqvist", country: "Sweden", activeSince: 2003 },
  { name: "Camille Roux", country: "France", activeSince: 2010 },
  { name: "Diego Salas", country: "Mexico", activeSince: 2014 },
  { name: "Yuki Tanaka", country: "Japan", activeSince: 2008 },
  { name: "Ada Okafor", country: "Nigeria", activeSince: 2011 },
  { name: "Liam Byrne", country: "Ireland", activeSince: 2007 },
  { name: "Priya Nair", country: "India", activeSince: 2013 },
  { name: "Sven Erikkson", country: "Sweden", activeSince: 1999 },
  { name: "Bianca Ferri", country: "Italy", activeSince: 2015 },
  { name: "Marcus Cole", country: "United States", activeSince: 2004 },
  { name: "Hana Kim", country: "South Korea", activeSince: 2016 },
  { name: "Olusegun Ade", country: "Nigeria", activeSince: 2009 },
  { name: "Greta Holm", country: "Denmark", activeSince: 2012 },
  { name: "Tom Becker", country: "Germany", activeSince: 2005 },
  { name: "Ines Costa", country: "Portugal", activeSince: 2017 },
  { name: "Ravi Menon", country: "India", activeSince: 2008 },
  { name: "Sofia Marquez", country: "Spain", activeSince: 2013 },
];

const bands = [
  { name: "Velvet Circuit", formed: 2008, country: "United States" },
  { name: "The Northlights", formed: 2005, country: "United Kingdom" },
  { name: "Sahel Sound", formed: 2011, country: "Nigeria" },
  { name: "Aurora Collective", formed: 2010, country: "Sweden" },
  { name: "Cobalt Wave", formed: 2014, country: "Germany" },
  { name: "Pacific Drift", formed: 2012, country: "Japan" },
  { name: "Ironwood", formed: 2003, country: "United States" },
  { name: "Lumen Choir", formed: 2015, country: "Italy" },
];

// artist -> role, years in band
const memberships: Array<[string, string, string, number]> = [
  ["Mara Vance", "Velvet Circuit", "Lead vocals", 8],
  ["Marcus Cole", "Velvet Circuit", "Guitar", 8],
  ["Yuki Tanaka", "Velvet Circuit", "Keys", 5],
  ["Eli Frost", "The Northlights", "Vocals", 12],
  ["Liam Byrne", "The Northlights", "Bass", 12],
  ["Camille Roux", "The Northlights", "Guitar", 6],
  ["Ada Okafor", "Sahel Sound", "Vocals", 9],
  ["Olusegun Ade", "Sahel Sound", "Drums", 9],
  ["Diego Salas", "Sahel Sound", "Guitar", 4],
  ["Theo Lindqvist", "Aurora Collective", "Production", 11],
  ["Greta Holm", "Aurora Collective", "Vocals", 9],
  ["Sven Erikkson", "Aurora Collective", "Strings", 14],
  ["Tom Becker", "Cobalt Wave", "Synth", 8],
  ["Ines Costa", "Cobalt Wave", "Vocals", 6],
  ["Hana Kim", "Pacific Drift", "Vocals", 7],
  ["Yuki Tanaka", "Pacific Drift", "Keys", 7],
  ["Ravi Menon", "Ironwood", "Guitar", 16],
  ["Marcus Cole", "Ironwood", "Guitar", 10],
  ["Bianca Ferri", "Lumen Choir", "Vocals", 6],
  ["Sofia Marquez", "Lumen Choir", "Vocals", 5],
];

// songs: title, year, streams(millions), genre, band, playedBy[]
const songs: Array<{
  title: string;
  year: number;
  streams: number;
  genre: string;
  band: string;
  playedBy: string[];
}> = [
  { title: "Neon Tide", year: 2016, streams: 312, genre: "Pop", band: "Velvet Circuit", playedBy: ["Mara Vance", "Marcus Cole"] },
  { title: "Glass Horizon", year: 2018, streams: 188, genre: "Electronic", band: "Velvet Circuit", playedBy: ["Yuki Tanaka"] },
  { title: "Rain on Camden", year: 2011, streams: 240, genre: "Rock", band: "The Northlights", playedBy: ["Eli Frost", "Liam Byrne"] },
  { title: "Stone Harbor", year: 2019, streams: 156, genre: "Folk", band: "The Northlights", playedBy: ["Camille Roux"] },
  { title: "Sahara Line", year: 2013, streams: 420, genre: "R&B", band: "Sahel Sound", playedBy: ["Ada Okafor", "Olusegun Ade"] },
  { title: "Lagos Pulse", year: 2017, streams: 275, genre: "Hip-Hop", band: "Sahel Sound", playedBy: ["Diego Salas"] },
  { title: "Northern Glow", year: 2015, streams: 198, genre: "Electronic", band: "Aurora Collective", playedBy: ["Theo Lindqvist", "Greta Holm"] },
  { title: "Midnight Aurora", year: 2020, streams: 333, genre: "Pop", band: "Aurora Collective", playedBy: ["Sven Erikkson"] },
  { title: "Cobalt Dreams", year: 2016, streams: 142, genre: "Electronic", band: "Cobalt Wave", playedBy: ["Tom Becker"] },
  { title: "Lisbon Static", year: 2021, streams: 121, genre: "Pop", band: "Cobalt Wave", playedBy: ["Ines Costa"] },
  { title: "Drift Away", year: 2018, streams: 263, genre: "Folk", band: "Pacific Drift", playedBy: ["Hana Kim", "Yuki Tanaka"] },
  { title: "Tokyo Embers", year: 2022, streams: 290, genre: "Electronic", band: "Pacific Drift", playedBy: ["Hana Kim"] },
  { title: "Ironwood Anthem", year: 2009, streams: 410, genre: "Metal", band: "Ironwood", playedBy: ["Ravi Menon", "Marcus Cole"] },
  { title: "Cedar and Steel", year: 2014, streams: 176, genre: "Rock", band: "Ironwood", playedBy: ["Ravi Menon"] },
  { title: "Choir of Light", year: 2019, streams: 134, genre: "Pop", band: "Lumen Choir", playedBy: ["Bianca Ferri", "Sofia Marquez"] },
  { title: "Vespers", year: 2021, streams: 98, genre: "Jazz", band: "Lumen Choir", playedBy: ["Sofia Marquez"] },
];

// influence edges (who was influenced by whom)
const influences: Array<[string, string]> = [
  ["Hana Kim", "Yuki Tanaka"],
  ["Diego Salas", "Ada Okafor"],
  ["Ines Costa", "Greta Holm"],
  ["Sofia Marquez", "Camille Roux"],
  ["Bianca Ferri", "Greta Holm"],
  ["Priya Nair", "Ravi Menon"],
  ["Noor Haddad", "Ada Okafor"],
  ["Greta Holm", "Eli Frost"],
];

// band -> label
const signings: Array<[string, string]> = [
  ["Velvet Circuit", "Meridian Records"],
  ["The Northlights", "Northwind Audio"],
  ["Sahel Sound", "Atlas Independent"],
  ["Aurora Collective", "Lumen Sounds"],
  ["Cobalt Wave", "Cobalt Tracks"],
  ["Pacific Drift", "Pacific Wave"],
  ["Ironwood", "Meridian Records"],
  ["Lumen Choir", "Atlas Independent"],
];

// ---- Seed execution -------------------------------------------------------

async function main() {
  const driver = neo4j.driver(URI!, neo4j.auth.basic(USER!, PASSWORD!));
  const session = driver.session();
  console.log("Connected to graph database. Seeding...");

  try {
    // Constraints for fast, idempotent MERGE
    await session.run(
      "CREATE CONSTRAINT artist_name IF NOT EXISTS FOR (a:Artist) REQUIRE a.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT band_name IF NOT EXISTS FOR (b:Band) REQUIRE b.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT song_title IF NOT EXISTS FOR (s:Song) REQUIRE s.title IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT label_name IF NOT EXISTS FOR (l:Label) REQUIRE l.name IS UNIQUE"
    );

    for (const g of genres)
      await session.run(
        "MERGE (g:Genre {name: $name}) SET g.description = $description",
        g
      );
    for (const l of labels)
      await session.run(
        "MERGE (l:Label {name: $name}) SET l.country = $country",
        l
      );
    for (const a of artists)
      await session.run(
        "MERGE (a:Artist {name: $name}) SET a.country = $country, a.activeSince = $activeSince",
        a
      );
    for (const b of bands)
      await session.run(
        "MERGE (b:Band {name: $name}) SET b.formed = $formed, b.country = $country",
        b
      );

    for (const [artist, band, role, years] of memberships)
      await session.run(
        `MATCH (a:Artist {name: $artist}), (b:Band {name: $band})
         MERGE (a)-[r:MEMBER_OF]->(b)
         SET r.role = $role, r.years = $years`,
        { artist, band, role, years }
      );

    for (const s of songs) {
      await session.run(
        `MERGE (s:Song {title: $title})
         SET s.year = $year, s.streams = $streams
         WITH s
         MATCH (g:Genre {name: $genre})
         MERGE (s)-[:BELONGS_TO_GENRE]->(g)
         WITH s
         MATCH (b:Band {name: $band})
         MERGE (b)-[:RELEASED]->(s)
         WITH s
         UNWIND $playedBy AS pname
         MATCH (a:Artist {name: pname})
         MERGE (a)-[:PLAYED_ON]->(s)`,
        { ...s }
      );
    }

    for (const [from, to] of influences)
      await session.run(
        `MATCH (a:Artist {name: $from}), (b:Artist {name: $to})
         MERGE (a)-[:INFLUENCED_BY]->(b)`,
        { from, to }
      );

    for (const [band, label] of signings)
      await session.run(
        `MATCH (b:Band {name: $band}), (l:Label {name: $label})
         MERGE (b)-[:SIGNED_TO]->(l)`,
        { band, label }
      );

    // Expand volume: each band releases a handful of extra songs so the
    // graph reaches a few hundred nodes while staying fully connected.
    const extraStyles = ["(Reprise)", "(Live)", "(Remix)", "(Acoustic)"];
    for (const s of songs) {
      for (const style of extraStyles) {
        const title = `${s.title} ${style}`;
        await session.run(
          `MERGE (s:Song {title: $title})
           SET s.year = $year, s.streams = $streams
           WITH s
           MATCH (g:Genre {name: $genre})
           MERGE (s)-[:BELONGS_TO_GENRE]->(g)
           WITH s
           MATCH (b:Band {name: $band})
           MERGE (b)-[:RELEASED]->(s)
           WITH s
           UNWIND $playedBy AS pname
           MATCH (a:Artist {name: pname})
           MERGE (a)-[:PLAYED_ON]->(s)`,
          { title, year: s.year, streams: Math.round(s.streams / 4), genre: s.genre, band: s.band, playedBy: s.playedBy }
        );
      }
    }

    console.log("Seed complete.");
  } finally {
    await session.close();
    await driver.close();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
