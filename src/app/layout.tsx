import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { doc, getDoc } from "firebase/firestore";
import "./globals.css";
import { db } from "@/lib/firebase";
import type { Restaurant } from "@/types/menu";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const snap = await getDoc(doc(db, "settings", "restaurant"));
    const restaurant = snap.exists() ? (snap.data() as Restaurant) : null;
    return {
      title: `${restaurant?.name ?? "المنيو الرقمي"} — المنيو الرقمي`,
      description: restaurant?.tagline ?? "",
    };
  } catch {
    return { title: "المنيو الرقمي", description: "" };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
