import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { goBack, shareRecord } from '@/components/actions';
import { Photo } from '@/components/photos';
import { useSteps } from '@/components/steps';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Owner checks the finished job, confirms, rates → saved to the Home Health Record.
export default function ConfirmScreen() {
  const t = useTheme();
  const { job, completeJob, history } = useStore();
  const [name] = useState(job?.jobName ?? 'Repair wall crack');
  const [sensor] = useState(!!job?.hazard);
  const [who] = useState(job ? `${job.company.name.replace(' Sdn Bhd', '')} · ${job.company.worker}` : 'XYZ Renovation · Hafiz');
  const [problem, setProblem] = useState(false);
  const { step, next } = useSteps(4, [3000, 1200, 2600, 3000]);
  const [picked, setPicked] = useState(0);
  const rating = picked || 5; // auto tour gives 5 stars
  const stars = picked ? picked : step >= 2 ? 5 : step === 1 ? 3 : 0;

  const confirm = () => next();
  const rate = () => next();
  const recorded = useRef(false); // record the job once
  useEffect(() => { if (step === 2 && !recorded.current) { recorded.current = true; completeJob(rating); } }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label={step < 3 ? 'Job done · check it' : 'Home Health Record'} on />
      </Row>
      {step < 3 ? (
        <>
          <View>
            <T size={28} weight="light">{name}</T>
            <T size={13} soft>{who} · 3:40 PM</T>
          </View>
          <Row gap={8}>
            <View style={{ flex: 1 }}><T size={11} soft>Before</T><Photo kind={sensor ? 'leaky' : 'crack'} height={110} /></View>
            <View style={{ flex: 1 }}><T size={11} soft>After</T><Photo kind={sensor ? 'fixed' : 'patched'} height={110} /></View>
          </Row>
          <Glass wash={t.accentWash}>
            <T size={15}>{sensor ? 'Hose replaced · sleeve re-armed' : 'Crack filled, sealed and painted'}</T>
            <T size={12} soft>{sensor ? 'Warranty 90 days · Sentosa box NORMAL ✓' : 'Warranty 90 days · photos saved'}</T>
          </Glass>
          {step === 0 && problem ? (
            <>
              <Glass wash="rgba(229,72,77,0.22)">
                <Row gap={10}><Icon name="alert-circle-outline" size={20} color={t.dangerText} /><T size={15} weight="medium">Problem reported · payment on hold</T></Row>
                <T size={12} soft style={{ marginTop: 6 }}>{who.split(' · ')[0]} must come back within 48 hours, free of charge. Your gate pass is renewed for that visit.</T>
              </Glass>
              <Btn label="It's fine now · confirm" icon="check" onPress={() => { setProblem(false); confirm(); }} />
            </>
          ) : step === 0 ? (
            <Row gap={8}>
              <Btn label="Confirm" icon="check" style={{ flex: 1 }} onPress={confirm} />
              <View style={{ flex: 1 }}><Btn label="Report a problem" ghost onPress={() => setProblem(true)} /></View>
            </Row>
          ) : (
            <Glass>
              <T size={13} soft>How was the job?</T>
              <Row gap={6} style={{ marginTop: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Pressable key={i} onPress={step === 1 ? () => setPicked(i) : undefined} accessibilityLabel={`${i} stars`}>
                    <Icon name={i <= stars ? 'star' : 'star-outline'} size={34} color={i <= stars ? '#f5c451' : t.soft} />
                  </Pressable>
                ))}
              </Row>
              <T size={12} soft style={{ marginTop: 8 }}>Shown only to neighbours in Elmina West</T>
              {step === 1 && <Btn label="Submit" onPress={rate} style={{ marginTop: 12 }} />}
            </Glass>
          )}
        </>
      ) : (
        <>
          <T size={28} weight="light">Recorded ✓</T>
          <Glass>
            <View style={{ gap: 12 }}>
              {history.map((f) => (
                <Row key={f.date + f.what} gap={12}>
                  <T size={12} soft style={{ width: 48 }}>{f.date}</T>
                  <View style={{ flex: 1 }}>
                    <T size={14} weight={f.fresh ? 'medium' : 'regular'} color={f.fresh ? t.accentText : undefined}>{f.what}</T>
                    <T size={12} soft>{f.who} · {f.price}</T>
                  </View>
                </Row>
              ))}
            </View>
          </Glass>
          <Btn label="Export for buyer or insurer" ghost icon="file-document-outline" onPress={() => shareRecord(history)} />
          <Btn label="Back to home" onPress={() => router.navigate('/')} />
        </>
      )}
    </Screen>
  );
}
