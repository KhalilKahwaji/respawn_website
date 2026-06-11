import { z } from "zod";

const phone = z
  .string()
  .trim()
  .min(7, "Phone number looks too short")
  .max(20, "Phone number looks too long")
  .regex(/^\+?[0-9\s\-()]+$/, "Phone number can only contain digits, spaces, +, -, ()");

const steam64 = z
  .string()
  .trim()
  .regex(/^7656119\d{10}$/, "Steam64 ID must be 17 digits starting with 7656119");

const url = z.string().trim().url("Must be a valid link (https://…)");

export const playerSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(80),
  nickname: z.string().trim().min(1, "Nickname is required").max(40),
  phone,
  steam_profile_url: url.refine(
    (v) => /steamcommunity\.com/i.test(v),
    "Must be a steamcommunity.com profile link",
  ),
  steam64_id: steam64,
  faceit_username: z.string().trim().min(2, "Faceit username is required").max(40),
  faceit_profile_url: url.refine(
    (v) => /faceit\.com/i.test(v),
    "Must be a faceit.com profile link",
  ),
  discord_username: z.string().trim().min(2, "Discord username is required").max(40),
  role: z.enum(["main", "bench"]),
  is_captain: z.boolean(),
});

export const registrationSchema = z
  .object({
    team_name: z.string().trim().min(2, "Team name is required").max(60),
    captain_name: z.string().trim().min(2, "Captain name is required").max(80),
    captain_phone: phone,
    captain_email: z
      .string()
      .trim()
      .email("Invalid email")
      .max(120)
      .optional()
      .or(z.literal("")),
    captain_discord: z.string().trim().min(2, "Captain Discord is required").max(40),
    preferred_contact: z.enum(["whatsapp", "phone", "discord", "email"]),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
    players: z.array(playerSchema).length(6, "Exactly 6 players required (5 main + 1 bench)"),
  })
  .superRefine((data, ctx) => {
    const mains = data.players.filter((p) => p.role === "main");
    const bench = data.players.filter((p) => p.role === "bench");
    if (mains.length !== 5)
      ctx.addIssue({ code: "custom", path: ["players"], message: "Exactly 5 main players required" });
    if (bench.length !== 1)
      ctx.addIssue({ code: "custom", path: ["players"], message: "Exactly 1 bench player required" });

    const captains = data.players.filter((p) => p.is_captain);
    if (captains.length !== 1)
      ctx.addIssue({
        code: "custom",
        path: ["players"],
        message: "Exactly one player must be marked as captain",
      });

    const dupes = (vals: string[]) => {
      const seen = new Set<string>();
      for (const v of vals.map((x) => x.toLowerCase())) {
        if (seen.has(v)) return true;
        seen.add(v);
      }
      return false;
    };
    if (dupes(data.players.map((p) => p.steam64_id)))
      ctx.addIssue({ code: "custom", path: ["players"], message: "Duplicate Steam64 IDs in your roster" });
    if (dupes(data.players.map((p) => p.faceit_username)))
      ctx.addIssue({ code: "custom", path: ["players"], message: "Duplicate Faceit usernames in your roster" });
    if (dupes(data.players.map((p) => p.nickname)))
      ctx.addIssue({ code: "custom", path: ["players"], message: "Duplicate nicknames in your roster" });
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function validateImage(file: File | null, label: string): string | null {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return `${label} must be a PNG, JPG, or WEBP image`;
  if (file.size > MAX_UPLOAD_BYTES) return `${label} must be under 5 MB`;
  return null;
}
