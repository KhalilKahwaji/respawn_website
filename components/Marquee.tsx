/**
 * Infinite neon ticker. The item list is rendered twice and the track slides
 * exactly half its width, so the loop is seamless with no JavaScript at all.
 * Hovering pauses it (see .marquee in globals.css).
 */
export default function Marquee({ items }: { items: string[] }) {
  const strip = (key: string) => (
    <div className="marquee-track" key={key} aria-hidden={key === "b"}>
      {[...items, ...items].map((item, i) => (
        <span className="marquee-item" key={`${key}-${i}`}>
          <span className="marquee-dot" aria-hidden />
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee border-y border-edge/60 bg-panel/40 py-3">
      {strip("a")}
    </div>
  );
}
