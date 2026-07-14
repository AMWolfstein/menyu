"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { seedInitialData, branchesApi, deliveryZonesApi, paymentMethodsApi } from "@/lib/firestore";
import { restaurant as seedRestaurant, categories as seedCategories } from "@/data/seedData";
import { useMenuData } from "@/hooks/useMenuData";
import { useSimpleList } from "@/hooks/useSimpleList";
import RestaurantForm from "@/components/admin/RestaurantForm";
import CategoryForm from "@/components/admin/CategoryForm";
import ItemForm from "@/components/admin/ItemForm";
import SimpleListManager from "@/components/admin/SimpleListManager";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const { restaurant, categories, loading } = useMenuData();
  const { items: branches } = useSimpleList(branchesApi);
  const { items: deliveryZones } = useSimpleList(deliveryZonesApi);
  const { items: paymentMethods } = useSimpleList(paymentMethodsApi);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
      if (!u) router.push("/admin/login");
    });
  }, [router]);

  if (!authChecked || !user) {
    return (
      <main className="flex flex-1 items-center justify-center py-16 text-muted">
        جارٍ التحقق...
      </main>
    );
  }

  const handleSeed = async () => {
    setSeeding(true);
    await seedInitialData({ restaurant: seedRestaurant, categories: seedCategories });
    setSeeding(false);
  };

  return (
    <main className="flex-1 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold text-cream">لوحة التحكم</h1>
          <button
            onClick={() => signOut(auth)}
            className="text-sm text-muted hover:text-cream"
          >
            تسجيل الخروج
          </button>
        </div>

        {!loading && categories.length === 0 && (
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold-soft">
            <p>لا توجد بيانات في المنيو بعد.</p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="mt-3 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-base transition-colors hover:bg-gold-soft disabled:opacity-50"
            >
              {seeding ? "جارٍ التعبئة..." : "تعبئة البيانات الأولية"}
            </button>
          </div>
        )}

        {!loading && (
          <RestaurantForm restaurant={restaurant} key={restaurant ? "ready" : "empty"} />
        )}
        <CategoryForm categories={categories} />
        <ItemForm categories={categories} currency={restaurant?.currency ?? ""} />
        <SimpleListManager title="الفروع" items={branches} api={branchesApi} />
        <SimpleListManager title="مناطق التوصيل" items={deliveryZones} api={deliveryZonesApi} />
        <SimpleListManager title="طرق الدفع" items={paymentMethods} api={paymentMethodsApi} />
      </div>
    </main>
  );
}
