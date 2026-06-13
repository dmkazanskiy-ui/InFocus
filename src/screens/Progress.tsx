import { ChevronLeftIcon, FlameIcon } from "../lib/icons";
import { Entries, computeStats } from "../lib/dayStore";
import { haptic } from "../lib/telegram";
import "./Progress.css";

interface ProgressProps {
  entries: Entries;
  onBack: () => void;
}

function pct(n: number, total: number): number {
  return total ? Math.round((n / total) * 100) : 0;
}

export default function Progress({ entries, onBack }: ProgressProps) {
  const s = computeStats(entries);
  const kept = s.great + s.normal;
  const keptRate = pct(kept, s.total);

  const rows: { label: string; value: number; tone: string }[] = [
    { label: "Хорошие дни", value: s.great, tone: "great" },
    { label: "Нормальные дни", value: s.normal, tone: "normal" },
    { label: "Плохие дни", value: s.fail, tone: "fail" },
  ];

  return (
    <div className="prog">
      <header className="prog__head">
        <button className="prog__back" onClick={() => { haptic("light"); onBack(); }} aria-label="Назад">
          <ChevronLeftIcon size={22} />
        </button>
        <h1 className="prog__title">Мой прогресс</h1>
      </header>

      <div className="prog__hero">
        <span className="prog__hero-flame">
          <FlameIcon size={20} />
        </span>
        <div className="prog__hero-num">{s.current}</div>
        <div className="prog__hero-label">текущая серия</div>
      </div>

      <div className="prog__cards">
        <div className="prog__card">
          <span className="prog__card-num">{s.best}</span>
          <span className="prog__card-label">лучшая серия</span>
        </div>
        <div className="prog__card">
          <span className="prog__card-num">{s.total}</span>
          <span className="prog__card-label">всего дней</span>
        </div>
        <div className="prog__card">
          <span className="prog__card-num">{keptRate}%</span>
          <span className="prog__card-label">удержано</span>
        </div>
      </div>

      <section className="prog__breakdown">
        <h2 className="prog__section-title">Распределение дней</h2>
        {rows.map((r) => (
          <div key={r.tone} className="prog__bar-row">
            <span className="prog__bar-label">{r.label}</span>
            <div className="prog__bar-track">
              <div
                className={`prog__bar-fill prog__bar-fill--${r.tone}`}
                style={{ width: `${pct(r.value, s.total)}%` }}
              />
            </div>
            <span className="prog__bar-value">{r.value}</span>
          </div>
        ))}
        {s.total === 0 && (
          <p className="prog__empty">Пока нет отмеченных дней — начни с сегодняшнего.</p>
        )}
      </section>
    </div>
  );
}
