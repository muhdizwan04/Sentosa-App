// Care that learns Mom's normal day (simple machine learning: a personal baseline).
// Instead of one fixed rule for everyone ("fridge by 11 am"), Sentosa learns when *this* person usually starts her day,
// separately for weekdays, Fridays (market day) and weekends, and only worries when today is unusual for her.
// Demo data: 30 made-up mornings. In a real home the box learns from its own sensor history and keeps it in the house.

export type Morning = { daysAgo: number; dow: number; first: number }; // first = minutes after midnight the fridge door first opened
export type DayType = 'weekday' | 'friday' | 'weekend';

const TYPE_NAME: Record<DayType, string> = { weekday: 'weekdays', friday: 'Fridays (market day)', weekend: 'weekends' };
export const dayType = (dow: number): DayType => (dow === 5 ? 'friday' : dow === 0 || dow === 6 ? 'weekend' : 'weekday');

// Small seeded random, so the demo looks the same every time.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// The demo story always happens on Tuesday 20 Oct 2026, so the learned times (7:16–7:56, check at 8:11) are the same every time you open the app.
export const DEMO_DAY = new Date(2026, 9, 20, 9, 0);

const BASE: Record<DayType, number> = { weekday: 7 * 60 + 35, friday: 9 * 60 + 5, weekend: 8 * 60 + 10 };

export function lastMornings(today = DEMO_DAY): Morning[] {
  const r = seeded(12);
  return Array.from({ length: 30 }, (_, i) => {
    const daysAgo = 30 - i;
    const d = new Date(today); d.setDate(d.getDate() - daysAgo);
    const dow = d.getDay();
    const jitter = (r() + r() + r() - 1.5) * 26; // roughly ±20 min, bunched in the middle like real habits
    return { daysAgo, dow, first: Math.round(BASE[dayType(dow)] + jitter) };
  });
}

export type Baseline = { type: DayType; typeName: string; n: number; mean: number; from: number; to: number; checkAt: number };

// Learn her usual window for one kind of day: average ± 2 spreads (at least ±20 min), then 15 minutes' grace.
export function learn(type: DayType, mornings = lastMornings()): Baseline {
  const xs = mornings.filter((m) => dayType(m.dow) === type).map((m) => m.first);
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
  const half = Math.max(20, 2 * sd);
  const from = Math.round(mean - half);
  const to = Math.round(mean + half);
  return { type, typeName: TYPE_NAME[type], n: xs.length, mean, from, to, checkAt: to + 15 };
}

export const clockText = (min: number) => {
  const h = Math.floor(min / 60), m = Math.round(min % 60);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

// Everything the Care screens show for today, from the learned baseline.
export function careToday(now = DEMO_DAY) {
  const mornings = lastMornings(now);
  const base = learn(dayType(now.getDay()), mornings);
  const firstToday = Math.round(base.mean) + 4; // a normal morning for the "OK" story
  const t = (plus: number) => clockText(base.checkAt + plus).replace(' am', ' AM').replace(' pm', ' PM');
  return {
    mornings,
    base,
    firstToday,
    usual: `${clockText(base.from).replace(/ [ap]m$/, '')}–${clockText(base.to)}`,
    // The "missed" story: noticed at checkAt, box asks, family, guard — hours before a fixed 11 am rule would.
    times: { noticed: t(0), noPress: t(10), family: t(10), guardAsked: t(13), guardOk: t(21) },
  };
}
