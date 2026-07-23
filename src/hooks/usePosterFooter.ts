"use client";

import { useEffect, useState } from "react";
import { subscribePosterFooter } from "@/lib/firestore";
import { DEFAULT_POSTER_FOOTER, type PosterFooterInfo } from "@/types/menu";

export function usePosterFooter(): PosterFooterInfo {
  const [footer, setFooter] = useState<PosterFooterInfo | null>(null);

  useEffect(() => subscribePosterFooter(setFooter), []);

  return footer ?? DEFAULT_POSTER_FOOTER;
}
