"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroImage } from "@/types/menu";

const SLIDE_INTERVAL_MS = 4000;

export default function HeroCarousel({ images }: { images: HeroImage[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div
      dir="ltr"
      className="relative aspect-[16/7] w-full overflow-hidden bg-surface-2 sm:aspect-[21/7]"
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={img.id} className="relative h-full w-full shrink-0">
            <Image
              src={img.imageUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              aria-label={`الصورة ${i + 1}`}
              className={`h-1.5 rounded-full shadow transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
