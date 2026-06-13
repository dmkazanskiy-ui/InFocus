// Thin wrapper around localStorage. Centralised so we can later swap the
// backend (Telegram CloudStorage or a real API) without touching components.

const PREFIX = "infocus:";

export const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(PREFIX + key, value);
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  },
};

export const ONBOARDING_DONE_KEY = "onboarding_done";

export function isOnboardingDone(): boolean {
  return storage.get(ONBOARDING_DONE_KEY) === "1";
}

export function markOnboardingDone(): void {
  storage.set(ONBOARDING_DONE_KEY, "1");
}

const PUSH_KEY = "push_enabled";

export function isPushEnabled(): boolean {
  return storage.get(PUSH_KEY) === "1";
}

export function setPushEnabled(on: boolean): void {
  storage.set(PUSH_KEY, on ? "1" : "0");
}

const REMINDER_KEY = "reminder_time";
export const DEFAULT_REMINDER = "21:00";

export function getReminderTime(): string {
  return storage.get(REMINDER_KEY) || DEFAULT_REMINDER;
}

export function setReminderTime(value: string): void {
  storage.set(REMINDER_KEY, value);
}

/** Wipe all app data (logout). */
export function clearAll(): void {
  for (const k of [
    ONBOARDING_DONE_KEY,
    PUSH_KEY,
    REMINDER_KEY,
    "entries",
    "best_streak",
    "day_state",
  ]) {
    storage.remove(k);
  }
}
