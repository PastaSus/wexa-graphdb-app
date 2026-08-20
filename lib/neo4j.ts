import neo4j, { type Driver, type Session } from "neo4j-driver";

const URI = process.env.COGNODB_URI;
const USER = process.env.COGNODB_USER;
const PASSWORD = process.env.COGNODB_PASSWORD;

/**
 * Thrown when the database cannot be reached or credentials are missing.
 * The UI catches this to render a friendly, actionable error state instead
 * of crashing the request.
 */
export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/** Thrown when required connection environment variables are not set. */
export class DatabaseConfigError extends Error {
  constructor(missing: string[]) {
    super(
      `Missing required environment variables: ${missing.join(
        ", "
      )}. Copy .env.local.example to .env.local and fill in your CognoDB credentials.`
    );
    this.name = "DatabaseConfigError";
  }
}

let driver: Driver | null = null;

/**
 * Returns a singleton Neo4j driver connected to the configured CognoDB
 * (or any Bolt/openCypher) instance. Credentials are read strictly from
 * environment variables and are never hardcoded.
 */
export function getDriver(): Driver {
  if (!URI || !USER || !PASSWORD) {
    const missing = [
      !URI && "COGNODB_URI",
      !USER && "COGNODB_USER",
      !PASSWORD && "COGNODB_PASSWORD",
    ].filter(Boolean) as string[];
    throw new DatabaseConfigError(missing);
  }

  if (!driver) {
    driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD), {
      maxConnectionPoolSize: 10,
      // Free c0 instances are burstable; give the first TLS handshake room
      // instead of failing on a cold connection.
      connectionTimeout: 30000,
      maxTransactionRetryTime: 30000,
    });
  }
  return driver;
}

/**
 * Runs a parameterized Cypher query and returns the raw records.
 * Never builds Cypher via string concatenation — every value is passed
 * through the `params` map and bound by the driver.
 */
/**
 * Recursively converts driver-typed values into plain JSON-safe values:
 * Integers → numbers, Nodes → {elementId, labels, properties}, and so on.
 * Record fields default to the driver's typed objects (e.g. an Integer is
 * returned as `{low, high}`), which React cannot render as-is.
 */
function toPlain(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (neo4j.isInt(value)) return value.toNumber();
  if (neo4j.isNode(value)) {
    const properties: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value.properties)) {
      properties[k] = toPlain(v);
    }
    return {
      elementId: value.elementId,
      labels: value.labels,
      properties,
    };
  }
  if (neo4j.isRelationship(value)) {
    return {
      elementId: value.elementId,
      type: value.type,
      properties: toPlain(value.properties),
    };
  }
  if (Array.isArray(value)) return value.map(toPlain);
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, toPlain(v)])
  );
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<{ records: T[]; summary: string }> {
  let session: Session | null = null;
  try {
    const d = getDriver();
    session = d.session({ defaultAccessMode: neo4j.session.READ });
    const result = await session.run(cypher, params);
    return {
      records: result.records.map((r) => toPlain(r.toObject()) as T),
      summary: result.summary.toString(),
    };
  } catch (err) {
    if (
      err instanceof DatabaseConfigError ||
      err instanceof DatabaseUnavailableError
    ) {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : "Unknown database error";
    throw new DatabaseUnavailableError(
      `Could not reach the graph database: ${message}`
    );
  } finally {
    if (session) await session.close();
  }
}

/** Verifies connectivity; used by health checks and the seed script. */
export async function verifyConnectivity(): Promise<void> {
  const d = getDriver();
  await d.verifyConnectivity();
}
