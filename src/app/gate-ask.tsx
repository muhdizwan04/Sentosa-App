import { router } from 'expo-router';
import { closeAll, goBack } from '@/components/actions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSteps } from '@/components/steps';
import { atGateNow, scamRadar, timeText } from '@/data/estate';
import { useStore } from '@/data/store';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { useTheme } from '@/theme/theme';

// Owner's phone: an unbooked "officer" is at the gate. The owner decides before anyone enters.
export default function GateAskScreen() {
  const t = useTheme();
  const { step, next } = useSteps(2, [3000, 3000]);
  const [allowed, setAllowed] = useState(false);
  const { setScam } = useStore();
  const radar = scamRadar();
  useEffect(() => { if (step === 1 && !allowed && radar.flagged) setScam(true); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen tabBar={false}>
      <Row>
        <Chip label="Sentosa Pass" on />
        <View style={{ flex: 1 }} />
        <IconButton icon="close" label="Close" onPress={goBack} />
      </Row>
      <T size={30} weight="light">Someone at{'\n'}the gate</T>
      <Glass wash="rgba(229,72,77,0.25)">
        <Row gap={10}><Icon name="account-question-outline" size={24} color={t.dangerText} /><T size={18} weight="medium">Says: {atGateNow.claim}</T></Row>
        <T size={14} style={{ marginTop: 6 }}>"{atGateNow.reason.charAt(0).toUpperCase() + atGateNow.reason.slice(1)}" · for your house, {atGateNow.house}</T>
        <T size={12} soft>No booking in Sentosa · guard is checking staff ID</T>
        {radar.flagged && (
          <Row gap={8} style={{ marginTop: 10 }}>
            <Icon name="radar" size={18} color={t.dangerText} />
            <T size={14} weight="medium" color={t.dangerText} style={{ flex: 1 }}>Scam radar: tried {radar.matches.length} other houses in Elmina today</T>
          </Row>
        )}
      </Glass>
      {step === 0 ? (
        <Row gap={8}>
          <Btn label="Yes, expected" ghost style={{ flex: 1 }} onPress={() => { setAllowed(true); next(); }} />
          <View style={{ flex: 1 }}><Btn label="No, don't let in" onPress={next} /></View>
        </Row>
      ) : allowed ? (
        <Glass wash={t.accentWash}>
          <Row gap={10}><Icon name="gate-open" size={22} color={t.accentText} /><T size={16} weight="medium">Guard told: let in after ID check</T></Row>
          <T size={12} soft style={{ marginTop: 6 }}>Logged {timeText(atGateNow.at)} · one entry, for your house only</T>
        </Glass>
      ) : (
        <Glass wash={t.accentWash}>
          <Row gap={10}><Icon name="shield-check-outline" size={22} color={t.accentText} /><T size={16} weight="medium">Guard told: do not let in</T></Row>
          <T size={12} soft style={{ marginTop: 6 }}>Logged {timeText(atGateNow.at)} · {radar.flagged ? 'all gates and neighbours warned' : 'you can report it to the estate'}</T>
        </Glass>
      )}
      {step === 1 && !allowed && radar.flagged && <Btn label="See estate alert" icon="radar" onPress={() => { closeAll(); router.push('/estate-alert'); }} />}
      {step === 1 && <Btn label="Done" ghost onPress={goBack} />}
    </Screen>
  );
}
