// Demo data only — made-up home, people and companies. No real residents.
// Later the live values come from Firebase (sent by the ESP32 boards).

// ok → detected (alarm, nobody acted yet) → firstaid (fixed for now) or cutoff (supply shut)
export type Status = 'ok' | 'detected' | 'firstaid' | 'cutoff';

export type HazardKey = 'leak' | 'water' | 'heat' | 'gas' | 'tank';

export type Step = { label: string; time: string; done: boolean };

// Everything the demo needs to know about one hazard: normal values,
// alarm values, the first-aid action and the values after it worked.
export type HazardConfig = {
  key: HazardKey;
  name: string;
  icon: string; // MaterialCommunityIcons name
  place: string;
  unit: string;
  normal: { value: string; note: string };
  alarm: { value: string; note: string; title: string; detail: string; judged: string };
  action: { button: string; step: string; verified: string; auto: string };
  after: { status: Status; value: string; note: string };
  repair: { job: string; trade: string; price: number; step: string };
};

export const hazardList: HazardConfig[] = [
  {
    key: 'leak', name: 'Leak', icon: 'pipe-leak', place: 'Kitchen sink', unit: 'L/min',
    normal: { value: '0.0', note: 'No flow · OK' },
    alarm: { value: '0.3', note: 'Leak detected', title: 'Leak detected', detail: 'Kitchen sink joint · 0.3 L/min while no tap is open', judged: 'Judged: small leak' },
    action: { button: 'Close the sleeve', step: 'Sleeve snapped shut', verified: 'Verified: flow stopped', auto: 'Small leak, so Sentosa patches it first. A big leak closes the water valve instead.' },
    after: { status: 'firstaid', value: '0.0', note: 'Sleeve is holding' },
    repair: { job: 'Replace sink joint', trade: 'plumbing', price: 120, step: 'Real repair' },
  },
  {
    key: 'heat', name: 'Heat', icon: 'thermometer-alert', place: '6 monitored points', unit: '°C',
    normal: { value: '31', note: '6 points · all OK' },
    // alarm / action / after / repair below are the DB box version; other devices override them (see heatDevices)
    alarm: { value: '52', note: 'Overheating', title: 'DB box overheating', detail: 'Front porch · 52°C, rising slowly', judged: 'Judged: heat build-up, no fault current' },
    action: { button: 'Start cooling fan', step: 'DB box fan on', verified: 'Verified: down to 39°C', auto: 'Slow heat build-up inside a closed box, so Sentosa cools first. A fast rise or abnormal current cuts the power instead.' },
    after: { status: 'firstaid', value: '39', note: 'Fan cooled it down' },
    repair: { job: 'Check DB box and wiring', trade: 'electrical', price: 150, step: 'Electrician check' },
  },
  {
    key: 'water', name: 'Water', icon: 'thermometer-water', place: 'Shower', unit: '°C',
    normal: { value: '38', note: 'Shower · safe' },
    alarm: { value: '51', note: 'Too hot', title: 'Shower water too hot', detail: 'Bathroom 1 · 51°C (cut-off at 49°C)', judged: 'Judged: scalding risk' },
    action: { button: 'Close shower supply', step: 'Shower supply closed', verified: 'Verified: no hot water flowing', auto: 'Above 43°C Sentosa warns. At 49°C it closes the supply until the water is safe.' },
    after: { status: 'cutoff', value: '36', note: 'Supply closed · safe' },
    repair: { job: 'Adjust heater thermostat', trade: 'plumbing', price: 90, step: 'Plumber: heater check' },
  },
  {
    key: 'gas', name: 'Gas', icon: 'gas-cylinder', place: 'Kitchen', unit: '%',
    normal: { value: '0', note: 'Kitchen · OK' },
    alarm: { value: '38', note: 'Gas detected', title: 'Gas leak in kitchen', detail: 'LPG at 38% of the danger level', judged: 'Judged: high level' },
    action: { button: 'Close gas valve', step: 'Gas valve closed · alarm on', verified: 'Verified: level falling (4%)', auto: 'Open the windows. Do not touch any switch or flame. Sentosa never switches electricity during a gas alarm.' },
    after: { status: 'cutoff', value: '4', note: 'Gas valve closed' },
    repair: { job: 'Check gas hose and regulator', trade: 'gas', price: 110, step: 'Gas technician' },
  },
  {
    key: 'tank', name: 'Roof tank', icon: 'storage-tank-outline', place: 'Roof', unit: '%',
    normal: { value: '72', note: 'Inlet open · OK' },
    alarm: { value: '100', note: 'Overflowing', title: 'Roof tank overflowing', detail: 'Water level 100% and still rising', judged: 'Judged: float valve failing' },
    action: { button: 'Close tank inlet', step: 'Tank inlet closed', verified: 'Verified: level steady at 95%', auto: 'The float valve should stop the water at full. When it fails, Sentosa closes the inlet.' },
    after: { status: 'cutoff', value: '95', note: 'Inlet closed' },
    repair: { job: 'Replace float valve', trade: 'plumbing', price: 80, step: 'Plumber: float valve' },
  },
];

