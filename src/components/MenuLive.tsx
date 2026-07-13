"use client";

import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import CartBar from "@/components/CartBar";
import { useMenuData } from "@/hooks/useMenuData";

function MenuSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 animate-pulse">
      <div className="mx-auto mb-5 h-20 w-20 rounded-2xl bg-surface" />
      <div className="mx-auto h-8 w-48 rounded bg-surface" />
      <div className="mt-6 space-y-3">
        <div className="h-16 rounded-xl bg-surface/60" />
        <div className="h-16 rounded-xl bg-surface/60" />
        <div className="h-16 rounded-xl bg-surface/60" />
      </div>
    </div>
  );
}

export default function MenuLive() {
  const { restaurant, categories, loading } = useMenuData();

  if (loading) {
    return <MenuSkeleton />;
  }

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-muted">
        <p>لم تتم تعبئة بيانات المطعم بعد.</p>
        <a href="/admin/login" className="mt-4 inline-block text-gold hover:text-gold-soft">
          الذهاب إلى لوحة التحكم
        </a>
      </div>
    );
  }

  const visibleCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.available !== false),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <>
      <MenuHeader restaurant={restaurant} />
      <CategoryNav items={visibleCategories.map((c) => ({ id: c.id, name: c.name }))} />

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
        {visibleCategories.map((category) => (
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} currency={restaurant.currency} />
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

      <CartBar restaurant={restaurant} />
    </>
  );
}
