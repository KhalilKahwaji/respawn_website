import type { Metadata } from "next";
import "./globals.css";
import { tournament } from "@/lib/config";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: `${tournament.name} — ${tournament.organizer}`,
  description: `Official ${tournament.shortName} hosted by ${tournament.organizer}. Register your team, secure your slot, and fight for the prize pool.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tektur:wght@500;700;900&family=Chakra+Petch:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-edge/60 mt-20">
          <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Respawn Gaming Lounge" className="h-8 w-auto" />
              <span className="text-sm text-muted">
                © {new Date().getFullYear()} {tournament.organizer}
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted">
              <Link href="/rules" className="hover:text-neon-cyan transition-colors">Rules</Link>
              <Link href="/teams" className="hover:text-neon-cyan transition-colors">Teams</Link>
              <Link href="/status" className="hover:text-neon-cyan transition-colors">Check Status</Link>
              <Link href="/admin" className="hover:text-neon-magenta transition-colors">Admin</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
