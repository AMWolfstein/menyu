import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { getRestaurantOnce } from "@/lib/firestore";
import { cloudinaryIconUrl } from "@/lib/cloudinaryIcon";
import { CartProvider } from "@/context/CartContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import OfflineBanner from "@/components/OfflineBanner";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// ديناميكي بالكامل — عنوان الصفحة (Tab) والوصف والأيقونات بيتقروا من
// Firestore مع كل طلب بدل ما يتجمدوا وقت الـ build، عشان أي تعديل لاسم
// المطعم من لوحة التحكم يوصل لعنوان التاب فورًا من غير الحاجة لعمل نشر
// جديد على Vercel (نفس فكرة manifest.ts).
export const dynamic = "force-dynamic";

export async function generateViewport(): Promise<Viewport> {
  const restaurant = await getRestaurantOnce();
  return {
    themeColor: restaurant?.themeColor || "#2f3c93",
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurantOnce();
  return {
    title: restaurant?.name ?? "المنيو الرقمي",
    description: restaurant?.tagline ?? "",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: restaurant?.name ?? "المنيو الرقمي",
    },
    icons: {
      apple: restaurant?.imageUrl
        ? cloudinaryIconUrl(restaurant.imageUrl, 180)
        : "/icons/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <OfflineBanner />
        <CartProvider>{children}</CartProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
