import {
  HomeIcon,
  HomeFilledIcon,
  UserIcon,
  UserFilledIcon,
  PlusIcon,
} from "../lib/icons";
import { haptic } from "../lib/telegram";
import "./BottomNav.css";

export type Tab = "home" | "profile";

interface BottomNavProps {
  /** Null on the entry/result screens, which aren't a tab. */
  active: Tab | null;
  onChange: (tab: Tab) => void;
  /** Center "+" button — open today's entry (or its result if already logged). */
  onAdd: () => void;
}

export default function BottomNav({ active, onChange, onAdd }: BottomNavProps) {
  const go = (tab: Tab) => {
    haptic("light");
    onChange(tab);
  };

  return (
    <nav className="nav">
      <button
        className={`nav__item ${active === "home" ? "nav__item--active" : ""}`}
        onClick={() => go("home")}
      >
        {active === "home" ? <HomeFilledIcon /> : <HomeIcon />}
        <span className="nav__label">Главная</span>
      </button>

      <button
        className="nav__add"
        onClick={() => {
          haptic("medium");
          onAdd();
        }}
        aria-label="Новый день"
      >
        <PlusIcon />
      </button>

      <button
        className={`nav__item ${active === "profile" ? "nav__item--active" : ""}`}
        onClick={() => go("profile")}
      >
        {active === "profile" ? <UserFilledIcon /> : <UserIcon />}
        <span className="nav__label">Профиль</span>
      </button>
    </nav>
  );
}
