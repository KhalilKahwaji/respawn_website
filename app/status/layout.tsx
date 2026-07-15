// Metadata for the (client-rendered) status page lives here because client
// components can't export `metadata` themselves.
export const metadata = {
  title: "Check Registration Status",
  description:
    "Track your team's registration for Respawn Heatwave 2026 - look up your status with your registration code or the captain's phone number.",
  alternates: { canonical: "/status" },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
