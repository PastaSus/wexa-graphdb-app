import { NextResponse } from "next/server";
import {
  runQuery,
  DatabaseUnavailableError,
  DatabaseConfigError,
} from "@/lib/neo4j";
import { QUERIES } from "@/lib/queries";
import type { DegreePath } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "Both 'from' and 'to' artist names are required." },
      { status: 400 }
    );
  }

  try {
    const { records } = await runQuery<DegreePath>(
      QUERIES.degreesOfSeparation.cypher,
      { from, to }
    );
    if (records.length === 0) {
      return NextResponse.json(
        { error: `No path found between “${from}” and “${to}”.` },
        { status: 404 }
      );
    }
    return NextResponse.json(records[0]);
  } catch (err) {
    if (
      err instanceof DatabaseUnavailableError ||
      err instanceof DatabaseConfigError
    ) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Unexpected error querying the graph." },
      { status: 500 }
    );
  }
}
