import { router } from 'expo-router';
import { closeAll } from '@/components/actions';
import type { HazardKey } from './demo';
import { GUARD } from './features';
import type { CareState, RenoDraft } from './store';

// Auto tours: each plays one chapter of the demo story by itself, for screen recordings and walk-up pitches.

export type TourStore = {
  trigger: (key: HazardKey, variant?: string) => void;
  applyFirstAid: (key: HazardKey) => void;
  bookJob: (hazard: HazardKey, companyId: string, slot: string) => unknown;
  resetDemo: () => void;
  setCare: (s: CareState) => void;
  setDraft: (d: Partial<RenoDraft>) => void;
  bookReno: (proId: string) => void;
  approveStage: () => void;
};

let timers: ReturnType<typeof setTimeout>[] = [];
// While a tour plays, the app shows the story's afternoon greeting (the leak happens at 2:14 PM).
export let tourOn = false;

export function stopTour() {
  timers.forEach(clearTimeout);
  timers = [];
  tourOn = false;
}

function begin(store: TourStore, start = '/') {
  stopTour();
  tourOn = true;
  store.resetDemo();
  closeAll();
  router.navigate(start as never);
  return (sec: number, fn: () => void) => timers.push(setTimeout(fn, sec * 1000));
}
const home = (path = '/') => { closeAll(); router.navigate(path as never); };

type Tour = { label: string; guard?: boolean; run: (s: TourStore) => void };

const allTours: Record<string, Tour> = {
  renovate: {
    label: 'Renovate: see it first',
    run: (s) => {
      const at = begin(s, '/fix');
      at(2.5, () => { s.setDraft({ item: 'wardrobe', style: 'oak', size: 0 }); router.push('/renovate/snap?auto=1'); });
      at(6.5, () => router.replace('/renovate/design?auto=1'));
      at(11, () => router.replace('/renovate/see?auto=1'));
      at(21, () => router.replace('/renovate/pros?auto=1'));
      at(26.5, () => { s.bookReno('xyz'); closeAll(); router.push('/renovate/project?auto=1'); });
      at(30, () => s.approveStage()); // site visit done
      at(32.5, () => router.push('/guard?mode=scan&who=crew&auto=1'));
      at(40.5, () => router.back());
      at(42, () => s.approveStage()); // built in the workshop
      at(44.5, () => s.approveStage()); // installed
      at(47, () => s.approveStage()); // final check → saved to the record
      at(51, () => home('/'));
      at(54, stopTour);
    },
  },
  fix: {
    label: 'Small repair: crack',
    run: (s) => {
      const at = begin(s, '/fix');
      at(2, () => router.push('/report?auto=1'));
      at(14.5, () => router.replace('/book?repair=crack&auto=3000'));
      at(21, () => { closeAll(); router.push('/tech?auto=1'); });
      at(42, () => { closeAll(); router.push('/confirm?auto=1'); });
      at(54, () => home('/fix'));
      at(57, stopTour);
    },
  },
  leak: {
    label: 'Leak story',
    guard: true,
    run: (s) => {
      const at = begin(s);
      at(4, () => { s.trigger('leak', 'filter'); router.push('/respond/leak?auto=2600'); });
      at(12.5, () => home());
      at(16, () => { s.trigger('heat', 'strip'); router.push('/respond/heat?auto=3200'); });
      at(26.5, () => { closeAll(); router.push('/book?hazard=leak&auto=3200'); });
      at(33.5, () => home('/pass'));
      at(37.5, () => router.navigate('/care'));
      at(41.5, () => router.navigate('/'));
      at(45, stopTour);
    },
  },
  heat: {
    label: 'Heat, scald, gas, tank',
    guard: true,
    run: (s) => {
      const at = begin(s);
      at(1.5, () => { s.trigger('heat', 'db'); router.push('/respond/heat?auto=3000'); });
      at(13.5, () => { home(); });
      at(14.5, () => { s.trigger('heat', 'strip'); router.push('/respond/heat?auto=3000'); });
      at(25, () => { home(); });
      at(26, () => { s.trigger('water'); router.push('/respond/water?auto=2600'); });
      at(34, () => { home(); });
      at(35, () => { s.trigger('gas'); router.push('/respond/gas?auto=2600'); });
      at(43, () => { home(); });
      at(44, () => { s.trigger('tank'); router.push('/respond/tank?auto=2600'); });
      at(52, () => home());
      at(56, stopTour);
    },
  },
  pass: {
    label: 'QR pass and guard',
    run: (s) => {
      const at = begin(s, '/pass');
      at(2.5, () => router.push('/visitor?auto=1'));
      at(9.5, () => { closeAll(); router.push('/guard?mode=scan&who=visitor&auto=1'); });
      at(17, () => { closeAll(); router.push('/guard?mode=walkin&auto=1'); });
      at(20, () => router.push('/gate-ask?auto=1'));
      at(26.5, () => { closeAll(); router.push('/estate-alert'); });
      at(33.5, () => home('/'));
      at(37, stopTour);
    },
  },
  care: {
    label: 'Care for parents',
    run: (s) => {
      const at = begin(s, '/care');
      at(3, () => router.push('/care-setup?auto=1'));
      at(11, () => s.setCare('missed'));
      at(15, () => router.push('/care-alert?auto=1'));
      at(30, () => home('/care'));
      at(34, stopTour);
    },
  },
  tech: {
    label: 'Technician and record',
    guard: true,
    run: (s) => {
      const at = begin(s);
      at(0.3, () => s.trigger('leak', 'filter'));
      at(0.6, () => { s.applyFirstAid('leak'); s.bookJob('leak', 'abc', 'Today 3–5 pm'); });
      at(2, () => router.push('/tech?auto=1'));
      at(26, () => { closeAll(); router.push('/confirm?auto=1'); });
      at(40, () => home('/fix'));
      at(44, stopTour);
    },
  },
  extras: {
    label: 'Snap & Report, renovation',
    guard: true,
    run: (s) => {
      const at = begin(s, '/fix');
      at(2, () => router.push('/report?auto=1'));
      at(14.5, () => { closeAll(); router.push('/renovation?auto=1'); });
      at(24.5, stopTour);
    },
  },
};

// Tours shown in the demo panel: Guard tours only when Guard is switched on.
export const tours: Record<string, Tour> = Object.fromEntries(Object.entries(allTours).filter(([, v]) => GUARD || !v.guard));

// Kept for the "Play auto tour" button.
export function startTour(store: TourStore) {
  (GUARD ? allTours.leak : allTours.renovate).run(store);
}
