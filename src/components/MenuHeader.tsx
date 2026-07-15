import Image from "next/image";
import type { Restaurant } from "@/types/menu";
import SocialLinks from "@/components/SocialLinks";

export default function MenuHeader({ restaurant }: { restaurant: Restaurant }) {
  const initials = restaurant.name.trim().charAt(0);

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-2 to-base" />
      <div className="mx-auto max-w-3xl px-5 pt-14 pb-12 text-center sm:pt-20 sm:pb-16">
        <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-gold/40 bg-surface text-5xl font-extrabold text-gold shadow-lg sm:h-40 sm:w-40">
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              sizes="(max-width: 640px) 128px, 160px"
              className="object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">
          {restaurant.tagline}
        </h1>

        <SocialLinks restaurant={restaurant} />
      </div>
    </header>
  );
}
