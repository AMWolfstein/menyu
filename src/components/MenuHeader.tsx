import type { Restaurant } from "@/types/menu";

export default function MenuHeader({ restaurant }: { restaurant: Restaurant }) {
  const initials = restaurant.name.trim().charAt(0);

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-2 to-base" />
      <div className="mx-auto max-w-3xl px-5 pt-12 pb-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/40 bg-surface text-3xl font-extrabold text-gold shadow-lg">
          {initials}
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
          {restaurant.name}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gold-soft/90 sm:text-base">
          {restaurant.tagline}
        </p>

        <dl className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <dd>{restaurant.hours}</dd>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <dd>{restaurant.address}</dd>
          </div>
          {restaurant.instagram && (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <dd dir="ltr">{restaurant.instagram}</dd>
            </div>
          )}
        </dl>
      </div>
    </header>
  );
}
