import { router } from 'expo-router';
import { Alert, Linking, Share } from 'react-native';
import type { HistoryItem } from '@/data/store';
import { home } from '@/data/demo';

// Small actions shared by many buttons. Calls are pretend (see app/call.tsx); sharing uses the phone's own share sheet.

type CallMode = 'call' | 'noanswer' | 'emergency' | 'sos';
export function call(name: string, sub: string, mode: CallMode = 'call', initials?: string) {
  const q = new URLSearchParams({ name, sub, mode, ...(initials ? { initials } : {}) });
  router.push(`/call?${q.toString()}`);
}

export const callGuard = () => call('Guard house', 'Gate A · Elmina West');

export function sos() {
  Alert.alert('Send SOS?', 'The guard house and your family get an alert with your address.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Send SOS', style: 'destructive', onPress: () => call('SOS', '', 'sos') },
  ]);
}

// Only demo text is shared — no real names, numbers or links.
export function shareText(message: string) {
  Share.share({ message }).catch(() => {});
}

export const passMessage = (v: { name: string; when: string; entry: string }) =>
  `Sentosa visitor pass for ${v.name.split(' (')[0]}\n${home.address} · Gate A\n${v.when} · ${v.entry.toLowerCase()}\nShow this pass to the guard. (demo)`;

export function shareRecord(history: HistoryItem[]) {
  const lines = history.map((h) => `${h.date} · ${h.what} · ${h.who} · ${h.price}`);
  shareText(`Home Health Record · ${home.address}, ${home.estate}\n\n${lines.join('\n')}\n\nFrom Sentosa (demo data)`);
}

export function openMaps(place: string) {
  Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(place)}`).catch(() =>
    Alert.alert('Maps not available', place),
  );
}

// Back button that never dead-ends: with nothing to go back to (e.g. a screen opened from a link), go Home.
export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Close every open screen above the tabs — only when there is something to close (avoids a dev warning).
export function closeAll() {
  if (router.canDismiss()) router.dismissAll();
}
