// App-wide constants that are likely to change / get filled in later.

/** Public name shown in shared messages. */
export const APP_NAME = "inFocus App";

/** Link to our own bot — used in the share text. */
export const BOT_LINK = "https://t.me/infocus_app_bot";

/** Build the streak share message. */
export function shareMessage(streak: number, pluralDays: (n: number) => string): string {
  return `Держу ${streak} ${pluralDays(streak)} дисциплины подряд 🔥\n\n${APP_NAME}`;
}
