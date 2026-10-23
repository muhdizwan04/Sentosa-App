import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { call } from '@/components/actions';
import { DayRing } from '@/components/gauges';
import { RoutineChart } from '@/components/routine';
import { careToday, clockText, DEMO_DAY } from '@/data/routine';
import { Btn, Chip, Dot, Glass, Icon, Row, Screen, T } from '@/components/ui';
import { care } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

export default function CareScreen() {
  const t = useTheme();
  const [who, setWho] = useState('Mom');
  // Opening the tab always starts on Mom (the parent with Care set up), so demos and tours show her first.
  const { who: whoParam } = useLocalSearchParams<{ who?: string }>();
  useFocusEffect(useCallback(() => setWho(whoParam === 'Kids' ? 'Kids' : 'Mom'), [whoParam]));
  const { careState, setCare, prefs, setPref } = useStore();
  const paused = !!prefs.carePaused;
  const missed = careState === 'missed' || careState === 'guard';
  const ct = careToday();
  const blink = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(blink, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [blink]);
  const now = new Date();
  const fraction = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);

  return (
    <Screen>
      <Row>
        <View style={{ flex: 1 }} />
        {['Mom', 'Kids', 'Dad'].map((p) => (
          <Chip key={p} label={p} on={p === who} onPress={() => setWho(p)} />
        ))}
      </Row>

      {who === 'Kids' ? (
        <>
          <View>
            <T size={30} weight="light">Aisyah · home after school</T>
            <T size={13} soft>Age 10 · school days · Daily Signal at home</T>
          </View>
          <Glass pad={18} wash={t.accentWash}>
            <Row gap={12}>
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="home-account" size={26} color={t.onSolid} />
              </View>
              <View style={{ flex: 1 }}>
                <T size={20} weight="medium">Aisyah is home ✓</T>
                <T size={13} soft>Front door 2:12 PM · pressed "I'm home" 2:13 PM</T>
              </View>
            </Row>
          </Glass>
          <Glass pad={16}>
            <View style={{ gap: 12 }}>
              {[['door-open', 'Front door', 'opened 2:12 PM'], ['gesture-tap-button', '"I\'m home" button', 'pressed 2:13 PM'], ['motion-sensor', 'Movement', 'living room · 2:20 PM'], ['stove', 'Kitchen', 'stove off · no gas']].map(([ic, a, b]) => (
                <Row key={a} gap={12}>
                  <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.glass2, alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={19} /></View>
                  <View style={{ flex: 1 }}><T size={14}>{a}</T><T size={12} soft>{b}</T></View>
                  <Dot color={t.ok} />
                </Row>
              ))}
            </View>
          </Glass>
          <Glass pad={16}>
            <T size={15} weight="medium">If she's not home by 2:35 PM</T>
            <T size={13} soft style={{ marginTop: 4 }}>Usually home 2:00–2:20 PM on school days (learned). Late for her → you are alerted → the guard checks the house.</T>
            <T size={13} soft style={{ marginTop: 8 }}>Works the same with a maid or caretaker at home. No camera.</T>
          </Glass>
          <Btn label="Call home" icon="phone-outline" onPress={() => call('Home · No. 12', 'Aisyah', 'call', 'AI')} />
        </>
      ) : who === 'Dad' ? (
        <>
          <View>
            <T size={30} weight="light">Dad's home</T>
            <T size={13} soft>Not set up yet</T>
          </View>
          <Glass>
            <Row gap={12}>
              <Icon name="heart-plus-outline" size={26} color={t.accentText} />
              <View style={{ flex: 1 }}>
                <T size={15} weight="medium">Add Daily Signal for Dad</T>
                <T size={12} soft>Ask Dad first. No consent, no monitoring. No camera.</T>
              </View>
            </Row>
          </Glass>
          <Btn label="Set up Care for Dad" icon="hand-heart-outline" onPress={() => router.push('/care-setup?person=Dad')} />
        </>
      ) : (
      <>
      {paused && (
        <Glass wash={t.accentWash} onPress={() => setPref('carePaused', false)}>
          <Row gap={10}>
            <Icon name="pause-circle-outline" size={22} color={t.accentText} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="medium">Care is paused by {care.person}</T>
              <T size={12} soft>No checks while paused · tap to resume</T>
            </View>
          </Row>
        </Glass>
      )}
      <View>
        <T size={30} weight="light">{care.person}'s home</T>
        <T size={13} soft>{care.address} · Daily Signal</T>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 4 }}>
        <DayRing fraction={fraction} />
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Icon name={missed ? 'heart-pulse' : 'heart-outline'} size={24} color={missed ? t.dangerText : t.accentText} />
          <T size={26} weight="light">{missed ? 'Check needed' : 'Today OK'}</T>
          <T size={11} soft>{missed ? `no sign by ${clockText(ct.base.checkAt)}` : careState === 'resolved' ? `checked by guard ${ct.times.guardOk}` : `last sign ${clockText(ct.firstToday)}`}</T>
        </View>
      </View>

      {missed && (
        <Glass wash="rgba(229,72,77,0.25)" onPress={() => router.push('/care-alert')}>
          <Row gap={12}>
            <Animated.View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: t.danger, alignItems: 'center', justifyContent: 'center', opacity: blink.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }}>
              <T size={11} weight="semibold" color="#fff">SAYA{'\n'} OK?</T>
            </Animated.View>
            <View style={{ flex: 1 }}>
              <T size={15} weight="medium">{careState === 'guard' ? 'Guard Rahim on the way' : 'Box is blinking at Mom\'s home'}</T>
              <T size={12} soft>{careState === 'guard' ? `Family alerted ${ct.times.family}` : 'Waiting for the "Saya OK" press · 10 min'}</T>
            </View>
          </Row>
        </Glass>
      )}
      {careState === 'resolved' && (
        <Glass wash={t.accentWash}>
          <Row gap={10}>
            <Icon name="check-decagram-outline" size={22} color={t.accentText} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="medium">Checked by Guard Rahim · {ct.times.guardOk}</T>
              <T size={12} soft>Mom was resting. OK ✓</T>
            </View>
          </Row>
        </Glass>
      )}
      {/* Learns her normal day: a personal baseline instead of one fixed rule for everyone */}
      <Glass pad={16}>
        <Row>
          <T size={16} weight="medium" style={{ flex: 1 }}>{care.person}'s normal morning</T>
          <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: t.accentWash }}>
            <T size={12} color={t.accentText}>Learned · 30 days</T>
          </View>
        </Row>
        <T size={14} style={{ marginTop: 6 }}>
          {missed
            ? `Today: no sign by ${clockText(ct.base.checkAt)} — unusual for her.`
            : `Today: fridge opened ${clockText(ct.firstToday)} — normal for her ✓`}
        </T>
        <T size={13} soft>Usually {ct.usual} on {ct.base.typeName}.</T>
        <View style={{ marginTop: 8 }}>
          <RoutineChart mornings={ct.mornings} today={DEMO_DAY} todayFirst={ct.firstToday} missed={missed} />
        </View>
        <T size={12} soft style={{ marginTop: 4 }}>
          Dots = her last 30 mornings · band = her usual time. Sentosa checks at {clockText(ct.base.checkAt)}, not a fixed 11 am — help comes sooner, with fewer false alarms. Box blinks → "Saya OK" → family → guard. Demo data.
        </T>
      </Glass>
      {/* Daily Signal sensors: fridge door, light, movement, door, "Saya OK" button. No camera. */}
      <Glass>
        <View style={{ gap: 12 }}>
          {care.signals.map((s) => (
            <Row key={s.key} gap={12}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.glass2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={19} />
              </View>
              <View style={{ flex: 1 }}>
                <T size={14}>{s.label}</T>
                <T size={12} soft>{missed ? 'not since last night' : s.key === 'fridge' ? `opened ${clockText(ct.firstToday)}` : s.detail}</T>
              </View>
              <Dot color={missed ? t.danger : s.seen ? t.ok : t.track} />
            </Row>
          ))}
        </View>
      </Glass>

      <Row gap={8}>
        <Btn label={`Call ${care.person}`} icon="phone-outline" style={{ flex: 1 }} onPress={() => call(care.person, care.address, missed ? 'noanswer' : 'call', 'MO')} />
        <View style={{ flex: 1 }}><Btn label="Ask guard" ghost onPress={() => { setCare('guard'); router.push('/guard?mode=care'); }} /></View>
      </Row>


      <Glass onPress={() => router.push('/care-setup')}>
        <Row gap={10}>
          <Icon name="shield-check-outline" size={18} color={t.soft} />
          <View style={{ flex: 1 }}>
            <T size={13}>Consent: {care.consent}</T>
            <T size={12} soft>Family only sees "OK" or "check needed". Pause any time.</T>
          </View>
        </Row>
      </Glass>
      </>
      )}
    </Screen>
  );
}
