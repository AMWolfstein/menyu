"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import type { Restaurant } from "@/types/menu";

export default function TopBar({
  restaurant,
  searchQuery,
  onSearchChange,
}: {
  restaurant: Restaurant;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}) {
  const { itemCount, isOpen, setIsOpen } = useCart();
  const [showSearch, setShowSearch] = useState(false);

  const closeSearch = () => {
    setShowSearch(false);
    onSearchChange("");
  };

  return (
    <div className="sticky top-0 z-30 h-14 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-3 px-4">
        {showSearch ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن صنف..."
              className="w-full rounded-lg border border-line bg-base px-3 py-1.5 text-sm text-cream placeholder:text-muted focus:border-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={closeSearch}
              aria-label="إغلاق البحث"
              className="shrink-0 text-sm text-muted hover:text-cream"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
              {restaurant.imageUrl && (
                <Image
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                aria-label="بحث"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-cream"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="السلة"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-cream"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M6 6h15l-1.5 9h-12z" />
                  <path d="M6 6 5 3H2" />
                  <circle cx="9.5" cy="19.5" r="1.5" />
                  <circle cx="17.5" cy="19.5" r="1.5" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -end-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-chili px-1 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
