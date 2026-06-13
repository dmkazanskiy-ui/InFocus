// Content for the 5 onboarding screens, transcribed from the Figma design.

export type StepVisual = "none" | "streak" | "checklist";

export interface OnboardingStep {
  badge: string;
  title: string;
  /** Plain subtitle (steps 1–3). */
  subtitle?: string;
  /** Background variant: step 4 uses the light-blue accent background. */
  accent?: boolean;
  /** Extra visual block under the heading. */
  visual?: StepVisual;
  /** Checklist lines for step 5. */
  checklist?: string[];
  /** Hint line under the checklist (step 5). */
  hint?: string;
  /** Button label. The final step uses a filled CTA. */
  cta: string;
}

export const STEPS: OnboardingStep[] = [
  {
    badge: "01 / 05",
    title: "Ты не держишь режим не потому что слабый.",
    subtitle: "Ты просто живешь без системы.",
    cta: "Далее",
  },
  {
    badge: "02 / 05",
    title: "Это не трекер калорий.",
    subtitle: "Это система, которая помогает не срываться.",
    accent: true,
    cta: "Далее",
  },
  {
    badge: "03 / 05",
    title: "Контролируй свой день",
    subtitle: "Твоя активность. Твое питание. Твой фокус. Твое настроение",
    cta: "Далее",
  },
  {
    badge: "04 / 05",
    title: "Не ломай серию",
    accent: true,
    visual: "streak",
    cta: "Далее",
  },
  {
    badge: "05 / 05",
    title: "Каждый день отмечай:",
    visual: "checklist",
    checklist: [
      "Активность — да / нет",
      "Питание — держал / сорвался",
      "Фокус — сделал / нет",
    ],
    hint: "👉 10 секунд в день",
    cta: "Начать первый день",
  },
];
