import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { goBack, openMaps } from '@/components/actions';
import { QrPattern } from '@/components/gauges';
import { Photo } from '@/components/photos';
import { useSteps } from '@/components/steps';
import { Avatar, Btn, Chip, Glass, Icon, IconButton, Row, Screen, Solid, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Technician / company app ("Sentosa Pro"): accept → gate QR → before/after photos → re-arm sleeve → mark done.
export default function TechScreen() {
  const t = useTheme();
  const { job } = useStore();
  const sensor = !!job?.hazard; // leak etc. (Guard) vs a problem the owner reported
  const jobName = job?.jobName ?? 'Repair wall crack';
  const price = job?.price ?? 250;
  const firm = job?.company.name.replace(' Sdn Bhd', '') ?? 'XYZ Renovation';
  const worker = job?.company.worker ?? 'Hafiz';
  const { step, next } = useSteps(6, [2800, 3000, 2800, 3800, 3600, 2600]);

  const tick = (on: boolean, txt: string, sub?: string) => (
    <Row gap={12}>
      <Icon name={on ? 'check-circle' : 'circle-outline'} size={22} color={on ? t.accentText : t.soft} />
      <View style={{ flex: 1 }}>
        <T size={15} soft={!on}>{txt}</T>
        {sub ? <T size={12} soft>{sub}</T> : null}
      </View>
    </Row>
  );

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label="Sentosa Pro · technician" on />
        <View style={{ flex: 1 }} />
        <Avatar initials={job?.company.workerInitials ?? 'HZ'} size={36} />
      </Row>
      <View>
        <T size={28} weight="light">{['New job', 'Job #J-2041', 'At the gate', 'Working', 'Finish', 'Done'][step]}</T>
        <T size={13} soft>{firm} · {worker}</T>
      </View>

      {step === 0 && (
        <>
          <Glass wash={t.accentWash}>
            <T size={17} weight="medium">{jobName}</T>
            <T size={13} style={{ marginTop: 4 }}>No. 12, Jalan Elmina 3 · today 3–5 PM</T>
            <T size={13} soft>Fixed price RM{price}* · paid when the owner confirms</T>
          </Glass>
          <Row gap={8}>
            <Btn label="Accept" icon="check" style={{ flex: 1 }} onPress={next} />
            <View style={{ flex: 1 }}><Btn label="Decline" ghost onPress={() => Alert.alert('Decline this job?', 'It goes to the next verified company. Declining often lowers your rating.', [
              { text: 'Keep job', style: 'cancel' },
              { text: 'Decline', style: 'destructive', onPress: () => goBack() },
            ])} /></View>
          </Row>
          <Glass><T size={14}>Tomorrow · Water heater check</T><T size={12} soft>No. 30 · 10–12</T></Glass>
        </>
      )}

      {step === 1 && (
        <>
          {sensor ? (
            <Glass>
              <T size={12} soft>What Sentosa saw</T>
              <T size={15}>Small leak at filter hose · 0.2 L/min</T>
              <T size={13} soft>Sleeve snapped shut 2:14 PM · water safe now</T>
            </Glass>
          ) : (
            <Glass>
              <T size={12} soft>What the owner reported</T>
              <T size={15}>Hairline crack · living room wall</T>
              <T size={13} soft>Photo checked: low urgency · 6 neighbours have the same</T>
            </Glass>
          )}
          <Glass>
            <T size={12} soft>House</T>
            <T size={15}>Terrace Type B · {sensor ? 'kitchen sink' : 'living room, near the window'}</T>
            <T size={13} soft>{sensor ? 'Main valve: front porch, left' : 'Bring filler, sealant and matching paint'}</T>
          </Glass>
          <Btn label="Show gate QR" icon="qrcode" onPress={next} />
          <Btn label="Navigate" ghost icon="navigation-variant-outline" onPress={() => openMaps('Elmina West, Shah Alam')} />
        </>
      )}

      {step === 2 && (
        <>
          <Glass pad={18}>
            <QrPattern />
            <T size={13} soft style={{ textAlign: 'center', marginTop: 12 }}>Show this at Gate A · valid 3–5 PM today</T>
          </Glass>
          <Glass wash={t.accentWash}><Row gap={10}><Icon name="gate-open" size={20} color={t.accentText} /><T size={15}>Guard scanned · entered 3:02 PM</T></Row></Glass>
          <Btn label="Start work" icon="wrench-outline" onPress={next} />
        </>
      )}

      {step === 3 && (
        <>
          <T size={12} soft>Before</T>
          <Photo kind={sensor ? 'leaky' : 'crack'} height={150} />
          <T size={12} soft>After</T>
          <Photo kind={sensor ? 'fixed' : 'patched'} height={150} />
          <Glass><T size={13}>{sensor ? 'Note: replaced filter hose and joint washer' : 'Note: crack opened, filled, sealed and painted'}</T></Glass>
          <Btn label="Next" onPress={next} />
        </>
      )}

      {step >= 4 && (
        <>
          <Glass>
            <View style={{ gap: 14 }}>
              {tick(true, 'Photos uploaded', 'before + after')}
              {sensor ? tick(true, 'Re-arm the sleeve', 'open it, put the latch pin back') : tick(true, 'Area cleaned', 'dust sheet removed')}
              {sensor ? tick(step >= 4, 'Hold Reset 3 s', 'Sentosa box back to NORMAL') : tick(step >= 4, 'Paint dry', 'touch-up checked')}
              {tick(step >= 5, 'Owner asked to confirm')}
            </View>
          </Glass>
          {step === 4 ? (
            <Btn label="Mark done" icon="check-all" onPress={next} />
          ) : (
            <Solid>
              <T size={16} weight="medium" color={t.onSolid}>Sent to Aiman ✓</T>
              <T size={12} color={t.onSolidSoft}>RM{price}* released when he confirms</T>
            </Solid>
          )}
          {step === 5 && (
            <Btn label="Back to jobs" ghost onPress={goBack} />
          )}
        </>
      )}
    </Screen>
  );
}
