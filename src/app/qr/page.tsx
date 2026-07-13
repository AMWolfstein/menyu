"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useMenuData } from "@/hooks/useMenuData";

export default function QrPage() {
  const { restaurant } = useMenuData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(origin);
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, origin, {
        width: 260,
        margin: 1,
        color: { dark: "#14110d", light: "#f4eee3" },
      });
    }
  }, []);

  const download = () => {
    const link = document.createElement("a");
    link.download = "menyu-qr.png";
    link.href = canvasRef.current?.toDataURL("image/png") ?? "";
    link.click();
  };

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface/60 p-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-cream">
          {restaurant?.name ?? "المنيو الرقمي"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          امسح الرمز لعرض المنيو على هاتفك
        </p>

        <div className="mx-auto mt-7 w-fit rounded-xl bg-cream p-4">
          <canvas ref={canvasRef} />
        </div>

        {url && (
          <p dir="ltr" className="mt-5 break-all text-xs text-muted">
            {url}
          </p>
        )}

        <button
          onClick={download}
          className="mt-6 w-full rounded-lg bg-gold py-2.5 font-display text-sm font-bold text-base transition-colors hover:bg-gold-soft"
        >
          تنزيل الرمز للطباعة
        </button>

        <a
          href="/"
          className="mt-4 inline-block text-sm text-gold transition-colors hover:text-gold-soft"
        >
          العودة إلى المنيو
        </a>
      </div>
    </main>
  );
}
