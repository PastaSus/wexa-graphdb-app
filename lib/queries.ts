/**
 * All Cypher used by the application, centralized in one place and always
 * parameterized. Every `$param` is bound by the official Neo4j driver — no
 * string concatenation of user input ever reaches the database.
 */
export const QUERIES = {
  /** Total node and relationship counts for the dashboard. */
  stats: {
    description:
      "Counts of each node label and the total number of relationships. Surfaces the shape of the graph at a glance.",
    cypher: `
      MATCH (a:Artist) WITH count(a) AS artists
      MATCH (b:Band) WITH artists, count(b) AS bands
      MATCH (s:Song) WITH artists, bands, count(s) AS songs
      MATCH (g:Genre) WITH artists, bands, songs, count(g) AS genres
      MATCH (l:Label) WITH artists, bands, songs, genres, count(l) AS labels
      MATCH ()-[r]->() WITH artists, bands, songs, genres, labels, count(r) AS relationships
      RETURN artists, bands, songs, genres, labels, relationships
    `,
  },

  /** Autocomplete-style artist search by name prefix. */
  searchArtists: {
    description:
      "Finds artists whose name starts with the search term. Powers the non-technical explorer's search box.",
    cypher: `
      MATCH (a:Artist)
      WHERE toLower(a.name) STARTS WITH toLower($term)
      RETURN elementId(a) AS elementId, a.name AS name,
             a.country AS country, a.activeSince AS activeSince
      ORDER BY a.name
      LIMIT $limit
    `,
  },

  /** Full profile of one artist: bands, songs, and influence links. */
  artistProfile: {
    description:
      "Assembles an artist's bands (with their role), the songs they played on, and who influenced them. Several 1-hop reads composed in one query.",
    cypher: `
      MATCH (a:Artist)
      WHERE elementId(a) = $id
      OPTIONAL MATCH (a)-[m:MEMBER_OF]->(b:Band)
      OPTIONAL MATCH (a)-[:PLAYED_ON]->(s:Song)
      OPTIONAL MATCH (a)-[:INFLUENCED_BY]->(inf:Artist)
      RETURN a,
             collect(DISTINCT {band: b.name, role: m.role, years: m.years}) AS bands,
             collect(DISTINCT {title: s.title, year: s.year, streams: s.streams}) AS songs,
             collect(DISTINCT inf.name) AS influencedBy
    `,
  },

  /**
   * MULTI-HOP TRAVERSAL (3 hops). Finds artists connected to the chosen
   * artist through a chain of shared band memberships:
   *   Artist → Band ← bandmate → other Band ← collaborator
   * This is the kind of query that requires nested self-joins in SQL and
   * is trivial (and fast) as a graph traversal.
   */
  collaborationWeb: {
    description:
      "Multi-hop (3-hop) traversal: artists linked through shared bandmates' other projects. Awkward in SQL, natural as a graph walk.",
    cypher: `
      MATCH (a:Artist {name: $name})-[:MEMBER_OF]->(:Band)<-[:MEMBER_OF]-(bandmate:Artist)
      MATCH (bandmate)-[:MEMBER_OF]->(otherBand:Band)<-[:MEMBER_OF]-(collaborator:Artist)
      WHERE collaborator <> a AND otherBand IS NOT NULL
      RETURN DISTINCT collaborator.name AS name,
                      elementId(collaborator) AS elementId,
                      otherBand.name AS via
      ORDER BY via, name
      LIMIT $limit
    `,
  },

  /**
   * RELATIONAL-AWKWARD QUERY. Degrees of separation (shortest path) between
   * two artists across the whole collaboration/influence graph. A true
   * shortest-path over an arbitrary-depth graph cannot be expressed in
   * relational SQL without recursive stored procedures or explosive joins.
   */
  degreesOfSeparation: {
    description:
      "Shortest path (degrees of separation) between two artists across the entire graph. The canonical graph-native query SQL cannot express directly.",
    cypher: `
      MATCH p = shortestPath(
        (from:Artist {name: $from})-[*]-(to:Artist {name: $to})
      )
      RETURN [n IN nodes(p) |
        { label: head(labels(n)), name: coalesce(n.name, n.title, head(labels(n))) }
      ] AS path,
      length(p) AS degrees
    `,
  },

  /** Browse artists and songs by genre. */
  genreExplorer: {
    description:
      "Lists the artists and songs attached to a genre via BELONGS_TO_GENRE. Shows how genres tie the graph together.",
    cypher: `
      MATCH (g:Genre {name: $genre})<-[:BELONGS_TO_GENRE]-(s:Song)<-[:PLAYED_ON]-(a:Artist)
      RETURN g.description AS description,
             collect(DISTINCT a.name) AS artists,
             collect(DISTINCT {title: s.title, year: s.year}) AS songs
      LIMIT 1
    `,
  },

  /** All genre labels, for the genre picker. */
  listGenres: {
    description: "Returns every genre in the graph for the browse picker.",
    cypher: `
      MATCH (g:Genre)
      RETURN g.name AS name, g.description AS description
      ORDER BY g.name
    `,
  },

  /** All artists (name + id) for dropdowns and pickers. */
  listArtists: {
    description: "Returns every artist's name and id for selection UIs.",
    cypher: `
      MATCH (a:Artist)
      RETURN elementId(a) AS elementId, a.name AS name
      ORDER BY a.name
    `,
  },
} as const;

export type QueryName = keyof typeof QUERIES;
