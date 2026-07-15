"use client";

import { useEffect, useState } from "react";
import { subscribePosterLinks } from "@/lib/firestore";
import type { PosterLink } from "@/types/menu";

export function usePosterLinks(): { links: PosterLink[]; loading: boolean } {
  const [links, setLinks] = useState<PosterLink[] | null>(null);

  useEffect(() => subscribePosterLinks(setLinks), []);

  return { links: links ?? [], loading: links === null };
}
