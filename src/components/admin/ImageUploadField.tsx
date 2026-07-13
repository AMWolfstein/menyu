"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/storage";
import ProductImagePlaceholder from "@/components/ProductImagePlaceholder";

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder,
}: {
  label: string;
  value: string | undefined;
  onChange: (url: string) => void;
  folder: "items" | "restaurant";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line">
          {value ? (
            <Image src={value} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <ProductImagePlaceholder className="h-full w-full" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-xs text-muted file:ml-2 file:rounded-lg file:border file:border-line file:bg-base/60 file:px-2 file:py-1 file:text-xs file:text-cream"
          />
          {uploading && <span className="text-xs text-muted">جارٍ الرفع...</span>}
          {error && <span className="text-xs text-chili">{error}</span>}
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="w-fit text-xs text-muted hover:text-chili"
            >
              إزالة الصورة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
