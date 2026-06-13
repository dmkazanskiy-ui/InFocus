import {
  DumbbellIcon,
  ForkIcon,
  TargetIcon,
  SmileyIcon,
  CheckIcon,
  CrossIcon,
  ChevronLeftIcon,
} from "../lib/icons";
import { DayEntry, DayQuality, formatHuman } from "../lib/dayStore";
import { haptic } from "../lib/telegram";
import "./DayDetail.css";

interface DayDetailProps {
  dateKey: string;
  entry: DayEntry;
  /** Shown only for today's entry. */
  onEdit?: () => void;
  onBack: () => void;
}

const QUALITY: Record<DayQuality, { label: string; tone: string }> = {
  great: { label: "Хороший день", tone: "great" },
  normal: { label: "Нормальный день", tone: "normal" },
  fail: { label: "Плохой день", tone: "fail" },
};

function YesNo({ ok }: { ok: boolean | null }) {
  if (ok === null) return <span className="dd__na">—</span>;
  return ok ? (
    <span className="dd__yes">
      <CheckIcon size={16} />
    </span>
  ) : (
    <span className="dd__no">
      <CrossIcon size={16} />
    </span>
  );
}

export default function DayDetail({ dateKey, entry, onEdit, onBack }: DayDetailProps) {
  const q = QUALITY[entry.quality];
  return (
    <div className="dd">
      <header className="dd__head">
        <button className="dd__back" onClick={() => { haptic("light"); onBack(); }} aria-label="Назад">
          <ChevronLeftIcon size={22} />
        </button>
        <h1 className="dd__date">{formatHuman(dateKey)}</h1>
      </header>

      <div className={`dd__quality dd__quality--${q.tone}`}>
        <span className="dd__quality-icon">
          {entry.quality === "great" && <CheckIcon size={20} />}
          {entry.quality === "normal" && <CheckIcon size={20} />}
          {entry.quality === "fail" && <CrossIcon size={20} />}
        </span>
        {q.label}
      </div>

      <div className="dd__rows">
        <Row icon={<DumbbellIcon size={18} />} label="Тренировка">
          <YesNo ok={entry.training} />
        </Row>
        <Row icon={<ForkIcon size={18} />} label="Питание">
          <YesNo ok={entry.food} />
        </Row>
        <Row icon={<TargetIcon size={18} />} label="Фокус">
          <YesNo ok={entry.focus} />
        </Row>
        <Row icon={<SmileyIcon size={18} />} label="Настроение">
          <span className="dd__mood">{entry.mood ?? "—"}/5</span>
        </Row>
      </div>

      {entry.note.trim() && (
        <div className="dd__note">
          <p className="dd__note-label">Мысль дня</p>
          <p className="dd__note-text">{entry.note}</p>
        </div>
      )}

      {onEdit && (
        <button className="dd__edit" onClick={() => { haptic("light"); onEdit(); }}>
          Изменить день
        </button>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dd__row">
      <span className="dd__row-icon">{icon}</span>
      <span className="dd__row-label">{label}</span>
      <span className="dd__row-value">{children}</span>
    </div>
  );
}
