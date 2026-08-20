"use client";

import { DbErrorState } from "@/components/ui";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto max-w-xl p-10">
          <DbErrorState message={error.message || "Something went wrong."} />
        </div>
      </body>
    </html>
  );
}
