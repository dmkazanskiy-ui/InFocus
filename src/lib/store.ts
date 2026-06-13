// In-memory cache hydrated once at startup, with synchronous reads/writes that
// write-through to the cloud backend. This keeps the rest of the app on a
// simple synchronous API while data actually lives in Telegram CloudStorage.
import * as cloud from "./cloud";

const cache = new Map<string, string>();

/** Prefix for per-day entry keys, e.g. "d_2026-06-13". */
export const DAY_PREFIX = "d_";

const SYNCED_FLAG = "infocus:cloud_synced";

function hasDayKeys(): boolean {
  for (const k of cache.keys()) if (k.startsWith(DAY_PREFIX)) return true;
  return false;
}

/** Load all persisted data into the cache. Call once before rendering. */
export async function hydrate(): Promise<void> {
  cache.clear();
  const all = await cloud.loadAll();
  for (const [k, v] of Object.entries(all)) cache.set(k, v);

  // Migrate legacy single "entries" blob (older localStorage format) → per-day keys.
  const legacy = cache.get("entries");
  if (legacy && !hasDayKeys()) {
    try {
      const obj = JSON.parse(legacy) as Record<string, unknown>;
      for (const [date, entry] of Object.entries(obj)) {
        set(DAY_PREFIX + date, JSON.stringify(entry));
      }
    } catch {
      /* ignore malformed legacy data */
    }
    remove("entries");
  }

  // First launch inside Telegram: push any pre-existing local data up to the
  // cloud once, so a device that had localStorage data seeds the user's cloud.
  try {
    if (cloud.isCloud() && !localStorage.getItem(SYNCED_FLAG)) {
      for (const [k, v] of cache) cloud.save(k, v);
      localStorage.setItem(SYNCED_FLAG, "1");
    }
  } catch {
    /* ignore */
  }
}

export function get(key: string): string | null {
  return cache.has(key) ? cache.get(key)! : null;
}

export function set(key: string, val: string): void {
  cache.set(key, val);
  cloud.save(key, val);
}

export function remove(key: string): void {
  cache.delete(key);
  cloud.del(key);
}

/** All cached keys starting with `prefix` (default: all). */
export function keys(prefix = ""): string[] {
  return [...cache.keys()].filter((k) => k.startsWith(prefix));
}

/** Wipe everything (logout). */
export function clearAll(): void {
  const ks = [...cache.keys()];
  cache.clear();
  ks.forEach((k) => cloud.del(k));
}
