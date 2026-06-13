import { useRef, useState } from "react";
import {
  TrendUpIcon,
  CalendarIcon,
  BellIcon,
  ClockIcon,
  LogoutIcon,
  GiftIcon,
  ChevronRightIcon,
  UserIcon,
} from "../lib/icons";
import { Entries, computeStats } from "../lib/dayStore";
import {
  isPushEnabled,
  setPushEnabled,
  getReminderTime,
  setReminderTime,
} from "../lib/storage";
import { getUser, haptic, openLink, confirmDialog } from "../lib/telegram";
import { REMINDERS_ENABLED } from "../lib/config";
import { track } from "../lib/analytics";
import formaLogo from "../assets/forma-logo.svg";
import "./Profile.css";

interface ProfileProps {
  entries: Entries;
  onLogout: () => void;
}

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "дня";
  return "дней";
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Profile({ entries, onLogout }: ProfileProps) {
  const user = getUser();
  const s = computeStats(entries);
  const [push, setPush] = useState(isPushEnabled());
  const [time, setTime] = useState(getReminderTime());
  const timeInputRef = useRef<HTMLInputElement>(null);

  const togglePush = () => {
    haptic("light");
    const next = !push;
    setPush(next);
    setPushEnabled(next);
  };

  const openTimePicker = () => {
    haptic("light");
    const el = timeInputRef.current;
    if (!el) return;
    // showPicker() opens the OS-native time wheel; fall back to focus+click.
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        /* not allowed → fall through */
      }
    }
    el.focus();
    el.click();
  };

  const onTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value || time;
    setTime(v);
    setReminderTime(v);
  };

  return (
    <div className="pf">
      {/* header */}
      <div className="pf__header">
        <div className="pf__avatar">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" />
          ) : initials(user.name) ? (
            <span className="pf__initials">{initials(user.name)}</span>
          ) : (
            <UserIcon size={28} />
          )}
        </div>
        <div className="pf__id">
          <span className="pf__id-label">Настройки профиля</span>
          <h1 className="pf__name">{user.name}</h1>
        </div>
      </div>

      {/* история */}
      <section className="pf__section">
        <h2 className="pf__section-title">История</h2>
        <div className="pf__stats">
          <div className="pf__stat">
            <div className="pf__stat-top">
              <TrendUpIcon size={18} />
              <span className="pf__stat-label">Лучший стрик</span>
            </div>
            <p className="pf__stat-line">
              <span className="pf__stat-num">{s.best}</span>
              <span className="pf__stat-unit">{pluralDays(s.best)}</span>
            </p>
          </div>
          <div className="pf__stat">
            <div className="pf__stat-top">
              <CalendarIcon size={18} />
              <span className="pf__stat-label">Всего дней</span>
            </div>
            <p className="pf__stat-line">
              <span className="pf__stat-num">{s.total}</span>
            </p>
          </div>
        </div>
      </section>

      {/* настройки — скрыты до появления бот-бэкенда (пуши невозможны без сервера) */}
      {REMINDERS_ENABLED && (
      <section className="pf__section">
        <h2 className="pf__section-title">Настройки</h2>
        <div className="pf__card">
          <div className="pf__row pf__row--bordered">
            <span className="pf__row-icon">
              <BellIcon size={22} />
            </span>
            <div className="pf__row-text">
              <span className="pf__row-title">Включить пуши</span>
              <span className="pf__row-sub">Ежедневные напоминания</span>
            </div>
            <button
              className={`pf__toggle ${push ? "pf__toggle--on" : ""}`}
              onClick={togglePush}
              role="switch"
              aria-checked={push}
            >
              <span className="pf__toggle-knob" />
            </button>
          </div>

          <button className="pf__row" onClick={openTimePicker}>
            <span className="pf__row-icon">
              <ClockIcon size={22} />
            </span>
            <div className="pf__row-text">
              <span className="pf__row-title">Время напоминания</span>
            </div>
            <span className="pf__row-value">{time}</span>
            <span className="pf__row-chevron">
              <ChevronRightIcon size={16} />
            </span>
            <input
              ref={timeInputRef}
              type="time"
              className="pf__time-input"
              value={time}
              onChange={onTimeChange}
              tabIndex={-1}
              aria-hidden
            />
          </button>
        </div>
      </section>
      )}

      {/* попробуйте также */}
      <section className="pf__section">
        <h2 className="pf__section-title">Попробуйте также:</h2>
        <button
          className="pf__banner"
          onClick={() => {
            haptic("light");
            track("promo_clicked", { promo: "forma" });
            openLink("https://t.me/forma_forma_bot?startapp=ref_1397549911");
          }}
        >
          <img className="pf__banner-logo" src={formaLogo} alt="Forma AI" />
          <span className="pf__banner-content">
            <span className="pf__banner-title">Forma AI: умный трекер калорий</span>
            <span className="pf__banner-cta">
              <GiftIcon size={12} />
              Получить 5 дней PRO
            </span>
          </span>
          <span className="pf__banner-deco" aria-hidden>
            <TrendUpIcon size={40} />
          </span>
        </button>
      </section>

      {/* выход */}
      <button
        className="pf__logout"
        onClick={async () => {
          haptic("light");
          const ok = await confirmDialog(
            "Выйти из аккаунта? Все данные (серия, история, профиль) будут удалены безвозвратно."
          );
          if (ok) onLogout();
        }}
      >
        Выйти из аккаунта
        <LogoutIcon size={20} />
      </button>
    </div>
  );
}
