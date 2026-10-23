import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { call, goBack } from '@/components/actions';
import { useSteps } from '@/components/steps';
import { careToday, clockText } from '@/data/routine';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Family's phone: no daily signal from the parent this morning.
export default function CareAlertScreen() {
  const t = useTheme();
  const { setCare } = useStore();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]));
    p.start();
    return () => p.stop();
  }, [pulse]);
  const { step, next } = useSteps(2, [4200, 1500], () => router.replace('/guard?mode=care&auto=1'));
  const ask = () => next();
  useEffect(() => { if (step === 1) setCare('guard'); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const ct = careToday();
  const log = [
    [ct.times.noticed, `No fridge door, light or movement — she is usually up by ${clockText(ct.base.to)}`, true],
    [ct.times.noticed, 'Box blinks and beeps: "Saya OK?"', true],
    [ct.times.noPress, 'No press after 10 minutes', true],
    [ct.times.family, 'You are alerted', true],
    [ct.times.guardAsked, step >= 1 ? 'Guard asked now' : 'Guard is asked automatically', step >= 1],
  ] as const;

  return (
    <Screen tabBar={false}>
      <Row>
        <Chip label="Sentosa Care" on />
        <View style={{ flex: 1 }} />
        <IconButton icon="close" label="Close" onPress={goBack} />
      </Row>
      <Row gap={16}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: t.danger, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.55] }) }} />
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.danger, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart-pulse" size={24} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <T size={26} weight="light">Check needed</T>
          <T size={13} soft>{care.person}'s home · {care.address.split(',')[0]}</T>
        </View>
      </Row>
      <Glass>
        <View style={{ gap: 10 }}>
          {log.map(([tm, txt, done]) => (
            <Row key={txt} gap={10}>
              <Icon name={done ? 'check-circle' : 'clock-outline'} size={18} color={done ? t.accentText : t.soft} />
              <T size={12} soft style={{ width: 62 }}>{tm}</T>
              <T size={13} soft={!done} style={{ flex: 1 }}>{txt}</T>
            </Row>
          ))}
        </View>
      </Glass>
      <Btn label={`Call ${care.person}`} icon="phone-outline" ghost onPress={() => call(care.person, care.address, 'noanswer', 'MO')} />
      {step === 0 ? <Btn label="Ask guard to check now" icon="shield-account-outline" onPress={ask} /> : (
        <Glass wash={t.accentWash}><Row gap={10}><Icon name="walk" size={20} color={t.accentText} /><T size={15}>Guard Rahim is on the way</T></Row></Glass>
      )}
    </Screen>
  );
}
