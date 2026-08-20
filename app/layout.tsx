import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "SonicGraph — Music Collaboration & Influence Network",
  description:
    "Explore how artists, bands, genres and labels connect through a graph database.",
};

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/artists", label: "Artists" },
  { href: "/genres", label: "Genres" },
  { href: "/model", label: "Data Model" },
];

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 border-b border-black/5 bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-sm text-white">
                ◆
              </span>
              <span className="tracking-tight">SonicGraph</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
          {children}
        </main>

        <footer className="border-t border-black/5 py-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 text-sm text-slate-500 sm:flex-row">
            <p>SonicGraph — a CognoDB graph database demo.</p>
            <p>Built with Next.js &amp; the official Neo4j driver.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
