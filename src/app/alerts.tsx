import { router } from 'expo-router';
import { goBack } from '@/components/actions';
import { View } from 'react-native';
import { Dot, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care, resolveConfig } from '@/data/demo';
import { useAlerts, useStore } from '@/data/store';
import { statusColor, useTheme } from '@/theme/theme';

// Bell on Home: everything that needs the owner, most serious first.
export default function AlertsScreen() {
  const t = useTheme();
  const { hazards, job, careState, visitors, reno, scam } = useStore();
  const renoWaiting = !!reno && reno.approved < 4;
  const alerts = useAlerts();
  const careMissed = careState === 'missed' || careState === 'guard';

  const item = (key: string, icon: string, title: string, sub: string, onPress: () => void, color?: string) => (
    <Glass key={key} onPress={onPress}>
      <Row gap={12}>
        <Icon name={icon} size={22} color={color ?? t.soft} />
        <View style={{ flex: 1 }}>
          <T size={15} weight="medium">{title}</T>
          <T size={12} soft>{sub}</T>
        </View>
        <Icon name="chevron-right" color={t.soft} />
      </Row>
    </Glass>
  );

  const empty = !alerts.length && !careMissed && !job && !visitors.length && !renoWaiting && !scam;

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <T size={13} soft>Alerts</T>
      </Row>
      <T size={28} weight="light">{empty ? 'All quiet' : 'Needs you'}</T>

      {alerts.map((h) => {
        const s = hazards[h.key];
        const c = resolveConfig(h.key, s.variant);
        return (
          <Glass key={h.key} onPress={() => router.push(s.status === 'detected' ? `/respond/${h.key}` : `/incident/${h.key}`)}
            wash={s.status === 'detected' ? 'rgba(229,72,77,0.25)' : undefined}>
            <Row gap={12}>
              <Dot color={statusColor(t, s.status)} size={10} />
              <View style={{ flex: 1 }}>
                <T size={15} weight="medium">{s.status === 'detected' ? c.alarm.title : s.note}</T>
                <T size={12} soft>{c.place} · since {s.since}{s.status === 'detected' ? ' · tap to respond' : ''}</T>
              </View>
              <Icon name="chevron-right" color={t.soft} />
            </Row>
          </Glass>
        );
      })}
      {careMissed && item('care', 'heart-pulse', `${care.person}: check needed`, 'No daily signal this morning', () => router.push('/care-alert'), t.dangerText)}
      {scam && item('scam', 'radar', 'Estate alert: fake "water plumber"', 'Tried 3 houses today · no booking', () => router.push('/estate-alert'), t.dangerText)}
      {renoWaiting && item('reno', 'hammer', reno!.approved === 0 ? `Site visit · ${reno!.pro.earliest}` : 'Stage photos ready to approve', `${reno!.pro.name} · job #${reno!.id}`, () => router.push('/renovate/project'), t.accentText)}
      {job && item('job', 'wrench-outline', `${job.jobName} · booked`, `${job.company.name} · ${job.slot}`, () => router.push('/job'), t.accentText)}
      {visitors.map((v) => item(v.id, 'qrcode', `Visitor pass · ${v.name}`, `${v.when} · ${v.entry.toLowerCase()}`, () => router.navigate('/pass')))}

      {empty && (
        <Glass>
          <Row gap={12}>
            <Icon name="shield-check-outline" size={24} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="medium">Your home is safe</T>
              <T size={12} soft>New alerts show here and on your lock screen.</T>
            </View>
          </Row>
        </Glass>
      )}
    </Screen>
  );
}
