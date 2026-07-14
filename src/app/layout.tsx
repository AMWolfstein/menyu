import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { getRestaurantOnce } from "@/lib/firestore";
import { CartProvider } from "@/context/CartContext";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

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
      apple: "/icons/apple-touch-icon.png",
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
        <CartProvider>{children}</CartProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
