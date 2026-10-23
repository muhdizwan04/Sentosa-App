import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { useState } from 'react';
import { View } from 'react-native';
import { useSteps } from '@/components/steps';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care } from '@/data/demo';
import { useTheme } from '@/theme/theme';

// Family sets up Daily Signal — only with the parent's agreement.
export default function CareSetupScreen() {
  const t = useTheme();
  const { step, next } = useSteps(3, [2400, 2400, 2200], () => goBack());
  const { person = care.person } = useLocalSearchParams<{ person?: string }>();
  const signals = ['Fridge door', 'Lights', 'Movement', '"Saya OK" button'];
  const [on, setOn] = useState<string[]>(signals);
  const flip = (s: string) => setOn((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));
  const address = person === care.person ? care.address : 'Add the address after the box is fitted';
  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label="Set up Care" on />
      </Row>
      <View>
        <T size={28} weight="light">{person}'s home</T>
        <T size={13} soft>{address}</T>
      </View>
      <Glass wash={step >= 1 ? t.accentWash : undefined}>
        <Row gap={10}>
          <Icon name={step >= 1 ? 'check-circle' : 'circle-outline'} size={22} color={step >= 1 ? t.accentText : t.soft} />
          <View style={{ flex: 1 }}>
            <T size={15} weight="medium">{person} agrees</T>
            <T size={12} soft>{step >= 1 ? `Consent recorded · ${person === care.person ? care.consent.split('· ')[1] : 'today'} · can pause any time` : 'Ask first. No consent, no monitoring.'}</T>
          </View>
        </Row>
      </Glass>
      {step === 0 && <Btn label={`${person} agreed`} icon="hand-heart-outline" onPress={next} />}
      {step >= 1 && (
        <>
          <T size={13} soft>Signs of a normal day (no camera)</T>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>{signals.map((s) => <Chip key={s} label={s} on={on.includes(s)} onPress={step === 1 ? () => flip(s) : undefined} />)}</Row>
          <Glass>
            <T size={13}>Sentosa learns {person}'s usual times over the first 2 weeks. Family sees only "OK" or "Check needed" — never a live feed.</T>
          </Glass>
        </>
      )}
      {step === 1 && <T size={11} soft>Tap a sign to turn it on or off</T>}
      {step === 1 && <Btn label={`Save · ${on.length} sign${on.length === 1 ? '' : 's'}`} onPress={next} />}
      {step === 2 && (
        <Glass wash={t.accentWash}>
          <Row gap={10}><Icon name="heart-outline" size={22} color={t.accentText} /><T size={16} weight="medium">Daily Signal is on</T></Row>
        </Glass>
      )}
      {step === 2 && <Btn label="Done" ghost onPress={goBack} />}
    </Screen>
  );
}
