import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Glass, Icon, Row, Screen, T } from '@/components/ui';
import { home } from '@/data/demo';
import { useTheme } from '@/theme/theme';

// Pretend phone call (and SOS) for the demo. Nothing is dialled or sent — not even emergency numbers.
// mode: call · noanswer (rings, nobody picks up) · emergency (994 / 999) · sos (alerts guard + family)
export default function CallScreen() {
  const t = useTheme();
  const { name = 'Guard house', sub = 'Gate A', initials, mode = 'call' } =
    useLocalSearchParams<{ name?: string; sub?: string; initials?: string; mode?: string }>();
  const [phase, setPhase] = useState<'ringing' | 'live' | 'noanswer'>('ringing');
  const [secs, setSecs] = useState(0);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  const sos = mode === 'sos';

  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]));
    a.start();
    Haptics.notificationAsync(sos ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (sos) return () => a.stop();
    const id = setTimeout(() => setPhase(mode === 'noanswer' ? 'noanswer' : 'live'), mode === 'noanswer' ? 6000 : 2500);
    return () => { a.stop(); clearTimeout(id); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'live') return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const status = phase === 'ringing' ? 'Calling…' : phase === 'noanswer' ? 'No answer' : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  const red = '#e5484d';
  const blue = '#2f5bd3';

  if (sos) {
    return (
      <Screen tabBar={false}>
        <View style={{ alignItems: 'center', marginTop: 40, gap: 10 }}>
          <Ring pulse={pulse} color={red}><Icon name="alarm-light-outline" size={40} color="#fff" /></Ring>
          <T size={32} weight="light">SOS sent</T>
          <T size={13} soft>{home.address} · {clockNow()}</T>
        </View>
        <Glass wash="rgba(229,72,77,0.25)">
          <View style={{ gap: 12 }}>
            {['Guard house · Gate A alerted', 'Family members alerted', 'Your address shared with the guard'].map((x) => (
              <Row key={x} gap={10}><Icon name="check-circle" size={20} color={t.dangerText} /><T size={15}>{x}</T></Row>
            ))}
          </View>
        </Glass>
        <Glass>
          <T size={13}>Guard Rahim is on the way. Stay where it is safe.</T>
          <T size={12} soft style={{ marginTop: 4 }}>For fire or injury, also call 994 or 999 yourself.</T>
        </Glass>
        <Pressable onPress={goBack} style={({ pressed }) => ({ backgroundColor: t.solid, borderRadius: 99, padding: 16, alignItems: 'center', opacity: pressed ? 0.85 : 1 })}>
          <T size={15} weight="semibold" color={t.onSolid}>I'm safe now · cancel SOS</T>
        </Pressable>
        <T size={11} soft style={{ textAlign: 'center' }}>Demo only · no real alert is sent</T>
      </Screen>
    );
  }

  return (
    <Screen tabBar={false}>
      <View style={{ alignItems: 'center', marginTop: 60, gap: 8 }}>
        <Ring pulse={phase === 'ringing' ? pulse : null} color={mode === 'emergency' ? red : blue}>
          {initials ? <T size={34} weight="light" color="#fff">{initials}</T> : <Icon name={mode === 'emergency' ? 'phone-alert-outline' : 'shield-account-outline'} size={40} color="#fff" />}
        </Ring>
        <T size={32} weight="light" style={{ marginTop: 10 }}>{name}</T>
        <T size={14} soft>{sub}</T>
        <T size={18} style={{ marginTop: 6 }} color={phase === 'noanswer' ? t.dangerText : undefined}>{status}</T>
      </View>

      {mode === 'emergency' && (
        <Glass wash="rgba(229,72,77,0.25)">
          <T size={13}>In a real emergency, dial this number from your phone. The demo never dials it.</T>
        </Glass>
      )}
      {phase === 'noanswer' && (
        <Glass>
          <T size={13}>No answer. Sentosa will ask the guard to check if there is still no sign.</T>
        </Glass>
      )}

      <View style={{ flex: 1 }} />
      <Row gap={22} style={{ justifyContent: 'center', marginTop: 30 }}>
        <Round icon={mute ? 'microphone-off' : 'microphone-outline'} label="Mute" on={mute} onPress={() => setMute((m) => !m)} />
        <Round icon="phone-hangup" label="End" color={red} onPress={goBack} />
        <Round icon="volume-high" label="Speaker" on={speaker} onPress={() => setSpeaker((s) => !s)} />
      </Row>
      <T size={11} soft style={{ textAlign: 'center', marginTop: 18 }}>Demo call · no real call is made</T>
    </Screen>
  );
}

function clockNow() {
  const d = new Date();
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

function Ring({ pulse, color, children }: { pulse: Animated.Value | null; color: string; children: React.ReactNode }) {
  return (
    <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
      {pulse && <Animated.View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: color, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] }) }} />}
      <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
    </View>
  );
}

function Round({ icon, label, on, color, onPress }: { icon: string; label: string; on?: boolean; color?: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable
        onPress={onPress}
        accessibilityLabel={label}
        style={({ pressed }) => ({ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: color ?? (on ? '#2f5bd3' : t.glass2), opacity: pressed ? 0.8 : 1 })}>
        <Icon name={icon} size={28} color={color || on ? '#fff' : t.text} />
      </Pressable>
      <T size={12} soft>{label}</T>
    </View>
  );
}
