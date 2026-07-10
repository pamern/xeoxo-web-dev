type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  lastAccessedAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
const MAX_CACHE_ENTRIES = 100;

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function evictLeastRecentlyUsedEntry() {
  let oldestKey: string | null = null;
  let oldestAccessTime = Number.POSITIVE_INFINITY;

  for (const [key, entry] of store.entries()) {
    if (entry.lastAccessedAt < oldestAccessTime) {
      oldestAccessTime = entry.lastAccessedAt;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    store.delete(oldestKey);
  }
}

// Cache in-memory phía client cho các API GET ít đổi (chi tiết sản phẩm, size chart...).
// Dedupe request trùng key đang bay + giữ kết quả trong `ttlMs` để tránh gọi lại API không cần thiết.
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const cached = store.get(key);
  if (cached && cached.expiresAt > now) {
    cached.lastAccessedAt = now;
    return cached.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = fetcher()
    .then((value) => {
      if (!store.has(key) && store.size >= MAX_CACHE_ENTRIES) {
        evictLeastRecentlyUsedEntry();
      }

      store.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
        lastAccessedAt: Date.now(),
      });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

export function invalidateCache(keyPrefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  }
}
