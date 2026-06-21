import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { tournament } from "@/lib/config";

// Branded link-preview card (WhatsApp, Twitter/X, Discord, iMessage, etc.).
export const runtime = "nodejs";
// Generate on demand rather than prerendering: avoids a @vercel/og
// fileURLToPath("Invalid URL") crash during `next build` on Windows.
export const dynamic = "force-dynamic";
export const alt = `${tournament.name} — ${tournament.prizePool} CS2 tournament`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Embed the logo as a data URI so it renders inside the generated image.
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  // Load the font ourselves. Passing `fonts` explicitly stops @vercel/og from
  // auto-loading its bundled default font, which builds an invalid path and
  // crashes on Windows ("Invalid URL" / fileURLToPath).
  const fontData = await readFile(join(process.cwd(), "public", "fonts", "noto-sans-regular.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #1a1430 0%, #0a0810 55%, #07060b 100%)",
          color: "#fff",
          fontFamily: "Noto Sans",
          position: "relative",
        }}
      >
        {/* neon glow accents */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(79,227,255,0.35), transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(232,121,249,0.35), transparent 70%)",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} alt="" width={150} height={150} style={{ objectFit: "contain" }} />

        <div
          style={{
            marginTop: 28,
            fontSize: 88,
            fontWeight: 900,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          <span style={{ color: "#4fe3ff" }}>CS2</span>
          <span style={{ color: "#fff", margin: "0 18px" }}> </span>
          <span style={{ color: "#e879f9" }}>SHOWDOWN</span>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 34,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          <span>{tournament.prizePool} Prize Pool</span>
          <span style={{ color: "#3f3a52" }}>•</span>
          <span>5v5</span>
        </div>

        <div
          style={{
            marginTop: 40,
            fontSize: 26,
            letterSpacing: 6,
            color: "#a9a4bf",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {tournament.organizer}
          <span style={{ color: "#4fe3ff", margin: "0 14px" }}>×</span>
          {tournament.partner}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Sans", data: fontData, style: "normal", weight: 400 }],
    },
  );
}
