"use client";

import { API } from "@/constants/routes";
import { cachedFetch } from "@/lib/requestCache";
import type { LatestCollectionHighlight } from "@/types/collection-highlight.types";

const LATEST_HIGHLIGHT_TTL_MS = 5 * 60_000;

type LatestCollectionHighlightResponse = {
  success: boolean;
  message?: string;
  error?: unknown;
  data?: LatestCollectionHighlight;
};

function getErrorMessage(
  payload: LatestCollectionHighlightResponse,
  fallback: string,
) {
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return payload.message ?? fallback;
}

export const collectionService = {
  async getLatestHighlight() {
    return cachedFetch(
      "latest-collection-highlight",
      async () => {
        const response = await fetch(API.COLLECTIONS_LATEST, {
          method: "GET",
          cache: "no-store",
        });

        const payload = (await response.json()) as LatestCollectionHighlightResponse;

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(
            getErrorMessage(payload, "Không thể tải bộ sưu tập mới nhất."),
          );
        }

        return payload.data;
      },
      LATEST_HIGHLIGHT_TTL_MS,
    );
  },
};
