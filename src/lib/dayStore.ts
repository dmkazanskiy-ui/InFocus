// Day-tracking domain logic + local persistence.
// Entries are keyed by local calendar date (YYYY-MM-DD): one entry per day,
// re-submitting the same day overwrites it. Streak is derived from the entry
// history so it stays correct after edits.
import { storage } from "./storage";
import { DAY_PREFIX } from "./store";

export type DayQuality = "great" | "normal" | "fail";

export interface DayAnswers {
  training: boolean | null;
  food: boolean | null;
  focus: boolean | null;
  mood: number | null; // 1..5
  note: string;
}

export interface DayEntry extends DayAnswers {
  quality: DayQuality;
}

export type Entries = Record<string, DayEntry>; // dateKey -> entry

const BEST_KEY = "best_streak";

export function emptyAnswers(): DayAnswers {
  return { training: null, food: null, focus: null, mood: null, note: "" };
}

// ---- dates ----------------------------------------------------------------
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

function shift(key: string, deltaDays: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return dateKey(dt);
}

// ---- persistence ----------------------------------------------------------
// Each day is its own key ("d_YYYY-MM-DD") so a single value stays well under
// the CloudStorage 4 KB limit even with a long "мысль дня".
export function loadEntries(): Entries {
  const out: Entries = {};
  for (const k of storage.keys(DAY_PREFIX)) {
    const raw = storage.get(k);
    if (!raw) continue;
    try {
      out[k.slice(DAY_PREFIX.length)] = JSON.parse(raw) as DayEntry;
    } catch {
      /* skip malformed */
    }
  }
  return out;
}

function loadBest(): number {
  return Number(storage.get(BEST_KEY) || 0);
}

// ---- evaluation -----------------------------------------------------------
export function isComplete(a: DayAnswers): boolean {
  return (
    a.training !== null && a.food !== null && a.focus !== null && a.mood !== null
  );
}

export function evaluate(a: DayAnswers): DayQuality {
  const yes = [a.training, a.food, a.focus].filter((v) => v === true).length;
  if (yes === 3) return "great";
  if (yes === 0) return "fail";
  return "normal";
}

/**
 * Current consecutive streak, counting back from today.
 * A day counts while it exists and is not a "fail". If today isn't logged yet
 * the streak is still alive, so we start counting from yesterday.
 */
export function computeStreak(entries: Entries, today = todayKey()): number {
  let cursor = entries[today] ? today : shift(today, -1);
  let count = 0;
  while (entries[cursor] && entries[cursor].quality !== "fail") {
    count++;
    cursor = shift(cursor, -1);
  }
  return count;
}

export function totalDays(entries: Entries): number {
  return Object.keys(entries).length;
}

/** Header counter: which day of the journey the user is currently on. */
export function currentDayNumber(entries: Entries, today = todayKey()): number {
  const total = totalDays(entries);
  return entries[today] ? total : total + 1;
}

export function bestStreak(entries: Entries): number {
  return Math.max(loadBest(), computeStreak(entries));
}

export interface Stats {
  total: number;
  great: number;
  normal: number;
  fail: number;
  current: number;
  best: number;
}

export function computeStats(entries: Entries): Stats {
  let great = 0,
    normal = 0,
    fail = 0;
  for (const e of Object.values(entries)) {
    if (e.quality === "great") great++;
    else if (e.quality === "normal") normal++;
    else fail++;
  }
  return {
    total: great + normal + fail,
    great,
    normal,
    fail,
    current: computeStreak(entries),
    best: bestStreak(entries),
  };
}

/** Russian human-readable date, e.g. "12 июня 2026". */
export function formatHuman(key: string): string {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

/** Today's saved answers, or empty answers if today isn't logged yet. */
export function answersForToday(entries: Entries): DayAnswers {
  const e = entries[todayKey()];
  if (!e) return emptyAnswers();
  const { training, food, focus, mood, note } = e;
  return { training, food, focus, mood, note };
}

export function isTodayLogged(entries: Entries): boolean {
  return !!entries[todayKey()];
}

/**
 * Commit (or overwrite) today's entry. Recomputes streak from history and
 * persists the best streak. Returns the quality + fresh streak for the result.
 */
export function commitToday(a: DayAnswers): {
  quality: DayQuality;
  streak: number;
  entries: Entries;
} {
  const quality = evaluate(a);
  // Persist just today's day key.
  storage.set(DAY_PREFIX + todayKey(), JSON.stringify({ ...a, quality }));

  const entries = loadEntries(); // now includes today
  const streak = computeStreak(entries);
  if (streak > loadBest()) storage.set(BEST_KEY, String(streak));

  return { quality, streak, entries };
}
