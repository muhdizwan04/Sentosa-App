import * as Haptics from 'expo-haptics';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { companies, fixHistory, hazardList, renoItems, renoPrice, renoPros, renoStages, resolveConfig, variantsFor, type Company, type HazardConfig, type HazardKey, type RenoItemId, type RenoStyle, type Status, type Step } from './demo';

// In-memory demo state (lost when the app restarts). Firebase will replace this later.

export type HazardState = {
  status: Status;
  value: string;
  note: string;
  steps: Step[];
  since: string; // clock time the alarm started
  variant?: string; // leak spot or overheating device
};

export type Job = {
  id: string;
  hazard: HazardKey | null; // null = a problem found by Snap & Report, not a sensor
  jobName: string;
  price: number;
  company: Company;
  slot: string;
  stage: number; // 0 booked · 1 on the way · 2 at gate · 3 working · 4 done
};

export type CareState = 'ok' | 'missed' | 'guard' | 'resolved';
export type HistoryItem = { date: string; what: string; who: string; price: string; fresh?: boolean };
export type VisitorPass = { id: string; name: string; kind: string; when: string; entry: string };
export type Prefs = Record<string, boolean>;
export type RenoDraft = { item: RenoItemId; style: RenoStyle; size: number };
export type RenoProject = RenoDraft & { id: string; pro: (typeof renoPros)[number]; price: number; approved: number }; // approved = stages paid (0–4)
const defaultDraft: RenoDraft = { item: 'wardrobe', style: 'oak', size: 1 };
const defaultPrefs: Prefs = { push: true, gasSound: true, careUpdates: true, weekly: false, famNurul: true, famMom: false, carePaused: false };

