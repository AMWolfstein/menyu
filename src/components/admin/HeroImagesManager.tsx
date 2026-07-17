"use client";

import Image from "next/image";
import { addHeroImage, removeHeroImage } from "@/lib/firestore";
import { useHeroImages } from "@/hooks/useHeroImages";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { TrashIcon } from "@/components/admin/icons";

export default function HeroImagesManager() {
  const { images } = useHeroImages();

  const handleUpload = async (url: string) => {
    if (!url) return;
    await addHeroImage(url, images.length);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("حذف الصورة دي من البانر؟")) return;
    await removeHeroImage(id);
  };

  return (
    <div className="rounded-xl border border-line bg-surface/60 p-5">
      <h2 className="font-display text-lg font-bold text-cream">صور البانر المتحرك</h2>
      <p className="mt-1 text-xs text-muted">
        بتظهر كصور متحركة أعلى الصفحة الرئيسية أسفل الشريط العلوي مباشرة — ارفع بقد ما تحب.
      </p>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-video overflow-hidden rounded-lg border border-line"
            >
              <Image src={img.imageUrl} alt="" fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                aria-label="حذف الصورة"
                className="absolute inset-0 flex items-center justify-center bg-cream/60 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <TrashIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <ImageUploadField label="إضافة صورة جديدة" value={undefined} onChange={handleUpload} folder="restaurant" />
      </div>
    </div>
  );
}
