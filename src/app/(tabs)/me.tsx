import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';
import { Avatar, Btn, Glass, Icon, Row, Screen, T } from '@/components/ui';
import { home } from '@/data/demo';
import { GUARD } from '@/data/features';
import { useAlerts, useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

const items = [
  GUARD
    ? { icon: 'baby-face-outline', title: 'Child or elderly mode', sub: 'Hot water: warn 38° · cut 40°', to: '/water' }
    : { icon: 'heart-outline', title: 'Care for Mom', sub: 'Daily Signal · consent · pause', to: '/care-setup' },
  { icon: 'account-group-outline', title: 'Family members', sub: 'Who gets alerts', to: '/settings?page=family' },
  { icon: 'bell-outline', title: 'Notifications', sub: 'Push on · loud sound for gas', to: '/settings?page=notifications' },
  { icon: 'shield-check-outline', title: 'Privacy and consent', sub: 'What we store · delete my data', to: '/settings?page=privacy' },
];

export default function MeScreen() {
  const t = useTheme();
  const { job, resetDemo } = useStore();
  const alerts = useAlerts();

  const confirmReset = () =>
    Alert.alert('Reset demo?', 'Everything goes back to the start: no visitors, no renovation, no booked jobs, Mom OK.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetDemo },
    ]);

  return (
    <Screen>
      <Row gap={14}>
        <Avatar initials={home.initials} size={56} />
        <View>
          <T size={24} weight="light">{home.owner}</T>
          <T size={13} soft>{home.address} · {home.estate}</T>
        </View>
      </Row>

      {/* Demo prototype controls for the pitch */}
      <Glass wash={t.accentWash}>
        <Row gap={10} style={{ marginBottom: 12 }}>
          <Icon name="play-circle-outline" size={22} color={t.accentText} />
          <View style={{ flex: 1 }}>
            <T size={16} weight="medium">Demo prototype</T>
            <T size={12} soft>
              {GUARD ? (alerts.length ? `${alerts.length} hazard${alerts.length > 1 ? 's' : ''} triggered` : 'All hazards OK') : 'Care · Pass · Renovate'}
              {job ? ' · 1 job booked' : ''}
            </T>
          </View>
        </Row>
        <View style={{ gap: 8 }}>
          <Btn label="Open demo controls" icon="play-circle-outline" onPress={() => router.push('/demo')} />
          <Btn label="Reset demo" icon="restart" ghost onPress={confirmReset} />
        </View>
      </Glass>

      <Glass pad={6}>
        {items.map((it, i) => (
          <Pressable key={it.title} onPress={() => router.push(it.to as never)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Row gap={12} style={{ padding: 10, borderTopWidth: i ? 0.5 : 0, borderTopColor: t.line }}>
            <Icon name={it.icon} size={20} color={t.soft} />
            <View style={{ flex: 1 }}>
              <T size={15}>{it.title}</T>
              <T size={12} soft>{it.sub}</T>
            </View>
            <Icon name="chevron-right" color={t.soft} />
          </Row>
          </Pressable>
        ))}
      </Glass>
      <T size={11} soft style={{ textAlign: 'center' }}>Demo build · made-up data only</T>
    </Screen>
  );
}
