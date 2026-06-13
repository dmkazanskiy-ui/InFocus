import {
  ChevronLeftIcon,
  FlameIcon,
  DumbbellIcon,
  ForkIcon,
  TargetIcon,
} from "../lib/icons";
import {
  Entries,
  computeStats,
  habitStats,
  moodSeries,
  averageMood,
} from "../lib/dayStore";
import { haptic } from "../lib/telegram";
import "./Progress.css";

interface ProgressProps {
  entries: Entries;
  onBack: () => void;
}

function pct(n: number, total: number): number {
  return total ? Math.round((n / total) * 100) : 0;
}

/** Small mood trend line (mood values 1..5, chronological). */
function MoodSparkline({ values }: { values: number[] }) {
  const W = 100;
  const H = 32;
  const pad = 3;
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = n === 1 ? W / 2 : (i / (n - 1)) * (W - 2 * pad) + pad;
    const y = H - pad - ((v - 1) / 4) * (H - 2 * pad);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p).join(" ");
  return (
    <svg className="prog__spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <path
        d={d}
        fill="none"
        stroke="#151c27"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
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

  const habits = habitStats(entries);
  const habitRows = [
    { label: "Тренировки", icon: <DumbbellIcon size={18} />, stat: habits.training },
    { label: "Питание", icon: <ForkIcon size={18} />, stat: habits.food },
    { label: "Фокус", icon: <TargetIcon size={18} />, stat: habits.focus },
  ];
  const mood = moodSeries(entries);
  const avgMood = averageMood(entries);

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

      {s.total > 0 && (
        <section className="prog__breakdown">
          <h2 className="prog__section-title">По привычкам</h2>
          {habitRows.map((h) => (
            <div key={h.label} className="prog__habit-row">
              <span className="prog__habit-icon">{h.icon}</span>
              <span className="prog__habit-label">{h.label}</span>
              <div className="prog__bar-track">
                <div
                  className="prog__bar-fill prog__bar-fill--habit"
                  style={{ width: `${pct(h.stat.kept, h.stat.total)}%` }}
                />
              </div>
              <span className="prog__bar-value">
                {pct(h.stat.kept, h.stat.total)}%
              </span>
            </div>
          ))}
        </section>
      )}

      {avgMood != null && (
        <section className="prog__breakdown">
          <h2 className="prog__section-title">Настроение</h2>
          <div className="prog__mood">
            <div className="prog__mood-avg">
              <span className="prog__mood-num">{avgMood.toFixed(1)}</span>
              <span className="prog__mood-max">/5</span>
            </div>
            {mood.length >= 2 && <MoodSparkline values={mood} />}
          </div>
          <p className="prog__mood-caption">
            Среднее за всё время{mood.length >= 2 ? ` · график — последние ${mood.length} дн.` : ""}
          </p>
        </section>
      )}
    </div>
  );
}
