// Scam radar: one house's report protects the whole estate.
// Each gate check-in is compared with today's other walk-ins. If the same claim ("water company plumber") with no booking
// shows up at several houses within a short time, it is flagged as a likely scam and every gate and resident is warned.
// Demo data: made-up walk-ins in Elmina West. Real data would be the guard tablets' logs (no faces, no ID numbers).

export type WalkIn = { house: string; claim: string; reason: string; at: number; booked: boolean; outcome: string };

const min = (h: number, m: number) => h * 60 + m;

// Earlier today, at other houses.
export const todaysWalkIns: WalkIn[] = [
  { house: 'No. 14', claim: 'Water plumber', reason: 'leak check', at: min(16, 2), booked: false, outcome: 'Turned away by owner' },
  { house: 'No. 3', claim: 'Water plumber', reason: 'leak check', at: min(16, 10), booked: false, outcome: 'Owner not home · not let in' },
  { house: 'No. 21', claim: 'Courier', reason: 'parcel', at: min(15, 40), booked: true, outcome: 'Delivered · had a pass' },
];

// The one at Aiman's gate now (the demo story).
export const atGateNow: WalkIn = { house: 'No. 12', claim: 'Water plumber', reason: 'leak check', at: min(16, 18), booked: false, outcome: 'Owner said no · denied' };

export type Radar = { flagged: boolean; matches: WalkIn[]; spanMin: number; houses: string[] };

// Same claim, no booking, within 2 hours, at 3 or more houses → likely scam.
export function scamRadar(now: WalkIn = atGateNow, today: WalkIn[] = todaysWalkIns): Radar {
  const matches = today.filter((w) => !w.booked && !now.booked && w.claim === now.claim && Math.abs(now.at - w.at) <= 120);
  const all = [...matches, now];
  const times = all.map((w) => w.at);
  return { flagged: all.length >= 3, matches, spanMin: Math.max(...times) - Math.min(...times), houses: all.map((w) => w.house) };
}

export const timeText = (m: number) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')} ${m < 720 ? 'AM' : 'PM'}`;