export const hazardConfig = Object.fromEntries(hazardList.map((h) => [h.key, h])) as Record<HazardKey, HazardConfig>;

// ---- Leak: where it happens ----
// Every risky joint you can see has a clamp-ready sleeve waiting (x = position in the animation).
// A leak inside the wall has no sleeve, so the branch valve closes instead.
export type LeakSpot = { id: string; label: string; place: string; x: number | null; flow: string };

export const leakSpots: LeakSpot[] = [
  { id: 'sink', label: 'Sink joint', place: 'Kitchen · under the sink', x: 0.2, flow: '0.3' },
  { id: 'filter', label: 'Filter hose', place: 'Kitchen · water filter hose', x: 0.5, flow: '0.2' },
  { id: 'washer', label: 'Washer hose', place: 'Kitchen · washing machine inlet', x: 0.8, flow: '0.4' },
  { id: 'wall', label: 'Inside wall', place: 'Kitchen · hidden pipe in the wall', x: null, flow: '0.5' },
];

// ---- Heat: which device is overheating ----
export type HeatDevice = {
  id: string; name: string; icon: string; place: string; normal: number;
  alarm?: { temp: number; after: number; action: 'fan' | 'cut'; detail: string; button: string; step: string; auto: string; job: string; price: number };
};

export const heatDevices: HeatDevice[] = [
  { id: 'db', name: 'DB box', icon: 'lightning-bolt-outline', place: 'Front porch', normal: 31,
    alarm: { temp: 52, after: 39, action: 'fan', detail: 'Front porch · 52°C, rising slowly', button: 'Start cooling fan', step: 'DB box fan on',
      auto: 'Slow heat build-up inside a closed box, so Sentosa cools first. A fast rise or abnormal current cuts the power instead.', job: 'Check DB box and wiring', price: 150 } },
  { id: 'strip', name: 'Power strip', icon: 'power-socket-uk', place: 'Living room', normal: 29,
    alarm: { temp: 58, after: 35, action: 'cut', detail: 'Living room · 58°C · 3 plugs on one strip', button: 'Switch off this socket', step: 'Smart socket switched off',
      auto: 'A plug this hot is a fire risk. A fan would not help, so Sentosa cuts power to this socket only. The rest of the house stays on.', job: 'Replace power strip, check socket', price: 80 } },
  { id: 'aircon', name: 'Aircon socket', icon: 'air-conditioner', place: 'Master bedroom', normal: 30,
    alarm: { temp: 55, after: 34, action: 'cut', detail: 'Master bedroom · 55°C at the plug', button: 'Switch off aircon socket', step: 'Aircon socket switched off',
      auto: 'Loose or worn plugs heat up under heavy load. Sentosa cuts power to the aircon socket only.', job: 'Check aircon socket and wiring', price: 150 } },
  { id: 'heater', name: 'Water heater', icon: 'water-boiler', place: 'Bathroom 1', normal: 32,
    alarm: { temp: 61, after: 36, action: 'cut', detail: 'Bathroom 1 · 61°C at the heater switch', button: 'Cut water heater power', step: 'Water heater power cut',
      auto: 'The heater switch is hotter than it should be. Sentosa cuts the heater circuit until an electrician checks it.', job: 'Replace water heater switch', price: 120 } },
  { id: 'fridge', name: 'Fridge plug', icon: 'fridge-outline', place: 'Kitchen', normal: 30 },
  { id: 'washer', name: 'Washer plug', icon: 'washing-machine', place: 'Utility area', normal: 29 },
];

export const variantsFor: Partial<Record<HazardKey, { id: string; label: string }[]>> = {
  leak: leakSpots.map((s) => ({ id: s.id, label: s.label })),
  heat: heatDevices.filter((d) => d.alarm).map((d) => ({ id: d.id, label: d.name })),
};

