import { useState } from "react";
import { STEPS } from "./steps";
import { haptic, hapticSuccess } from "../lib/telegram";
import { markOnboardingDone } from "../lib/storage";
import "./Onboarding.css";

interface OnboardingProps {
  /** Called once the user finishes the last step. */
  onComplete: () => void;
}

/** Row of "streak" pills shown on step 4. */
function StreakPills() {
  // done = past days kept, today = current, future = upcoming (faded)
  const pills = ["done", "done", "done", "today", "future", "future"] as const;
  return (
    <div className="streak">
      {pills.map((kind, i) => (
        <div key={i} className={`streak__pill streak__pill--${kind}`}>
          {kind === "done" && <span className="streak__icon">🔥</span>}
          {kind === "today" && <span className="streak__today">СЕГ</span>}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  function next() {
    if (isLast) {
      hapticSuccess();
      markOnboardingDone();
      onComplete();
      return;
    }
    haptic("light");
    setIndex((i) => i + 1);
  }

  function back() {
    if (index === 0) return;
    haptic("light");
    setIndex((i) => i - 1);
  }

  return (
    <div className={`onb ${step.accent ? "onb--accent" : ""}`}>
      <div className="onb__content">
        <div className="onb__badge">{step.badge}</div>

        <div className="onb__body">
          <h1 className="onb__title">{step.title}</h1>

          {step.subtitle && <p className="onb__subtitle">{step.subtitle}</p>}

          {step.visual === "streak" && <StreakPills />}

          {step.visual === "checklist" && step.checklist && (
            <ul className="onb__list">
              {step.checklist.map((line) => (
                <li key={line} className="onb__list-item">
                  {line}
                </li>
              ))}
              {step.hint && <li className="onb__hint">{step.hint}</li>}
            </ul>
          )}
        </div>
      </div>

      <div className="onb__footer">
        <div className="onb__dots" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`onb__dot ${i === index ? "onb__dot--active" : ""}`}
            />
          ))}
        </div>

        <div className="onb__actions">
          {index > 0 && (
            <button className="onb__btn onb__btn--ghost" onClick={back}>
              Назад
            </button>
          )}
          <button
            className={`onb__btn ${isLast ? "onb__btn--primary" : "onb__btn--outline"}`}
            onClick={next}
          >
            {step.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
