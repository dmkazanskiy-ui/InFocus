import Calendar from "../components/Calendar";
import { FlameIcon, ChevronRightIcon } from "../lib/icons";
import { Entries, computeStreak } from "../lib/dayStore";
import { haptic } from "../lib/telegram";
import "./Home.css";

interface HomeProps {
  entries: Entries;
  onProgress?: () => void;
  /** Tapped a day in the calendar. */
  onSelectDay?: (dateKey: string) => void;
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

export default function Home({ entries, onProgress, onSelectDay }: HomeProps) {
  const streak = computeStreak(entries);

  return (
    <div className="home">
      <h1 className="home__brand">inFocus.</h1>

      <section className="home__streak">
        <div className="home__streak-top">
          <span className="home__flame">
            <FlameIcon size={16} />
          </span>
          <span className="home__streak-label">Держишь дисциплину</span>
        </div>
        <p className="home__streak-line">
          <span className="home__streak-num">{streak}</span>
          <span className="home__streak-unit">{pluralDays(streak)} подряд</span>
        </p>
        <span className="home__streak-deco" aria-hidden>
          <FlameIcon size={84} />
        </span>
      </section>

      <button
        className="home__progress"
        onClick={() => {
          haptic("light");
          onProgress?.();
        }}
      >
        Мой прогресс
        <ChevronRightIcon size={16} />
      </button>

      <Calendar entries={entries} onSelectDay={onSelectDay} />
    </div>
  );
}
