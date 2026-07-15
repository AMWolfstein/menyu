import Image from "next/image";

export default function ProductImagePlaceholder({
  className,
  logoUrl,
}: {
  className?: string;
  /** شعار المحل — لو موجود بيتعرض بدل أيقونة الثلج الافتراضية. */
  logoUrl?: string;
}) {
  if (logoUrl) {
    return (
      <div className={`relative bg-surface-2 ${className ?? ""}`}>
        <Image src={logoUrl} alt="" fill sizes="200px" className="object-contain" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center bg-surface-2 ${className ?? ""}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-line"
      >
        <path d="M12 2v20M4.5 6l15 12M19.5 6l-15 12" />
        <path d="M12 2 9.5 4.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5" />
        <path d="M4.5 6 6 9M4.5 6 2 7.5M19.5 6 18 9M19.5 6 22 7.5" />
        <path d="M4.5 18 6 15M4.5 18 2 16.5M19.5 18 18 15M19.5 18 22 16.5" />
      </svg>
    </div>
  );
}
