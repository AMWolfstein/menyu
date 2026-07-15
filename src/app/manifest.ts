import type { MetadataRoute } from "next";
import { getRestaurantOnce } from "@/lib/firestore";
import { cloudinaryIconUrl } from "@/lib/cloudinaryIcon";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const restaurant = await getRestaurantOnce();
  const name = restaurant?.name ?? "المنيو الرقمي";
  const logoUrl = restaurant?.imageUrl;

  return {
    name,
    short_name: name,
    description: restaurant?.tagline ?? "",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b1220",
    theme_color: "#0b1220",
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
