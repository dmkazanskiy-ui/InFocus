// App-wide constants that are likely to change / get filled in later.

/** Public name shown in shared messages. */
export const APP_NAME = "inFocus App";

/** Link to our own bot — used in the share text. */
export const BOT_LINK = "https://t.me/infocus_app_bot";

/**
 * Reminders (push toggle + reminder time) require a bot backend to actually
 * send notifications — impossible from a static mini app. Hidden until that
 * backend exists. The preference is still stored, so flip to `true` once the
 * bot can read it and send daily reminders.
 */
export const REMINDERS_ENABLED: boolean = false;

/** Build the streak share message. */
export function shareMessage(streak: number, pluralDays: (n: number) => string): string {
  return `Держу ${streak} ${pluralDays(streak)} дисциплины подряд 🔥\n\n${APP_NAME}`;
}
