// Minimal typings + helpers for the Telegram WebApp SDK.
// The SDK is loaded from index.html (telegram-web-app.js) and exposed at
// window.Telegram.WebApp. Outside Telegram (e.g. plain browser dev) the object
// is undefined, so every helper degrades gracefully.

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  viewportHeight: number;
  viewportStableHeight: number;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  showConfirm?: (message: string, callback: (confirmed: boolean) => void) => void;
  onEvent: (event: string, cb: () => void) => void;
  offEvent: (event: string, cb: () => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  CloudStorage?: {
    setItem: (key: string, value: string, cb?: (err: Error | null, ok?: boolean) => void) => void;
    getItem: (key: string, cb: (err: Error | null, value?: string) => void) => void;
    getItems: (keys: string[], cb: (err: Error | null, values?: Record<string, string>) => void) => void;
    getKeys: (cb: (err: Error | null, keys?: string[]) => void) => void;
    removeItem: (key: string, cb?: (err: Error | null, ok?: boolean) => void) => void;
    removeItems: (keys: string[], cb?: (err: Error | null, ok?: boolean) => void) => void;
  };
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  initDataUnsafe?: {
    user?: {
      first_name?: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegram(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp;
}

/** Call once on app start: tells Telegram we're ready and expands to full height. */
export function initTelegram(): void {
  const tg = getTelegram();
  if (!tg) return;
  tg.ready();
  tg.expand();
  // Match the app's light background to the Telegram chrome.
  tg.setHeaderColor?.("#ffffff");
  tg.setBackgroundColor?.("#ffffff");
}

/** Light haptic tap — used on button presses. No-op outside Telegram. */
export function haptic(style: "light" | "medium" | "heavy" = "light"): void {
  getTelegram()?.HapticFeedback?.impactOccurred(style);
}

export function hapticSuccess(): void {
  getTelegram()?.HapticFeedback?.notificationOccurred("success");
}

export interface TgUser {
  name: string;
  photoUrl?: string;
}

/** Telegram user, or a sensible fallback when running outside Telegram. */
export function getUser(): TgUser {
  const u = getTelegram()?.initDataUnsafe?.user;
  if (u?.first_name) {
    return {
      name: [u.first_name, u.last_name].filter(Boolean).join(" "),
      photoUrl: u.photo_url,
    };
  }
  return { name: "Dmitrii Kazanskii" };
}

/** Native Telegram confirm dialog (falls back to window.confirm outside Telegram). */
export function confirmDialog(message: string): Promise<boolean> {
  const tg = getTelegram();
  if (tg?.showConfirm) {
    return new Promise((res) => tg.showConfirm!(message, res));
  }
  return Promise.resolve(window.confirm(message));
}

/** Open an external/Telegram link from within the mini app. */
export function openLink(url: string): void {
  const tg = getTelegram();
  if (tg?.openTelegramLink && url.startsWith("https://t.me")) {
    tg.openTelegramLink(url);
  } else if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, "_blank");
  }
}

/**
 * Open Telegram's native share sheet with a message + link.
 * Outside Telegram falls back to the Web Share API, then to opening the link.
 */
export function shareToTelegram(text: string, url: string): void {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    url
  )}&text=${encodeURIComponent(text)}`;
  const tg = getTelegram();
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(shareUrl);
  } else if (navigator.share) {
    navigator.share({ text, url }).catch(() => {});
  } else {
    window.open(shareUrl, "_blank");
  }
}
