# Sentosa app: libraries and licences

This list is for the T&C (clause 14): only permissive licences, no GPL.
Checked 11 Oct 2026. Run the check again before submitting:

```bash
npx license-checker-rseidelsohn@4.4.2 --summary
```

## Libraries we use directly

| Library | Version | Licence | What it does |
|---|---|---|---|
| expo | 57.0.27 | MIT | App framework |
| react / react-native | 19.2.3 / 0.86.3 | MIT | UI |
| expo-router | 57.0.25 | MIT | Screens and tabs (native Liquid Glass tab bar on iOS 26) |
| expo-glass-effect | 57.0.4 | MIT | Liquid Glass cards on iOS 26 |
| expo-blur | 57.0.3 | MIT | Frosted glass fallback (Android, older iOS) |
| react-native-svg | 15.15.4 | MIT | Rings, dials, QR pattern |
| @expo/vector-icons | 15.1.1 | MIT | Icons (Material Design Icons set) |
| @expo-google-fonts/urbanist | 0.4.2 | MIT (code) + OFL-1.1 (font) | Urbanist font |
| expo-font, expo-haptics, expo-status-bar, expo-constants, expo-linking | 57.x | MIT | Helpers |
| react-native-screens, react-native-safe-area-context | 4.26.2 / 5.7.0 | MIT | Navigation helpers |
| typescript (dev only) | 6.0.3 | Apache-2.0 | Type checking |

## Everything else (pulled in by the libraries above)

About 530 packages, almost all MIT, ISC, Apache-2.0 or BSD. The ones worth noting:

| Package | Licence | Note |
|---|---|---|
| node-forge | BSD-3-Clause OR GPL-2.0 | Dual licence: we use it under **BSD-3-Clause**. Build tool only. |
| lightningcss | MPL-2.0 | Build tool only, used unmodified. Not shipped in the app. |
| caniuse-lite | CC-BY-4.0 | Build tool data only. |
| glob, minimatch, lru-cache and others | BlueOak-1.0.0 | Permissive. |
| argparse | Python-2.0 | Permissive, build tool only. |

No package is GPL-only.
