import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initTelegram } from "./lib/telegram";
import { hydrate } from "./lib/store";
import { initAnalytics, track } from "./lib/analytics";
import "./styles/global.css";

initTelegram();
initAnalytics();
track("app_opened");

const root = createRoot(document.getElementById("root")!);

// Minimal splash while data loads from CloudStorage (usually a fraction of a second).
root.render(
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6f7",
      fontFamily: "Inter, sans-serif",
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: "-1px",
      color: "#0f172a",
    }}
  >
    inFocus.
  </div>
);

// Load persisted data, then render the app. `.finally` so a cloud hiccup
// (falls back to localStorage inside hydrate) never blocks startup.
hydrate().finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
