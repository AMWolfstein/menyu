import Image from "next/image";
import type { Restaurant } from "@/types/menu";
import SocialLinks from "@/components/SocialLinks";

export default function MenuHeader({ restaurant }: { restaurant: Restaurant }) {
  const initials = restaurant.name.trim().charAt(0);

  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-2 to-base" />
      <div className="mx-auto max-w-3xl px-5 pt-12 pb-10 text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gold/40 bg-surface text-3xl font-extrabold text-gold shadow-lg">
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              sizes="80px"
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
