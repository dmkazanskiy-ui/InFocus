// Async key-value backend. Uses Telegram CloudStorage (per-user, synced across
// the user's devices) when running inside Telegram; falls back to localStorage
// in a plain browser / dev. Every cloud write is mirrored to localStorage so
// the app starts instantly offline and survives transient cloud errors.
//
// NOTE: CloudStorage key names allow only [A-Za-z0-9_-] (≤128 chars). All
// logical keys used by the app must respect that (e.g. "d_2026-06-13").
import { getTelegram } from "./telegram";

const LS_PREFIX = "infocus:";

function cs() {
  const c = getTelegram()?.CloudStorage;
  return c && typeof c.getKeys === "function" ? c : null;
}

export function isCloud(): boolean {
  return !!cs();
}

// ---- localStorage mirror ----
function lsAll(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) out[k.slice(LS_PREFIX.length)] = localStorage.getItem(k) || "";
    }
  } catch {
    /* ignore */
  }
  return out;
}
function lsSet(k: string, v: string) {
  try {
    localStorage.setItem(LS_PREFIX + k, v);
  } catch {
    /* ignore */
  }
}
function lsDel(k: string) {
  try {
    localStorage.removeItem(LS_PREFIX + k);
  } catch {
    /* ignore */
  }
}

// ---- public API ----
/** Read every stored key. Prefers CloudStorage, falls back to localStorage. */
export async function loadAll(): Promise<Record<string, string>> {
  const c = cs();
  if (!c) return lsAll();
  try {
    const keys = await new Promise<string[]>((res, rej) =>
      c.getKeys((e, k) => (e ? rej(e) : res(k || [])))
    );
    if (keys.length === 0) return lsAll(); // empty cloud → use local (enables first-run migration)
    const items = await new Promise<Record<string, string>>((res, rej) =>
      c.getItems(keys, (e, v) => (e ? rej(e) : res(v || {})))
    );
    Object.entries(items).forEach(([k, v]) => lsSet(k, v)); // refresh offline mirror
    return items;
  } catch {
    return lsAll();
  }
}

/** Write-through: localStorage immediately + CloudStorage (fire-and-forget). */
export function save(key: string, val: string): void {
  lsSet(key, val);
  const c = cs();
  if (c) {
    try {
      c.setItem(key, val);
    } catch {
      /* ignore */
    }
  }
}

export function del(key: string): void {
  lsDel(key);
  const c = cs();
  if (c) {
    try {
      c.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}
