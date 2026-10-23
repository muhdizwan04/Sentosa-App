import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { Alert, View } from 'react-native';
import { FlowGauge } from '@/components/gauges';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { hazardConfig, type HazardKey } from '@/data/demo';
import { useConfig, useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Incident timeline for one hazard (id = hazard key, e.g. /incident/leak).
export default function IncidentScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: HazardKey }>();
  const c = useConfig(hazardConfig[id] ? id : 'leak');
  const { hazards, job, trigger, fixMyself } = useStore();
  const h = hazards[c.key];
  const unit = c.unit === '%' ? '%' : ` ${c.unit}`;
  const myJob = job?.hazard === c.key ? job : null;

  const steps = h.steps.map((s) =>
    s.label === c.repair.step && myJob ? { ...s, label: `Repair booked · ${myJob.slot}`, done: true } : s,
  );

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label={`Incident · ${c.name}`} on />
      </Row>

      {h.status === 'ok' ? (
        <>
        <Glass>
          <Row gap={12}>
            <Icon name="shield-check-outline" size={24} />
            <View style={{ flex: 1 }}>
              <T size={16} weight="medium">No open incident</T>
              <T size={12} soft>{c.name} · {c.place} is OK</T>
            </View>
          </Row>
        </Glass>
        <Btn label="Run a test alarm" icon="play-circle-outline" ghost onPress={() => { trigger(c.key); router.replace(`/respond/${c.key}`); }} />
        <T size={11} soft style={{ textAlign: 'center' }}>Demo: pretends this sensor went off</T>
        </>
      ) : (
        <>
          <View>
            <T size={30} weight="light" style={{ letterSpacing: -0.5 }}>{c.alarm.title}</T>
            <T size={13} soft style={{ marginTop: 2 }}>{c.place} · since {h.since}</T>
          </View>

          <Glass wash={h.status === 'firstaid' ? t.accentWash : 'rgba(229,72,77,0.22)'}>
            <Row gap={14}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <FlowGauge before={Number(c.alarm.value)} now={Number(h.value)} max={Number(c.alarm.value) * 1.15} />
                <View style={{ position: 'absolute', alignItems: 'center' }}>
                  <T size={28} weight="light">{h.value}</T>
                  <T size={11} soft>{c.unit} now</T>
                </View>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T size={14}>Was <T size={14} weight="semibold">{c.alarm.value}{unit}</T></T>
                <T size={14}>{h.note}</T>
                <T size={12} soft>
                  {h.status === 'detected' ? 'Nobody has acted yet' : h.status === 'firstaid' ? 'First aid, not a repair' : 'Supply stays off until it is fixed'}
                </T>
              </View>
            </Row>
          </Glass>

          <Glass>
            <View style={{ gap: 12 }}>
              {steps.map((s) => (
                <Row key={s.label} gap={12}>
                  <View
                    style={{
                      width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: s.done ? t.solid : 'transparent',
                      borderWidth: s.done ? 0 : 1, borderStyle: 'dashed', borderColor: t.soft,
                    }}>
                    <Icon name={s.done ? 'check' : 'wrench-outline'} size={14} color={s.done ? t.onSolid : t.soft} />
                  </View>
                  <T size={14} soft={!s.done} style={{ flex: 1 }}>{s.label}</T>
                  <T size={12} soft>{s.time}</T>
                </Row>
              ))}
            </View>
          </Glass>

          {h.status === 'detected' ? (
            <Btn label="Respond now" icon="alert-octagon-outline" onPress={() => router.push(`/respond/${c.key}`)} />
          ) : myJob ? (
            <Btn label="Track the repair" icon="map-marker-path" onPress={() => router.push('/job')} />
          ) : (
            <>
              <Btn label={`Book a fix · RM${c.repair.price}*`} onPress={() => router.push(`/book?hazard=${c.key}`)} />
              <Btn
                label="I'll fix it myself"
                ghost
                onPress={() =>
                  Alert.alert('Fixed it yourself?', 'Sentosa closes this alert and notes it in your Home Health Record.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Yes, it is fixed', onPress: () => { fixMyself(c.key); goBack(); } },
                  ])
                }
              />
              <T size={11} soft style={{ textAlign: 'center' }}>*Illustrative price</T>
            </>
          )}
        </>
      )}
    </Screen>
  );
}
