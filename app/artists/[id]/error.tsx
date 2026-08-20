"use client";

import { DbErrorState } from "@/components/ui";

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return <DbErrorState message={error.message || "Something went wrong."} />;
}
