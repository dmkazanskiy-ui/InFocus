import { useState } from "react";
import Onboarding from "./onboarding/Onboarding";
import Home from "./screens/Home";
import DayEntry from "./screens/DayEntry";
import DayResult from "./screens/DayResult";
import DayDetail from "./screens/DayDetail";
import Progress from "./screens/Progress";
import Profile from "./screens/Profile";
import BottomNav, { Tab } from "./components/BottomNav";
import { isOnboardingDone, clearAll } from "./lib/storage";
import { useViewportHeight } from "./lib/useViewportHeight";
import { track } from "./lib/analytics";
import {
  DayAnswers,
  Entries,
  answersForToday,
  commitToday,
  computeStreak,
  currentDayNumber,
  isTodayLogged,
  loadEntries,
  todayKey,
} from "./lib/dayStore";
import "./App.css";

type Screen = "home" | "profile" | "entry" | "result" | "progress" | "detail";

export default function App() {
  useViewportHeight();
  const [onboarded, setOnboarded] = useState(isOnboardingDone());
  const [entries, setEntries] = useState<Entries>(() => loadEntries());
  // Default screen for normal sessions is "Главная".
  const [screen, setScreen] = useState<Screen>("home");
  // Which day's detail is open (calendar tap on a past day).
  const [detailKey, setDetailKey] = useState<string | null>(null);

  if (!onboarded) {
    return (
      <Onboarding
        onComplete={() => {
          track("onboarding_completed");
          setOnboarded(true);
          // First launch: jump straight into filling the first day.
          setScreen("entry");
        }}
      />
    );
  }

  function finishDay(answers: DayAnswers) {
    const { quality, entries: next } = commitToday(answers);
    track("day_completed", { quality });
    setEntries({ ...next });
    setScreen("result");
  }

  // "+" button: not logged yet → fill; already logged → show final status.
  function openAdd() {
    setScreen(isTodayLogged(entries) ? "result" : "entry");
  }

  // Calendar day tap: today → normal add flow; past logged day → its detail.
  function selectDay(key: string) {
    if (key === todayKey()) {
      openAdd();
    } else if (entries[key]) {
      setDetailKey(key);
      setScreen("detail");
    }
  }

  const activeTab: Tab | null =
    screen === "profile"
      ? "profile"
      : screen === "entry" || screen === "result"
      ? null
      : "home";

  const todayEntry = entries[todayKey()];

  return (
    <div className="app">
      <main className="app__main">
        {screen === "home" && (
          <Home
            entries={entries}
            onProgress={() => setScreen("progress")}
            onSelectDay={selectDay}
          />
        )}

        {screen === "progress" && (
          <Progress entries={entries} onBack={() => setScreen("home")} />
        )}

        {screen === "detail" && detailKey && entries[detailKey] && (
          <DayDetail
            dateKey={detailKey}
            entry={entries[detailKey]}
            onBack={() => setScreen("home")}
          />
        )}

        {screen === "profile" && (
          <Profile
            entries={entries}
            onLogout={() => {
              clearAll();
              setEntries({});
              setScreen("home");
              setOnboarded(false);
            }}
          />
        )}

        {screen === "entry" && (
          <DayEntry
            dayNumber={currentDayNumber(entries)}
            initial={answersForToday(entries)}
            onFinish={finishDay}
          />
        )}

        {screen === "result" && todayEntry && (
          <DayResult
            quality={todayEntry.quality}
            streak={computeStreak(entries)}
            onEdit={() => setScreen("entry")}
          />
        )}
      </main>

      <BottomNav active={activeTab} onChange={setScreen} onAdd={openAdd} />
    </div>
  );
}
