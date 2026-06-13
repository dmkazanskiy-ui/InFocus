import { useState } from "react";
import { DumbbellIcon, ForkIcon, TargetIcon, SmileyIcon } from "../lib/icons";
import { DayAnswers, emptyAnswers, isComplete } from "../lib/dayStore";
import { haptic } from "../lib/telegram";
import "./DayEntry.css";

interface DayEntryProps {
  dayNumber: number;
  /** Pre-fill when editing an already-logged day. */
  initial?: DayAnswers;
  onFinish: (answers: DayAnswers) => void;
}

/** Two-option segmented control (Была / Нет etc). value: true=left, false=right. */
function Segmented({
  yesLabel,
  noLabel,
  value,
  onChange,
}: {
  yesLabel: string;
  noLabel: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const pick = (v: boolean) => {
    haptic("light");
    onChange(v);
  };
  return (
    <div className="seg">
      <button
        className={`seg__btn ${value === true ? "seg__btn--on" : ""}`}
        onClick={() => pick(true)}
      >
        {yesLabel}
      </button>
      <button
        className={`seg__btn ${value === false ? "seg__btn--on" : ""}`}
        onClick={() => pick(false)}
      >
        {noLabel}
      </button>
    </div>
  );
}

/** A habit card: icon + label header, body rendered as children. */
function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="card__header">
        <span className="card__icon">{icon}</span>
        <span className="card__title">{title}</span>
      </div>
      <div className="card__body">{children}</div>
    </div>
  );
}

export default function DayEntry({ dayNumber, initial, onFinish }: DayEntryProps) {
  const [a, setA] = useState<DayAnswers>(initial ?? emptyAnswers());
  const set = (patch: Partial<DayAnswers>) => setA((p) => ({ ...p, ...patch }));
  const ready = isComplete(a);

  return (
    <div className="entry">
      <header className="entry__head">
        <h1 className="entry__title">День {dayNumber}</h1>
        <p className="entry__subtitle">Что сделал сегодня?</p>
      </header>

      <Card icon={<DumbbellIcon size={20} />} title="Тренировка">
        <Segmented
          yesLabel="Была"
          noLabel="Нет"
          value={a.training}
          onChange={(v) => set({ training: v })}
        />
      </Card>

      <Card icon={<ForkIcon size={20} />} title="Питание">
        <Segmented
          yesLabel="Держал"
          noLabel="Нет"
          value={a.food}
          onChange={(v) => set({ food: v })}
        />
      </Card>

      <Card icon={<TargetIcon size={20} />} title="Фокус">
        <Segmented
          yesLabel="Был"
          noLabel="Нет"
          value={a.focus}
          onChange={(v) => set({ focus: v })}
        />
      </Card>

      <Card icon={<SmileyIcon size={20} />} title="Настроение">
        <div className="mood">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`mood__btn ${a.mood === n ? "mood__btn--on" : ""}`}
              onClick={() => {
                haptic("light");
                set({ mood: n });
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      <div className="thought">
        <label className="thought__label" htmlFor="note">
          Мысль дня
        </label>
        <textarea
          id="note"
          className="thought__area"
          placeholder="Что было важным сегодня?"
          value={a.note}
          onChange={(e) => set({ note: e.target.value })}
        />
      </div>

      <button
        className="entry__submit"
        disabled={!ready}
        onClick={() => onFinish(a)}
      >
        Завершить день
      </button>
    </div>
  );
}
