import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { FirstAidAnimation } from '@/components/firstaid';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { call, goBack } from '@/components/actions';
import { hazardConfig, type HazardKey } from '@/data/demo';
import { useConfig, useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Full-screen Guard alert: shows the hazard, then plays the first aid when the owner taps the action.
export default function RespondScreen() {
  const t = useTheme();
  const { key, auto } = useLocalSearchParams<{ key: HazardKey; auto?: string }>();
  const { hazards, applyFirstAid } = useStore();
  const c = useConfig(hazardConfig[key] ? key : 'leak');
  const [stage, setStage] = useState<'alert' | 'acting' | 'done'>(
    hazards[c.key].status === 'detected' ? 'alert' : 'done',
  );
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]));
    p.start();
    return () => p.stop();
  }, [pulse]);

  // Auto tour: press the action button by itself after `auto` ms.
  useEffect(() => {
    if (!auto || stage !== 'alert') return;
    const id = setTimeout(() => setStage('acting'), Number(auto));
    return () => clearTimeout(id);
  }, [auto]); // eslint-disable-line react-hooks/exhaustive-deps

  const alarm = stage !== 'done';
  const ringColor = alarm ? t.danger : t.accent;

  return (
    <Screen tabBar={false}>
      <Row>
        <Chip label="Sentosa Guard" on />
        <View style={{ flex: 1 }} />
        <IconButton icon="close" label="Close" onPress={goBack} />
      </Row>

      <Row gap={16} style={{ marginTop: 6 }}>
        <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: ringColor,
              opacity: alarm ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }) : 0.3,
              transform: [{ scale: alarm ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) : 1 }],
            }}
          />
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: ringColor, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={alarm ? c.icon : 'shield-check'} size={24} color="#fff" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <T size={26} weight="light" style={{ lineHeight: 30 }}>{alarm ? c.alarm.title : 'Safe for now'}</T>
          <T size={13} soft>{alarm ? c.alarm.detail : c.action.verified}</T>
        </View>
      </Row>

      <Glass wash={alarm ? 'rgba(229,72,77,0.18)' : t.accentWash} pad={18}>
        <FirstAidAnimation
          hazard={c.key}
          variant={hazards[c.key].variant}
          playing={stage !== 'alert'}
          onDone={() => {
            applyFirstAid(c.key);
            setStage('done');
          }}
        />
      </Glass>

      {stage === 'alert' && (
        <>
          <Btn label={c.action.button} icon="play-circle-outline" onPress={() => setStage('acting')} />
          <Glass>
            <Row gap={10} style={{ alignItems: 'flex-start' }}>
              <Icon name={c.key === 'gas' ? 'alert-octagon-outline' : 'information-outline'} size={18} color={c.key === 'gas' ? t.dangerText : t.soft} />
              <T size={12.5} soft style={{ flex: 1, lineHeight: 18 }}>
                {c.action.auto}
              </T>
            </Row>
          </Glass>
          <Btn label="Later" ghost onPress={goBack} />
        </>
      )}

      {stage === 'acting' && (
        <T size={13} soft style={{ textAlign: 'center' }}>Sentosa is working on it…</T>
      )}

      {stage === 'done' && (
        <>
          <Btn label={`Book a fix · RM${c.repair.price}*`} onPress={() => router.replace(`/book?hazard=${c.key}`)} />
          <Btn label="View incident" ghost onPress={() => router.replace(`/incident/${c.key}`)} />
          {c.key === 'gas' && <Btn label="Call Bomba · 994" icon="phone-alert-outline" ghost onPress={() => call('Bomba · 994', 'Fire and rescue', 'emergency')} />}
          <T size={11} soft style={{ textAlign: 'center' }}>
            First aid only. The real fix still needs a {c.repair.trade === 'electrical' ? 'licensed electrician' : c.repair.trade === 'gas' ? 'gas technician' : 'plumber'}. *Illustrative price
          </T>
        </>
      )}
    </Screen>
  );
}
