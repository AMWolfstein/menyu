import Image from "next/image";
import type { MenuItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";

const badgeStyles: Record<NonNullable<MenuItem["badge"]>, string> = {
  "الأكثر طلباً": "bg-gold/15 text-gold-soft border-gold/30",
  جديد: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  نباتي: "bg-green-600/15 text-green-300 border-green-600/30",
  حار: "bg-chili/15 text-chili border-chili/30",
};

export default function MenuItemCard({
  item,
  currency,
}: {
  item: MenuItem;
  currency: string;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface/60 transition-colors hover:border-gold/40 hover:bg-surface-2">
      <div className="relative h-48 w-full shrink-0">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <ProductImagePlaceholder className="h-full w-full" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold text-cream">
            {item.name}
          </h3>
          {item.badge && (
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeStyles[item.badge]}`}
            >
              {item.badge}
            </span>
          )}
        </div>

        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">
          {item.description}
        </p>

        <div className="mt-4 rounded-lg bg-base/60 px-3 py-2 text-center font-display text-sm font-bold text-gold">
          {formatPrice(item.price, currency)}
        </div>
      </div>
    </article>
  );
}
