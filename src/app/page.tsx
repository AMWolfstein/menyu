import MenuLive from "@/components/MenuLive";
import { getRestaurantOnce, getMenuOnce } from "@/lib/firestore";

export default async function Home() {
  // قراءة مرة واحدة على السيرفر (بدون اشتراك حي) — بس لبناء بيانات SEO
  // المنسّقة (JSON-LD)؛ صفحة المنيو الفعلية لسه بتاخد بياناتها الحية من
  // MenuLive عبر onSnapshot زي ما هي، من غير أي تغيير في سلوكها.
  const [restaurant, categories] = await Promise.all([getRestaurantOnce(), getMenuOnce()]);

  const jsonLd = restaurant
    ? {
        "@context": "https://schema.org",
        "@type": "Store",
        name: restaurant.name,
        description: restaurant.tagline,
        telephone: restaurant.phone,
        ...(restaurant.imageUrl && { image: restaurant.imageUrl }),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "المنيو",
          itemListElement: categories.flatMap((category) =>
            category.items.map((item) => ({
              "@type": "Offer",
              price: item.discountPrice ?? item.price,
              priceCurrency: "EGP",
              itemOffered: {
                "@type": "Product",
                name: item.name,
                description: item.description,
                ...(item.imageUrl && { image: item.imageUrl }),
                category: category.name,
              },
            }))
          ),
        },
      }
    : null;

  return (
    <main className="flex-1">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <MenuLive />
    </main>
  );
}
