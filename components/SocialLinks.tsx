import { lounge } from "@/lib/config";

/** Inline SVG so the icons inherit colour and need no external requests. */
const icons = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M19.3 5.4A16.7 16.7 0 0 0 15.2 4l-.3.6a12.7 12.7 0 0 1 3.7 1.5 12 12 0 0 0-9.2-.4c-.5.2-.9.3-1.2.5A12.6 12.6 0 0 1 12 4.6L11.7 4a16.7 16.7 0 0 0-4.1 1.4C5 9.2 4.3 12.9 4.6 16.5a16.8 16.8 0 0 0 5.1 2.6l.9-1.4a10.9 10.9 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 10.3 0l.4.3c-.5.3-1.1.6-1.7.8l.9 1.4a16.8 16.8 0 0 0 5.1-2.6c.4-4.2-.7-7.8-2.9-11.1ZM9.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm4.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M5 4h3.5l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L15 13l4 1.5V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
    </svg>
  ),
};

/** Instagram / Discord / phone, as glowing icon buttons. */
export default function SocialLinks({ className = "" }: { className?: string }) {
  const tel = `tel:${lounge.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {lounge.instagramUrl && (
        <a
          href={lounge.instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`${lounge.name} on Instagram`}
          title="Instagram"
          className="social social-instagram"
        >
          {icons.instagram}
        </a>
      )}
      <a
        href={lounge.discordUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${lounge.name} Discord server`}
        title="Discord"
        className="social social-discord"
      >
        {icons.discord}
      </a>
      <a href={tel} aria-label={`Call ${lounge.phone}`} title={lounge.phone} className="social social-phone">
        {icons.phone}
      </a>
    </div>
  );
}
