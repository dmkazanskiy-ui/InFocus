import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "../lib/icons";
import { Entries, dateKey } from "../lib/dayStore";
import { haptic } from "../lib/telegram";
import "./Calendar.css";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_GEN = [
  "Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
  "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря",
];
const MONTHS_NOM = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

interface Cell {
  date: Date;
  inMonth: boolean;
}

/** Build a Monday-first grid of full weeks covering the given month. */
function buildGrid(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  // JS: 0=Sun..6=Sat → shift so Monday=0
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - lead);

  const cells: Cell[] = [];
  const cursor = new Date(start);
  // 6 weeks max; stop once we've passed the month and completed the week
  for (let i = 0; i < 42; i++) {
    cells.push({ date: new Date(cursor), inMonth: cursor.getMonth() === month });
    cursor.setDate(cursor.getDate() + 1);
  }
  // Trim trailing all-next-month week if not needed (keep 5 or 6 rows)
  while (cells.length > 35 && cells.slice(35).every((c) => !c.inMonth)) {
    cells.length = 35;
  }
  return cells;
}

interface CalendarProps {
  entries: Entries;
  /** Tapped an in-month day that has an entry, or today. */
  onSelectDay?: (dateKey: string) => void;
}

export default function Calendar({ entries, onSelectDay }: CalendarProps) {
  const today = new Date();
  const todayK = dateKey(today);
  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const step = (delta: number) => {
    haptic("light");
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const isCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();
  const title = isCurrentMonth
    ? `${today.getDate()} ${MONTHS_GEN[view.month]} ${view.year}`
    : `${MONTHS_NOM[view.month]} ${view.year}`;

  const cells = buildGrid(view.year, view.month);

  return (
    <div className="cal">
      <div className="cal__header">
        <span className="cal__icon">
          <CalendarIcon size={16} />
        </span>
        <span className="cal__title">{title}</span>
        <div className="cal__nav">
          <button className="cal__chev" onClick={() => step(-1)} aria-label="Назад">
            <ChevronLeftIcon size={20} />
          </button>
          <button className="cal__chev" onClick={() => step(1)} aria-label="Вперёд">
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      <div className="cal__body">
        <div className="cal__week">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal__wday">
              {w}
            </span>
          ))}
        </div>

        <div className="cal__grid">
          {cells.map((c, i) => {
            const k = dateKey(c.date);
            const entry = entries[k];
            const isToday = k === todayK;
            const dot = entry
              ? entry.quality === "fail"
                ? "fail"
                : "kept"
              : null;
            const clickable = c.inMonth && (!!entry || isToday);
            const cls = `cal__cell ${c.inMonth ? "" : "cal__cell--muted"} ${
              isToday ? "cal__cell--today" : ""
            } ${clickable ? "cal__cell--tappable" : ""}`;
            const inner = (
              <>
                <span className="cal__num">{c.date.getDate()}</span>
                {dot && c.inMonth && (
                  <span className={`cal__dot cal__dot--${dot}`} />
                )}
              </>
            );
            return clickable && onSelectDay ? (
              <button
                key={i}
                className={cls}
                onClick={() => {
                  haptic("light");
                  onSelectDay(k);
                }}
              >
                {inner}
              </button>
            ) : (
              <div key={i} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
