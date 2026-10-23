import { useColorScheme } from 'react-native';

// Sentosa colours: dark blue, white and grey.
// Rule: white/grey = OK, blue = first aid working (needs you), red = cut off / danger only.
const dark = {
  scheme: 'dark' as 'dark' | 'light',
  bg: '#04070d',
  bgTop: '#0a1222',
  bgBottom: '#070c18',
  blobA: '#163a96',
  blobB: '#0e1c48',
  blobC: '#8c98af',
  strip: '#4a6fc4',
  text: '#f3f5f8',
  soft: '#98a2b3',
  glassFallback: 'rgba(255,255,255,0.07)',
  glass2: 'rgba(255,255,255,0.11)',
  line: 'rgba(255,255,255,0.14)',
  solid: '#ffffff',
  onSolid: '#0b1530',
  onSolidSoft: 'rgba(11,21,48,0.55)',
  accent: '#2f5bd3',
  accentText: '#8fb0ff',
  accentWash: 'rgba(47,91,211,0.35)',
  ok: '#e4e8ee',
  danger: '#e5484d',
  dangerText: '#ff8f92',
  track: 'rgba(255,255,255,0.08)',
  tick: 'rgba(255,255,255,0.28)',
  tickOn: 'rgba(255,255,255,0.9)',
};

const light: typeof dark = {
  scheme: 'light',
  bg: '#e7eaf0',
  bgTop: '#f4f6f9',
  bgBottom: '#d9dee7',
  blobA: '#1e40af',
  blobB: '#94a3b8',
  blobC: '#ffffff',
  strip: '#9db2e0',
  text: '#0b1530',
  soft: '#5d6778',
  glassFallback: 'rgba(255,255,255,0.55)',
  glass2: 'rgba(255,255,255,0.6)',
  line: 'rgba(255,255,255,0.85)',
  solid: '#0f2350',
  onSolid: '#ffffff',
  onSolidSoft: 'rgba(255,255,255,0.65)',
  accent: '#1e40af',
  accentText: '#1e40af',
  accentWash: 'rgba(30,64,175,0.18)',
  ok: '#94a3b8',
  danger: '#d93b40',
  dangerText: '#c62f35',
  track: 'rgba(15,35,80,0.08)',
  tick: 'rgba(15,35,80,0.25)',
  tickOn: '#0f2350',
};

export type Theme = typeof dark;

export function useTheme(): Theme {
  return useColorScheme() === 'light' ? light : dark;
}

export const font = {
  light: 'Urbanist_300Light',
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
};

// Colour for a hazard status: grey/white OK, blue first aid, red alarm or cut off.
export function statusColor(t: Theme, status: 'ok' | 'detected' | 'firstaid' | 'cutoff') {
  if (status === 'detected' || status === 'cutoff') return t.danger;
  if (status === 'firstaid') return t.accent;
  return t.ok;
}
