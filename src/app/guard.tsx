import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { call, goBack } from '@/components/actions';
import { View } from 'react-native';
import { QrPattern } from '@/components/gauges';
import { Viewfinder } from '@/components/photos';
import { useSteps } from '@/components/steps';
import { Avatar, Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care } from '@/data/demo';
import { careToday } from '@/data/routine';
import { atGateNow, scamRadar, timeText } from '@/data/estate';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Guard's tablet at the gate (in real life a web page on a tablet).
// mode=scan: QR → MATCH → entry logged · mode=walkin: unbooked "officer" → flagged → owner decides · mode=care: Daily Signal check
export default function GuardScreen() {
  const t = useTheme();
  const { mode = 'scan', who } = useLocalSearchParams<{ mode?: string; who?: string }>();
  const visitor = who === 'visitor';
  const crew = who === 'crew';
  const { job, setCare, reno, setScam } = useStore();
  const radar = scamRadar();
  const crewName = reno?.pro.name ?? 'XYZ Renovation';
  const scan = useSteps(3, [2200, 2600, 2500]);
  const walk = useSteps(3, [2600, 3200, 3000]);
  const [denied, setDenied] = useState(false); // guard denied straight away, without asking the owner
  const chk = useSteps(3, [2600, 3000, 3000]);
  const red = 'rgba(229,72,77,0.28)';
  useEffect(() => { if (mode === 'care' && chk.step === 2) setCare('resolved'); }, [chk.step]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (mode === 'walkin' && walk.step === 2 && radar.flagged) setScam(true); }, [walk.step]); // eslint-disable-line react-hooks/exhaustive-deps

  const header = (
    <Row>
      <IconButton icon="arrow-left" label="Back" onPress={goBack} />
      <Chip label="Sentosa Guard · Gate A" on />
      <View style={{ flex: 1 }} />
      <Avatar initials="RH" size={36} />
    </Row>
  );

  if (mode === 'walkin') {
    const s = walk.step;
    return (
      <Screen tabBar={false}>
        {header}
        <T size={28} weight="light">Walk-in visitor</T>
        <Glass wash={red}>
          <Row gap={10}><Icon name="alert-octagon-outline" size={22} color={t.dangerText} /><T size={18} weight="medium" color={t.dangerText}>FLAGGED · no booking</T></Row>
          <T size={14} style={{ marginTop: 8 }}>Says: "{atGateNow.claim}, {atGateNow.reason}" · for {atGateNow.house}</T>
          <T size={12} soft>No job or visitor pass in Sentosa for this house</T>
        </Glass>
        {radar.flagged && (
          <Glass wash="rgba(229,72,77,0.18)">
            <Row gap={10}><Icon name="radar" size={22} color={t.dangerText} /><T size={16} weight="medium">Scam radar: likely fake</T></Row>
            <T size={14} style={{ marginTop: 6 }}>Same "{atGateNow.claim}" today at {radar.matches.map((m) => `${m.house} (${timeText(m.at)})`).join(' and ')} — no booking anywhere.</T>
          </Glass>
        )}
        {s === 0 && (
          <>
            <Btn label="Notify owner" icon="bell-ring-outline" onPress={walk.next} />
            <Btn label="Verify ID with official hotline" ghost icon="phone-outline" onPress={() => call('Water company hotline', 'Official number · checks staff ID', 'call')} />
            <Btn label="Deny entry" ghost onPress={() => { setDenied(true); walk.setStep(2); }} />
          </>
        )}
        {s >= 1 && !denied && (
          <Glass wash={t.accentWash}>
            <Row gap={10}><Icon name="cellphone-message" size={20} color={t.accentText} /><T size={15}>Owner notified · waiting…</T></Row>
            {s === 2 && <T size={15} weight="medium" style={{ marginTop: 10 }}>Owner: "Not expected. Don't let in."</T>}
          </Glass>
        )}
        {s === 2 && (
          <Glass wash={red}>
            <Row gap={10}><Icon name="shield-lock-outline" size={22} color={t.dangerText} /><T size={16} weight="medium">Entry denied · logged {timeText(atGateNow.at)}</T></Row>
            <T size={12} soft style={{ marginTop: 6 }}>{radar.flagged ? 'All gates and residents warned by the scam radar' : 'Real officers are verified by the hotline, never blocked by default'}</T>
          </Glass>
        )}
        {s === 2 && radar.flagged && <Btn label="See estate alert" icon="radar" onPress={() => router.push('/estate-alert')} />}
      </Screen>
    );
  }

  if (mode === 'care') {
    const s = chk.step;
    return (
      <Screen tabBar={false}>
        {header}
        <T size={28} weight="light">Care check</T>
        <Glass wash={s < 2 ? red : t.accentWash}>
          <T size={18} weight="medium">{care.address}</T>
          <T size={14} style={{ marginTop: 4 }}>{care.person} lives alone · no sign of her usual morning</T>
          <T size={12} soft>Family asked for a check · {careToday().times.guardAsked}</T>
        </Glass>
        {s === 0 && (
          <>
            <Btn label="On my way" icon="walk" onPress={chk.next} />
            <Btn label="Call family" ghost icon="phone-outline" onPress={() => call('Aiman', `Family of ${care.person}`, 'call', 'AH')} />
          </>
        )}
        {s === 1 && (
          <>
            <Glass><Row gap={10}><Icon name="walk" size={20} color={t.accentText} /><T size={15}>Guard Rahim on the way · 3 min</T></Row></Glass>
            <Btn label="Resident OK" icon="check" onPress={chk.next} />
            <Btn label="Call ambulance" ghost icon="ambulance" onPress={() => call('Ambulance · 999', 'Emergency', 'emergency')} />
          </>
        )}
        {s === 2 && (
          <Glass wash={t.accentWash}>
            <Row gap={10}><Icon name="check-decagram-outline" size={24} color={t.accentText} /><T size={18} weight="medium">Resident OK · {careToday().times.guardOk}</T></Row>
            <T size={14} style={{ marginTop: 6 }}>{care.person} was resting. Family updated.</T>
          </Glass>
        )}
      </Screen>
    );
  }

  const s = scan.step;
  return (
    <Screen tabBar={false}>
      {header}
      <T size={28} weight="light">{s === 0 ? 'Scan pass' : 'Pass checked'}</T>
      <Viewfinder height={300} scanning={s === 0}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', opacity: s === 0 ? 0.85 : 0.35 }}>
          <QrPattern size={190} />
        </View>
      </Viewfinder>
      {s >= 1 && (
        <Glass wash={t.accentWash}>
          <Row gap={12}>
            <Avatar initials={visitor ? 'SN' : crew ? crewName.slice(0, 2).toUpperCase() : job?.company.workerInitials ?? 'AR'} size={46} />
            <View style={{ flex: 1 }}>
              <T size={20} weight="medium" color={t.accentText}>MATCH ✓</T>
              <T size={14}>{visitor ? 'Siti · family visitor of Aiman' : crew ? `${crewName} crew · ${reno?.pro.crew ?? 3} people · job #R-118` : job ? `Job #${job.id} · ${job.company.worker} · ${job.company.name.replace(' Sdn Bhd', '')}` : 'Job #J-2041 · Ahmad · ABC Plumbing'}</T>
              <T size={12} soft>{visitor ? 'No. 12 · Sat 2–8 PM · one entry' : crew ? 'No. 12 · Mon–Tue 9 AM–6 PM · renovation, CIDB ✓' : 'No. 12 · today 3–5 PM only · ID checked by company'}</T>
            </View>
          </Row>
        </Glass>
      )}
      {s === 1 && <Btn label="Allow entry" icon="gate-open" onPress={scan.next} />}
      {s === 2 && (
        <Glass>
          <Row gap={10}><Icon name="check" size={20} color={t.accentText} /><T size={15}>Entry logged {visitor ? '2:31 PM' : crew ? '9:04 AM' : '3:02 PM'} · owner notified</T></Row>
        </Glass>
      )}
    </Screen>
  );
}
