import { CheckIcon, CrossIcon, ShareIcon } from "../lib/icons";
import { DayQuality } from "../lib/dayStore";
import { haptic, shareToTelegram } from "../lib/telegram";
import { BOT_LINK, shareMessage } from "../lib/config";
import { track } from "../lib/analytics";
import "./DayResult.css";

interface DayResultProps {
  quality: DayQuality;
  streak: number;
  onShare?: () => void;
  /** Re-open today's entry for editing. */
  onEdit?: () => void;
}

const CONTENT: Record<
  DayQuality,
  { title: string; subtitle: (streak: number) => string; icon: React.ReactNode; tone: string }
> = {
  great: {
    title: "Хороший день!",
    subtitle: (s) => `Ты удерживаешь систему ${s} ${plural(s)} подряд, не ломай ее завтра`,
    icon: <CheckIcon size={34} />,
    tone: "great",
  },
  normal: {
    title: "Нормальный день",
    subtitle: () => "Ты почти удержал день. Завтра закрой чисто",
    icon: <CheckIcon size={32} />,
    tone: "normal",
  },
  fail: {
    title: "Плохой день",
    subtitle: () => "Серия закончилась. Начни заново завтра",
    icon: <CrossIcon size={32} />,
    tone: "fail",
  },
};

function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

export default function DayResult({ quality, streak, onShare, onEdit }: DayResultProps) {
  const c = CONTENT[quality];
  return (
    <div className="result">
      <div className="result__inner">
        <div className={`badge badge--${c.tone}`}>
          <div className="badge__glow" />
          <div className="badge__main">
            <span className="badge__icon">{c.icon}</span>
          </div>
          <div className="badge__chip" />
        </div>

        <div className="result__text">
          <h1 className="result__title">{c.title}</h1>
          <p className="result__subtitle">{c.subtitle(streak)}</p>
        </div>

        <button
          className="result__share"
          onClick={() => {
            haptic("light");
            track("share_clicked", { quality, streak });
            shareToTelegram(shareMessage(streak, plural), BOT_LINK);
            onShare?.();
          }}
        >
          <ShareIcon size={18} />
          Поделиться
        </button>

        {onEdit && (
          <button className="result__edit" onClick={onEdit}>
            Изменить день
          </button>
        )}
      </div>
    </div>
  );
}
