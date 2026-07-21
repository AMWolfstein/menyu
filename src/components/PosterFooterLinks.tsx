import type { PosterLink, PosterLinkPlatform } from "@/types/menu";

// نفس ملاحظة MenuPosterCard.tsx: العنصر ده بيتعرض جوّا منطقة بتتحوّل
// لصورة (html-to-image)، فكل الألوان لازم تكون inline styles بس، مش كلاسات
// Tailwind — عشان كده الألوان بتوصل كـ prop من المكوّن اللي بيستخدمه.

type PosterColors = {
  navy: string;
  gold: string;
  red: string;
  dark: string;
  muted: string;
  gray: string;
  white: string;
  line: string;
};

function PlatformIcon({ platform, color }: { platform: PosterLinkPlatform; color: string }) {
  const size = { width: 15, height: 15 };
  switch (platform) {
    case "whatsapp":
      return (
        <svg {...size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5-.1.5-.2 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...size} viewBox="0 0 24 24" fill={color}>
          <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.2C16.5 3.1 15.4 3 14.2 3c-2.6 0-4.4 1.6-4.4 4.5v2.3H7.1V13H9.8v8h3.7Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill={color} stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...size} viewBox="0 0 24 24" fill={color}>
          <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.7v2.7c-1.3 0-2.5-.4-3.5-1.1v6.4a5.7 5.7 0 1 1-5.7-5.7c.2 0 .4 0 .6.1v2.8a2.9 2.9 0 1 0 2.1 2.8V3h3Z" />
        </svg>
      );
    case "phone":
      return (
        <svg {...size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
          <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case "location":
      return (
        <svg {...size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6}>
          <path d="M12 22s7-7.4 7-12.5A7 7 0 0 0 5 9.5C5 14.6 12 22 12 22Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
  }
}

export default function PosterFooterLinks({
  links,
  colors,
}: {
  links: PosterLink[];
  colors: PosterColors;
}) {
  if (links.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      {links.map((link) => (
        <span key={link.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PlatformIcon platform={link.platform} color={colors.navy} />
          <span style={{ fontSize: 12, color: colors.muted }}>{link.label}</span>
        </span>
      ))}
    </div>
  );
}
