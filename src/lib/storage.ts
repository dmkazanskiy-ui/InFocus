// Public storage facade. Same synchronous API as before, now backed by the
// in-memory cache in store.ts (which syncs to Telegram CloudStorage). Hydration
// happens once at startup in main.tsx before the app renders.
import * as store from "./store";

export const storage = {
  get: (key: string): string | null => store.get(key),
  set: (key: string, value: string): void => store.set(key, value),
  remove: (key: string): void => store.remove(key),
  keys: (prefix?: string): string[] => store.keys(prefix),
};

export const ONBOARDING_DONE_KEY = "onboarding_done";

export function isOnboardingDone(): boolean {
  return store.get(ONBOARDING_DONE_KEY) === "1";
}

export function markOnboardingDone(): void {
  store.set(ONBOARDING_DONE_KEY, "1");
}

const PUSH_KEY = "push_enabled";

export function isPushEnabled(): boolean {
  return store.get(PUSH_KEY) === "1";
}

export function setPushEnabled(on: boolean): void {
  store.set(PUSH_KEY, on ? "1" : "0");
}

const REMINDER_KEY = "reminder_time";
export const DEFAULT_REMINDER = "21:00";

export function getReminderTime(): string {
  return store.get(REMINDER_KEY) || DEFAULT_REMINDER;
}

export function setReminderTime(value: string): void {
  store.set(REMINDER_KEY, value);
}

/** Wipe all app data (logout) — local + cloud. */
export function clearAll(): void {
  store.clearAll();
}