// The full settings for one hazard, adjusted to where it happens (leak spot / hot device).
export function resolveConfig(key: HazardKey, variant?: string): HazardConfig {
  const base = hazardConfig[key];
  if (key === 'leak') {
    const spot = leakSpots.find((s) => s.id === variant) ?? leakSpots[0];
    if (spot.x === null) {
      return {
        ...base, place: spot.place,
        alarm: { value: spot.flow, note: 'Leak in wall', title: 'Leak inside the wall', detail: `Hidden pipe · ${spot.flow} L/min · no sleeve there`, judged: 'Judged: hidden pipe, no sleeve' },
        action: { button: 'Close kitchen water valve', step: 'Kitchen water valve closed', verified: 'Verified: flow stopped',
          auto: 'Sleeves only sit on joints you can see. For hidden pipes Sentosa closes the valve for that branch. The rest of the house keeps water.' },
        after: { status: 'cutoff', value: '0.0', note: 'Kitchen water closed' },
        repair: { job: 'Find and fix hidden pipe leak', trade: 'plumbing', price: 250, step: 'Real repair' },
      };
    }
    return {
      ...base, place: spot.place,
      alarm: { ...base.alarm, value: spot.flow, title: 'Leak detected', detail: `${spot.label} · ${spot.flow} L/min while no tap is open` },
      action: { button: 'Close the sleeve', step: `Sleeve at the ${spot.label.toLowerCase()} snapped shut`, verified: 'Verified: flow stopped',
        auto: 'Every risky joint has a sleeve waiting. The wet sensor pad shows which joint leaks, and only that sleeve snaps shut. Big leaks, or leaks in hidden pipes, close the water valve instead.' },
      after: { status: 'firstaid', value: '0.0', note: `Sleeve holding · ${spot.label.toLowerCase()}` },
      repair: { ...base.repair, job: spot.id === 'sink' ? 'Replace sink joint' : spot.id === 'filter' ? 'Replace filter hose' : 'Replace washer inlet hose' },
    };
  }
  if (key === 'heat') {
    const d = heatDevices.find((x) => x.id === variant && x.alarm) ?? heatDevices[0];
    const a = d.alarm!;
    return {
      ...base, place: `${d.name} · ${d.place}`,
      alarm: { value: String(a.temp), note: `${d.name} hot`, title: `${d.name} overheating`, detail: a.detail,
        judged: a.action === 'fan' ? 'Judged: heat build-up, no fault current' : 'Judged: fire risk at the plug' },
      action: { button: a.button, step: a.step, verified: `Verified: down to ${a.after}°C`, auto: a.auto },
      after: { status: a.action === 'fan' ? 'firstaid' : 'cutoff', value: String(a.after), note: a.action === 'fan' ? 'Fan cooled it down' : `${d.name} off · cooling` },
      repair: { job: a.job, trade: 'electrical', price: a.price, step: 'Electrician check' },
    };
  }
  return base;
}

export const home = {
  owner: 'Aiman',
  initials: 'AH',
  address: 'No. 12, Jalan Elmina 3',
  estate: 'Elmina West',
  houseType: 'Terrace Type B',
};

export type Company = {
  id: string;
  name: string;
  trade: string;
  rating: number;
  neighbours: number;
  worker: string;
  workerInitials: string;
};

export const companies: Company[] = [
  { id: 'abc', name: 'ABC Plumbing Sdn Bhd', trade: 'plumbing', rating: 4.9, neighbours: 32, worker: 'Ahmad', workerInitials: 'AR' },
  { id: 'pj', name: 'Paip Jaya Services', trade: 'plumbing', rating: 4.7, neighbours: 18, worker: 'Kumar', workerInitials: 'KS' },
  { id: 'volt', name: 'Volt Pro Electrical', trade: 'electrical', rating: 4.8, neighbours: 21, worker: 'Farid', workerInitials: 'FZ' },
  { id: 'cahaya', name: 'Cahaya Wiring Works', trade: 'electrical', rating: 4.6, neighbours: 12, worker: 'Lim', workerInitials: 'LW' },
  { id: 'safegas', name: 'SafeGas Services', trade: 'gas', rating: 4.9, neighbours: 15, worker: 'Rahman', workerInitials: 'RM' },
  { id: 'dapur', name: 'Dapur Gas Tech', trade: 'gas', rating: 4.5, neighbours: 7, worker: 'Siva', workerInitials: 'SV' },
  { id: 'xyz', name: 'XYZ Renovation Sdn Bhd', trade: 'general', rating: 4.8, neighbours: 14, worker: 'Hafiz', workerInitials: 'HZ' },
  { id: 'kemas', name: 'Kemas Rumah Services', trade: 'general', rating: 4.6, neighbours: 9, worker: 'Daniel', workerInitials: 'DT' },
];

export const timeSlots = ['Today 3–5 pm', 'Today 5–7 pm', 'Tomorrow AM'];

