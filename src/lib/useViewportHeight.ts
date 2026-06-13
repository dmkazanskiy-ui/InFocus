import { useEffect } from "react";
import { getTelegram } from "./telegram";

/**
 * Keeps the CSS var --app-height in sync with the real Telegram viewport
 * height (which changes when the keyboard opens or the app is expanded).
 * Falls back to window.innerHeight outside Telegram.
 */
export function useViewportHeight(): void {
  useEffect(() => {
    const tg = getTelegram();

    const apply = () => {
      const h = tg?.viewportStableHeight || tg?.viewportHeight || window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${h}px`);
    };

    apply();

    if (tg) {
      tg.onEvent("viewportChanged", apply);
      return () => tg.offEvent("viewportChanged", apply);
    }
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
}
