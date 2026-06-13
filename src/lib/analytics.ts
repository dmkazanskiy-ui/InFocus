// Lightweight PostHog wrapper. No-op until POSTHOG_KEY is set in config.ts.
// Privacy: autocapture and session recording are OFF, so we never capture the
// private "мысль дня" text — only the explicit events below.
import posthog from "posthog-js";
import { POSTHOG_KEY, POSTHOG_HOST } from "./config";
import { getTelegram } from "./telegram";

let enabled = false;

export function initAnalytics(): void {
  if (!POSTHOG_KEY) return; // analytics disabled
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false, // no implicit click/input capture
    capture_pageview: false, // we send an explicit "app_opened"
    capture_pageleave: false,
    disable_session_recording: true,
    persistence: "localStorage", // cookies are flaky inside the Telegram webview
  });
  enabled = true;

  // Identify by Telegram user id → accurate unique-user counts across devices.
  const u = getTelegram()?.initDataUnsafe?.user;
  if (u?.id != null) {
    posthog.identify(String(u.id), {
      first_name: u.first_name,
      username: u.username,
    });
  }
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (enabled) posthog.capture(event, props);
}