export type CareSignal = {
  key: string;
  label: string;
  icon: string;
  detail: string;
  seen: boolean;
};

export const care = {
  person: 'Mom',
  address: 'No. 21, Jalan Elmina 5',
  todayOk: true,
  lastSign: '7:42 am',
  consent: 'Mom agreed · 12 Oct',
  // Daily Signal box: no camera, only simple signs of a normal day
  signals: [
    { key: 'fridge', label: 'Fridge door', icon: 'fridge-outline', detail: 'opened 7:42 am', seen: true },
    { key: 'light', label: 'Light', icon: 'lightbulb-outline', detail: 'on 7:10 pm yesterday', seen: true },
    { key: 'motion', label: 'Movement', icon: 'motion-sensor', detail: 'kitchen · 8:05 am', seen: true },
    { key: 'door', label: 'Front door', icon: 'door-open', detail: 'opened 9:20 am', seen: true },
    { key: 'button', label: '"Saya OK" button', icon: 'gesture-tap-button', detail: 'not needed today', seen: false },
  ] as CareSignal[],
  rules: [
    'Light on by 8 pm',
    'Fridge door by 11 am',
    'Any movement by 11 am',
  ],
};

export const fixHistory = [
  { date: '03 Sep', what: 'Aircon service', who: 'CoolTech', price: 'RM90' },
  { date: '20 Jun', what: 'Bathroom tiles regrouted', who: 'Kemas Rumah', price: 'RM180' },
];

// ---- Renovate: snap a space → pick an item → see it first → trusted contractors ----
// Pictures are our own drawings (components/room.tsx). Prices and companies are made up.
export type RenoItemId = 'wardrobe' | 'kitchen' | 'desk' | 'tv';
export type RenoStyle = 'oak' | 'white' | 'walnut' | 'grey';

export const renoItems: { id: RenoItemId; name: string; short: string; room: string; icon: string; sizes: string[]; from: number; to: number }[] = [
  { id: 'wardrobe', name: 'Built-in wardrobe', short: 'Wardrobe', room: 'Bedroom 2 · empty corner', icon: 'wardrobe-outline', sizes: ['About 1.8 m wide', 'About 2.4 m wide', 'About 3.0 m wide'], from: 4200, to: 5600 },
  { id: 'kitchen', name: 'Kitchen cabinet', short: 'Kitchen cabinet', room: 'Kitchen · back wall', icon: 'countertop-outline', sizes: ['About 2.4 m long', 'About 3.0 m long', 'L-shape · 4 m'], from: 6800, to: 9500 },
  { id: 'desk', name: 'Study desk and shelf', short: 'Study desk', room: 'Bedroom 3 · window wall', icon: 'desk', sizes: ['About 1.5 m wide', 'About 2.4 m wide', 'Wall to wall'], from: 1600, to: 2400 },
  { id: 'tv', name: 'TV cabinet and wall panel', short: 'TV / shoe cabinet', room: 'Living room · TV wall', icon: 'television', sizes: ['About 1.8 m wide', 'About 2.4 m wide', 'About 3.0 m wide'], from: 2800, to: 3900 },
];
export const renoStyles: { id: RenoStyle; name: string; color: string }[] = [
  { id: 'oak', name: 'Light oak', color: '#c8a27a' },
  { id: 'white', name: 'White', color: '#efebe5' },
  { id: 'walnut', name: 'Walnut', color: '#6e4b33' },
  { id: 'grey', name: 'Grey', color: '#8b9099' },
];
export const renoPros = [
  { id: 'xyz', name: 'XYZ Renovation', rating: 4.8, jobs: 14, factor: 1.0, earliest: 'Mon 3 Nov', crew: 3, lead: 'Hafiz' },
  { id: 'kabinet', name: 'Kabinet Maju', rating: 4.6, jobs: 9, factor: 0.9, earliest: 'Thu 6 Nov', crew: 2, lead: 'Daniel' },
  { id: 'kemas', name: 'Rumah Kemas', rating: 4.7, jobs: 6, factor: 1.08, earliest: 'Sat 1 Nov', crew: 3, lead: 'Ravi' },
];
// Stage-by-stage payment: money is released only after the owner approves photos of each stage.
export const renoStages = [
  { name: 'Site visit and measure', share: 10 },
  { name: 'Build in workshop', share: 40 },
  { name: 'Install (2 days)', share: 40 },
  { name: 'Final check and clean', share: 10 },
];
export const renoPrice = (item: RenoItemId, pro: { factor: number }) => {
  const i = renoItems.find((x) => x.id === item)!;
  return Math.round(((i.from + i.to) / 2) * pro.factor / 50) * 50;
};
