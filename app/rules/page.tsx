import { tournament } from "@/lib/config";

export const metadata = { title: `Rules — ${tournament.name}` };

/**
 * Edit the rules here — each section is plain data, so updating copy
 * never touches layout code.
 */
const sections: { id: string; title: string; rules: string[] }[] = [
  {
    id: "format",
    title: "Tournament format",
    rules: [
      `${tournament.format}, hosted on Faceit.`,
      `Up to ${tournament.maxTeams} teams. Bracket and seeding are managed on Faceit by Respawn admins.`,
      "Map veto follows the standard Faceit veto flow for the active CS2 map pool. (Exact veto order will be confirmed before the bracket is published.)",
      "Match start times are announced on Discord and on the Faceit championship page.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility",
    rules: [
      "Open to all players unless previously banned from Respawn Gaming Lounge events.",
      "Every player must own CS2 in good standing (no VAC ban on record for CS:GO/CS2).",
      "Players may only be rostered on one team. A Steam account or Faceit account found on two rosters disqualifies the later registration.",
    ],
  },
  {
    id: "team-size",
    title: "Team size & substitutes",
    rules: [
      "Rosters are exactly 5 main players + 1 bench (substitute) player.",
      "The bench player may swap in between maps, or mid-match only with admin approval (e.g. disconnect emergencies).",
      "Roster changes after registration require admin approval and are locked once the bracket is published.",
      "Stand-ins not on the registered roster are not allowed.",
    ],
  },
  {
    id: "accounts",
    title: "Faceit & Steam account requirements",
    rules: [
      "Every player needs an active Faceit account with CS2 enabled, matching the username submitted at registration.",
      "Steam64 IDs submitted at registration must match the accounts used in matches.",
      "Accounts must be the player's own primary account — smurfing or account sharing is a disqualifiable offense.",
      "All players must join the Faceit championship lobby before check-in closes.",
    ],
  },
  {
    id: "checkin",
    title: "Check-in",
    rules: [
      "Check-in opens 60 minutes and closes 15 minutes before the scheduled start, on Faceit and in the Discord server.",
      "All 5 main players must check in. Teams that miss check-in forfeit their slot to a waitlisted team where possible.",
    ],
  },
  {
    id: "no-show",
    title: "Late / no-show policy",
    rules: [
      "Teams have 10 minutes from the official match start to be fully connected, after a 10-minute grace period the match is forfeited 0-1.",
      "Repeated delays across the event can result in removal without refund.",
      "If a server/platform issue is at fault, admins will pause or reschedule — admin word is final on what counts as a technical issue.",
    ],
  },
  {
    id: "match-rules",
    title: "Match rules",
    rules: [
      "Matches are played on the Faceit platform with standard competitive CS2 settings (MR12, overtime MR3).",
      "Pauses: each team gets 2 tactical pauses (30s) per map. Technical pauses require an admin or captain call-out in match chat.",
      "Score disputes must be raised with screenshots/demos before the next round of the bracket starts.",
    ],
  },
  {
    id: "anti-cheat",
    title: "Anti-cheat",
    rules: [
      "Faceit Anti-Cheat is mandatory for every player in every match.",
      "Any cheat detection, ban, or refusal to run AC results in immediate team disqualification without refund.",
      "Admins may request demos or a screen-share at any time. Refusing a review counts as a forfeit.",
    ],
  },
  {
    id: "behavior",
    title: "Toxicity & behavior",
    rules: [
      "Hate speech, harassment, threats, or discriminatory language — in-game, in chat, or on Discord — leads to warnings, round penalties, or disqualification at admin discretion.",
      "Intentional throwing, match-fixing, or betting on your own matches is an instant ban from all Respawn events.",
      "Captains are responsible for their team's conduct, including the bench player and any supporters they bring.",
    ],
  },
  {
    id: "payment",
    title: "Payment & refund policy",
    rules: [
      `Entry fee is ${tournament.entryFee}, paid via Whish to the number shown on your payment page, with your registration code in the note.`,
      "A team is only officially registered once an admin approves its payment proof.",
      "Full refund if the event is canceled by the organizers, or if your team withdraws before the registration deadline.",
      "No refunds for withdrawals after the deadline, no-shows, or disqualifications.",
    ],
  },
  {
    id: "admin",
    title: "Admin decisions",
    rules: [
      "Tournament admins have final authority on all disputes, including anything not explicitly covered by these rules.",
      "Rules may be updated before the event starts; registered captains will be notified on Discord of any changes.",
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="section-eyebrow">Official Rulebook</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black uppercase">
        Tournament <span className="neon-cyan">rules</span>
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-400">
        Read these before registering. By submitting a team, the captain confirms the whole roster accepts the
        rulebook and admin authority.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <nav className="hidden lg:block">
          <div className="sticky top-24 card p-4">
            <p className="field-label">Sections</p>
            <ul className="space-y-1 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-md px-2 py-1.5 text-zinc-400 hover:text-neon-cyan hover:bg-neon-cyan/5 transition-colors">
                    <span className="font-mono text-xs text-neon-magenta mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="card scroll-mt-24 p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                <span className="text-neon-magenta mr-2">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {s.rules.map((r, j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-cyan/70" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
