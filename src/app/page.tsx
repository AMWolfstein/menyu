import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import { categories, restaurant } from "@/data/menu";

export default function Home() {
  return (
    <main className="flex-1">
      <MenuHeader />
      <CategoryNav items={categories.map((c) => ({ id: c.id, name: c.name }))} />

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        {categories.map((category) => (
          <section
            key={category.id}
            id={`cat-${category.id}`}
            className="scroll-mt-24 pt-8 first:pt-2"
          >
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-xl font-extrabold text-cream">
                {category.name}
              </h2>
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs text-muted">
                {category.items.length} أصناف
              </span>
            </div>

            <div className="grid gap-3">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-muted">
          <p dir="ltr" className="font-display text-sm text-cream">
            {restaurant.phone}
          </p>
          <p className="mt-2">{restaurant.name} — جميع الأسعار شاملة الخدمة</p>
          <p className="mt-4">
            <a
              href="/qr"
              className="text-gold transition-colors hover:text-gold-soft"
            >
              عرض رمز QR للطاولات
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
