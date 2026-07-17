"use client";

import { useEffect, useState } from "react";
import { subscribeHeroImages } from "@/lib/firestore";
import type { HeroImage } from "@/types/menu";

export function useHeroImages(): { images: HeroImage[]; loading: boolean } {
  const [images, setImages] = useState<HeroImage[] | null>(null);

  useEffect(() => subscribeHeroImages(setImages), []);

  return { images: images ?? [], loading: images === null };
}