type Store = {
  hazards: Record<HazardKey, HazardState>;
  job: Job | null;
  careState: CareState;
  setCare: (s: CareState) => void;
  history: HistoryItem[];
  completeJob: (rating: number) => void;
  visitors: VisitorPass[];
  addVisitor: (v: Omit<VisitorPass, 'id'>) => void;
  removeVisitor: (id: string) => void;
  cancelJob: () => void;
  fixMyself: (key: HazardKey) => void;
  prefs: Prefs;
  setPref: (k: string, v: boolean) => void;
  draft: RenoDraft;
  setDraft: (d: Partial<RenoDraft>) => void;
  reno: RenoProject | null;
  bookReno: (proId: string) => void;
  approveStage: () => void;
  scam: boolean; // scam radar raised an estate alert
  setScam: (v: boolean) => void;
  trigger: (key: HazardKey, variant?: string) => void;
  applyFirstAid: (key: HazardKey) => void;
  bookJob: (hazard: HazardKey | null, companyId: string, slot: string, custom?: { job: string; price: number }) => Job;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function clock(d = new Date()) {
  const h = d.getHours() % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function normalState(): Record<HazardKey, HazardState> {
  return Object.fromEntries(
    hazardList.map((h): [HazardKey, HazardState] => [h.key, { status: 'ok', value: h.normal.value, note: h.normal.note, steps: [], since: '' }]),
  ) as Record<HazardKey, HazardState>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hazards, setHazardsRaw] = useState(normalState);
  // Latest hazards, so actions called from timers (auto tours) never read an old snapshot.
  const hazardsRef = useRef(hazards);
  const setHazards = (fn: (h: Record<HazardKey, HazardState>) => Record<HazardKey, HazardState>) =>
    setHazardsRaw((h) => { const n = fn(h); hazardsRef.current = n; return n; });
  const [job, setJob] = useState<Job | null>(null);
  const [careState, setCare] = useState<CareState>('ok');
  const [history, setHistory] = useState<HistoryItem[]>(fixHistory);
  const [visitors, setVisitors] = useState<VisitorPass[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [draft, setDraftRaw] = useState<RenoDraft>(defaultDraft);
  const [reno, setReno] = useState<RenoProject | null>(null);
  const [scam, setScam] = useState(false);
  // Latest draft, so auto tours that pick and book in quick steps never book an old choice.
  const draftRef = useRef(draft);
  const setDraft = (d: Partial<RenoDraft>) => setDraftRaw((x) => { const n = { ...x, ...d }; draftRef.current = n; return n; });

  const renoRef = useRef<RenoProject | null>(null);
  const putReno = (r: RenoProject | null) => { renoRef.current = r; setReno(r); };
  const bookReno = (proId: string) => {
    const pro = renoPros.find((p) => p.id === proId) ?? renoPros[0];
    const d = draftRef.current;
    putReno({ ...d, id: 'R-118', pro, price: renoPrice(d.item, pro), approved: 0 });
  };
  // Owner approves the photos of the next stage: that stage's share is released. The last one closes the job.
  const approveStage = () => {
    const r = renoRef.current;
    if (!r || r.approved >= renoStages.length) return;
    putReno({ ...r, approved: r.approved + 1 });
    if (r.approved + 1 === renoStages.length) {
      const name = renoItems.find((i) => i.id === r.item)?.name ?? 'Renovation';
      setHistory((h) => [{ date: 'Today', what: name, who: `${r.pro.name} · ★★★★★`, price: `RM${r.price.toLocaleString('en-MY')}`, fresh: true }, ...h.map((x) => ({ ...x, fresh: false }))]);
    }
  };

  // Owner confirmed the company's work: close the job and record it.
  const completeJob = (rating: number) => {
    if (!job) return;
    setHistory((h) => [{ date: 'Today', what: job.jobName, who: `${job.company.name.replace(' Sdn Bhd', '')} · ${'★'.repeat(rating)}`, price: `RM${job.price}`, fresh: true }, ...h.map((x) => ({ ...x, fresh: false }))]);
    setJob(null);
    const key = job.hazard;
    if (key) setHazards((hs) => ({ ...hs, [key]: normalState()[key] }));
  };

  // Owner fixed it without booking: close the incident and note it in the record.
  const fixMyself = (key: HazardKey) => {
    const c = resolveConfig(key, hazardsRef.current[key].variant);
    setHistory((h) => [{ date: 'Today', what: c.repair.job, who: 'Fixed by owner', price: '—', fresh: true }, ...h.map((x) => ({ ...x, fresh: false }))]);
    setHazards((hs) => ({ ...hs, [key]: normalState()[key] }));
  };

  const turn = useRef<Partial<Record<HazardKey, number>>>({});

  // Simulate a sensor crossing its limit. Without a variant, take turns through the leak spots / hot devices.
  const trigger = (key: HazardKey, chosen?: string) => {
    const options = variantsFor[key];
    let variant = chosen;
    if (!variant && options) {
      const i = turn.current[key] ?? 0;
      variant = options[i % options.length].id;
      turn.current[key] = i + 1;
    }
    const c = resolveConfig(key, variant);
    const t = clock();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setHazards((hs) => ({
      ...hs,
      [key]: {
        status: 'detected',
        value: c.alarm.value,
        note: c.alarm.note,
        since: t,
        variant,
        steps: [
          { label: `${c.alarm.title} · ${c.alarm.value}${c.unit === '%' ? '%' : ' ' + c.unit}`, time: t, done: true },
          { label: c.alarm.judged, time: t, done: true },
          { label: c.action.step, time: '', done: false },
          { label: c.repair.step, time: '', done: false },
        ],
      },
    }));
  };

  // First aid finished and verified.
  const applyFirstAid = (key: HazardKey) => {
    const t = clock();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setHazards((hs) => {
      const h = hs[key];
      const c = resolveConfig(key, h.variant);
      return {
        ...hs,
        [key]: {
          ...h,
          status: c.after.status,
          value: c.after.value,
          note: c.after.note,
          steps: [
            ...h.steps.slice(0, 2),
            { label: c.action.step, time: t, done: true },
            { label: c.action.verified, time: t, done: true },
            { label: c.repair.step, time: '', done: false },
          ],
        },
      };
    });
  };

  const bookJob = (hazard: HazardKey | null, companyId: string, slot: string, custom?: { job: string; price: number }) => {
    const r = custom ?? (hazard ? (({ job, price }) => ({ job, price }))(resolveConfig(hazard, hazardsRef.current[hazard].variant).repair) : { job: 'Repair', price: 0 });
    const company = companies.find((x) => x.id === companyId) ?? companies[0];
    const next: Job = { id: 'J-2041', hazard, jobName: r.job, price: r.price, company, slot, stage: 0 };
    setJob(next);
    return next;
  };

  const resetDemo = () => {
    setHazards(() => normalState());
    setJob(null);
    setCare('ok');
    setHistory(fixHistory);
    setVisitors([]);
    setPrefs(defaultPrefs);
    setDraft(defaultDraft);
    putReno(null);
    setScam(false);
    turn.current = {};
  };

  return (
    <StoreContext.Provider value={{ hazards, job, trigger, applyFirstAid, bookJob, resetDemo, careState, setCare, history, completeJob, fixMyself,
      visitors, addVisitor: (v) => setVisitors((x) => [{ ...v, id: `V-${1900 + x.length + 7}` }, ...x]), removeVisitor: (id) => setVisitors((x) => x.filter((v) => v.id !== id)),
      cancelJob: () => setJob(null), prefs, setPref: (k, v) => setPrefs((p) => ({ ...p, [k]: v })),
      draft, setDraft, reno, bookReno, approveStage, scam, setScam }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

const severity: Record<Status, number> = { detected: 3, cutoff: 2, firstaid: 1, ok: 0 };

// Hazards that need attention, most serious first.
export function useAlerts() {
  const { hazards } = useStore();
  return hazardList
    .filter((h) => hazards[h.key].status !== 'ok')
    .sort((a, b) => severity[hazards[b.key].status] - severity[hazards[a.key].status]);
}

export const jobStages = ['Booked', 'On the way', 'At gate', 'Working', 'Done'];

// Settings for a hazard, adjusted to the current leak spot / hot device.
export function useConfig(key: HazardKey): HazardConfig {
  const { hazards } = useStore();
  return resolveConfig(key, hazards[key]?.variant);
}
