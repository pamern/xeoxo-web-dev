"use client";

import { useEffect, useState } from "react";
import { collectionService } from "@/services/collection.service";
import type { LatestCollectionHighlight } from "@/types/collection-highlight.types";

export function useLatestCollectionHighlight() {
  const [highlight, setHighlight] = useState<LatestCollectionHighlight | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHighlight() {
      try {
        const data = await collectionService.getLatestHighlight();
        if (active) {
          setHighlight(data);
        }
      } catch {
        if (active) {
          setHighlight(null);
        }
      }
    }

    void loadHighlight();

    return () => {
      active = false;
    };
  }, []);

  return highlight;
}
