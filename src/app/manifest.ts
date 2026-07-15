import type { MetadataRoute } from "next";
import { getRestaurantOnce } from "@/lib/firestore";
import { cloudinaryIconUrl } from "@/lib/cloudinaryIcon";

// ديناميكي بالكامل — بيتقرأ من Firestore مع كل طلب بدل ما يتجمد وقت الـ
// build، عشان أي تعديل في اسم/شعار/لون المطعم من لوحة التحكم يوصل لتطبيق
// الـ PWA من غير الحاجة لعمل deploy جديد على Vercel.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const restaurant = await getRestaurantOnce();
  const name = restaurant?.name ?? "المنيو الرقمي";
  const logoUrl = restaurant?.imageUrl;
  const themeColor = restaurant?.themeColor || "#2f3c93";

  return {
    name,
    short_name: name,
    description: restaurant?.tagline ?? "",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f8fc",
    theme_color: themeColor,
    lang: "ar",
    dir: "rtl",
    icons: logoUrl
      ? [
          {
            src: cloudinaryIconUrl(logoUrl, 192),
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: cloudinaryIconUrl(logoUrl, 512),
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: cloudinaryIconUrl(logoUrl, 512, true),
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ]
      : [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
  };
}
