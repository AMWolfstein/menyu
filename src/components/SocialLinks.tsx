import type { Restaurant } from "@/types/menu";

function IconLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-gold/40 hover:text-gold"
    >
      {children}
    </a>
  );
}

export default function SocialLinks({ restaurant }: { restaurant: Restaurant }) {
  const links = [
    {
      key: "facebook",
      url: restaurant.facebookUrl,
      label: "فيسبوك",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.2C16.5 3.1 15.4 3 14.2 3c-2.6 0-4.4 1.6-4.4 4.5v2.3H7.1V13H9.8v8h3.7Z" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      url: restaurant.whatsappUrl,
      label: "واتساب",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-2-1.2-.7-.6-1.2-1.4-1.4-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5-.1.5-.2 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      url: restaurant.instagramUrl,
      label: "انستغرام",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="h-5 w-5"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      url: restaurant.tiktokUrl,
      label: "تيك توك",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M16.5 3c.3 1.9 1.6 3.4 3.5 3.7v2.7c-1.3 0-2.5-.4-3.5-1.1v6.4a5.7 5.7 0 1 1-5.7-5.7c.2 0 .4 0 .6.1v2.8a2.9 2.9 0 1 0 2.1 2.8V3h3Z" />
        </svg>
      ),
    },
    {
      key: "googleMaps",
      url: restaurant.googleMapsUrl,
      label: "الموقع على الخريطة",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="h-5 w-5"
        >
          <path d="M12 22s7-7.4 7-12.5A7 7 0 0 0 5 9.5C5 14.6 12 22 12 22Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      ),
    },
  ];

  const visible = links.filter(
    (l): l is typeof l & { url: string } => !!l.url
  );

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {visible.map((l) => (
        <IconLink key={l.key} href={l.url} label={l.label} external>
          {l.icon}
        </IconLink>
      ))}
      <IconLink href="/menu" label="صور المنيو للمشاركة">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="h-5 w-5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M3 9h18M8 3v6" strokeLinecap="round" />
          <path d="M7 14h5M7 17h8" strokeLinecap="round" />
        </svg>
      </IconLink>
    </div>
  );
}
