# Sentosa app (iOS + Android)

Sime Darby Property University Hackathon 2026 · People track. Demo build, with made-up data only.

## Round 1 focus: Care · Pass · Renovate

- **Care** — Daily Signal for a parent living alone (no camera), family alert, guard check, consent.
- **Pass** — visitor QR passes, the guard tablet, the fake-officer check, and a crew pass for renovation days.
- **Renovate** — snap an empty space → pick a wardrobe / kitchen cabinet / study desk / TV cabinet → see it first
  (before/after slider) → compare trusted contractors → pay stage by stage → crew gets a gate pass. Small repairs
  (Snap & Report) and the Home Health Record live here too. The "after" pictures are our own drawings (`src/components/room.tsx`).
- **Smart features** (simple, written by the team, run on demo data — no outside AI service):
  - *Learns a normal day* (`src/data/routine.ts`): a personal baseline from 30 mornings, per weekday / Friday / weekend.
    Care checks when today is unusual for her (e.g. 8:11 am), not at a fixed 11 am.
  - *Scam radar* (`src/data/estate.ts`): same claim + no booking + 3 houses within 2 hours → estate alert for every gate and resident.
- **Guard** (leak, overheating, hot water, gas, roof tank first aid) is **switched off, not deleted**, and kept for the top 10:
  set `GUARD = true` in `src/data/features.ts`. Its Home lives in `src/guard/GuardHome.tsx`. A zip of the full Guard
  version is at `~/Projects/sentosa-app-guard-version-backup.zip`.

> **Keep this folder in a path with no apostrophe** (for example `~/Projects/sentosa-app`).
> The iOS build scripts break on folder names like `weng's`.

## Run it

```bash
npm install
```

**On this Mac (Xcode 26.2) use Expo Go.** This SDK needs Xcode 26.4+ for a full native build, so for now the app runs inside Expo Go:

```bash
npx expo start --go
```

Then press `i` to open the iOS simulator, or scan the QR code with Expo Go on a real phone (same Wi-Fi).
The app reloads every time you save a file.

After updating Xcode to 26.4 or newer, you can make a full native build:

```bash
LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npx expo run:ios
```

Android: `npx expo run:android` (or Expo Go on an Android phone).

Check before you share or commit:

```bash
npx tsc --noEmit
```

## Folders

| Path | What |
|---|---|
| `src/app/(tabs)/` | The 5 tabs: `index` (Home), `fix`, `pass`, `care`, `me` |
| `src/app/incident/[id].tsx` | Incident timeline for any hazard |
| `src/app/water.tsx` | Scald guard dial |
| `src/app/book.tsx`, `src/app/job.tsx` | Flow A: book a fix → job tracking → gate pass |
| `src/app/demo.tsx` | Demo controls: simulate each of the 5 hazards, play the auto tour, reset demo |
| `src/data/tour.ts` | Auto tours, one per video chapter (leak, hazards, pass, care, technician, extras) |
| `src/app/visitor.tsx` | Owner makes a visitor QR pass |
| `src/app/guard.tsx` | Guard tablet: scan → MATCH (`mode=scan`), walk-in flagged (`mode=walkin`), Care check (`mode=care`) |
| `src/app/gate-ask.tsx` | Owner's phone: unbooked "officer" at the gate → owner decides |
| `src/app/care-setup.tsx`, `src/app/care-alert.tsx` | Care: consent setup · "no daily signal" family alert |
| `src/app/tech.tsx` | Technician app (Sentosa Pro): accept → gate QR → photos → re-arm sleeve → done |
| `src/app/confirm.tsx` | Owner confirms + rates → Home Health Record |
| `src/app/report.tsx`, `src/app/renovation.tsx` | Snap & Report (AI result, "Me too") · renovation by stage |
| `src/components/steps.ts` | Step-by-step screens; `?auto=1` makes a screen play itself |
| `src/components/photos.tsx` | Drawn demo "photos" and the camera viewfinder |
| `src/app/respond/[key].tsx` | Full-screen Guard alert + first-aid animation |
| `src/components/firstaid.tsx` | Animations: clamp-ready sleeves, 6-point overheat (fan / socket cut), valves (gas, scald, tank) |
| `src/components/ui.tsx` | Glass card, solid card, buttons, chips, text, background |
| `src/components/gauges.tsx` | Status ring, flow gauge, temperature dial, day ring, QR pattern |
| `src/data/demo.ts` | Hazard settings (alarm values, actions, repairs) and demo data |
| `src/data/store.tsx` | Demo state: trigger, first aid, booking, reset (to be replaced by Firebase) |
| `src/theme/theme.ts` | Colours for dark and light mode |

## Design rules (keep every screen the same)

- **Style:** liquid glass. On iOS 26 the cards and tab bar use Apple's real Liquid Glass. Android and older iOS use a frosted blur.
- **Colours:** dark blue, white and grey. The app follows the phone's dark or light setting.
  - White/grey = OK
  - **Blue** = first aid working / needs you
  - **Red** = only for cut off or danger (gas, power cut, scald cut-off, SOS)
- **Font:** Urbanist. Big numbers and titles are light (300), labels are regular (400), buttons are semibold (600).
- **Cards:** `Glass` for most things. `Solid` (white in dark mode, navy in light mode) for the one main item on a screen.
- **Buttons:** one solid main button per screen; the others are glass (`ghost`).
- **Shapes:** round everything: cards 26, buttons and chips fully round.
- **Safety alerts** (gas, scald) must use big, clear text, never only a colour.

## Privacy rules for the demo

- Only made-up names, addresses and companies.
- No keys or passwords in the code. Firebase settings go in a local `.env` file that is never shared.
- Lock the Firebase database with access rules from day one.
- See `LICENSES.md` for the library licence list (no GPL).

## Buttons that reach "outside" the app

- **Calls and SOS are pretend.** Call guard, Call Mak, Call family, hotline, Bomba 994, ambulance 999 and SOS all open the in-app call screen (`src/app/call.tsx`). Nothing is dialled or sent — never real emergency numbers.
- **Share and Export** open the phone's normal share sheet with demo text only (visitor pass, job pass, Home Health Record).
- **Navigate** (technician app) opens Apple Maps at Elmina West.
- **Chat with the company** is local: replies are written in, nothing is sent.
- Settings switches (family alerts, notifications, pause Care) live in demo memory and clear on **Reset demo** or **Delete my data**.

## Team

- [@muhdizwan04](https://github.com/muhdizwan04)
- [@nazrul-beep](https://github.com/nazrul-beep)
