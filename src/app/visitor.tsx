import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { goBack, passMessage, shareText } from '@/components/actions';
import { QrPattern } from '@/components/gauges';
import { useSteps } from '@/components/steps';
import { Btn, Chip, Glass, IconButton, Row, Screen, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

const days = ['Today · 2–8 pm', 'Tomorrow · all day', 'Sat 25 Oct · 2–8 pm'];

// Owner makes a visitor pass: fill in → QR ready → share.
export default function VisitorScreen() {
  const t = useTheme();
  const { addVisitor, removeVisitor, visitors } = useStore();
  const [name, setName] = useState('Siti (sister)');
  const [kind, setKind] = useState('Family');
  const [when, setWhen] = useState(days[2]);
  const [entry, setEntry] = useState('One entry');
  const pass = { name: name.trim() || 'Visitor', kind, when, entry };
  const first = pass.name.split(' (')[0];
  const { step, next } = useSteps(2, [3200, 3000]);

  const create = () => next();
  const saved = useRef(false); // save the pass once, even if the screen re-renders
  useEffect(() => { if (step === 1 && !saved.current) { saved.current = true; addVisitor(pass); } }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const cancel = () =>
    Alert.alert('Cancel this pass?', `${first} will not be let in with it.`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel pass', style: 'destructive', onPress: () => { const v = visitors.find((x) => x.name === pass.name && x.when === when); if (v) removeVisitor(v.id); goBack(); } },
    ]);

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label={step === 0 ? 'New visitor pass' : 'Pass ready'} on />
      </Row>

      {step === 0 ? (
        <>
          <T size={28} weight="light">Who's coming?</T>
          <Glass>
            <T size={11} soft>Visitor name</T>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={t.soft}
              style={{ color: t.text, fontFamily: 'Urbanist_400Regular', fontSize: 18, paddingVertical: 2 }}
            />
          </Glass>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {['Family', 'Friend', 'Delivery', 'Other'].map((k) => <Chip key={k} label={k} on={k === kind} onPress={() => setKind(k)} />)}
          </Row>
          <T size={11} soft>When</T>
          <Row gap={6} style={{ flexWrap: 'wrap' }}>
            {days.map((d) => <Chip key={d} label={d} on={d === when} onPress={() => setWhen(d)} />)}
          </Row>
          <Row gap={6}>
            {['One entry', 'Multiple'].map((e) => <Chip key={e} label={e} on={e === entry} onPress={() => setEntry(e)} />)}
          </Row>
          <Btn label="Create pass" icon="qrcode" onPress={create} />
        </>
      ) : (
        <>
          <View>
            <T size={28} weight="light">{first} · {kind.toLowerCase()}</T>
            <T size={13} soft>{when} · {entry.toLowerCase()} · No. 12</T>
          </View>
          <Glass pad={18}>
            <QrPattern seed={19} />
            <T size={12} soft style={{ textAlign: 'center', marginTop: 12 }}>Works only at your gate, only in this time window</T>
          </Glass>
          <Row gap={8}>
            <Btn label="Share link" icon="share-variant-outline" style={{ flex: 1 }} onPress={() => shareText(passMessage(pass))} />
            <View style={{ flex: 1 }}><Btn label="Cancel pass" ghost onPress={cancel} /></View>
          </Row>
          <Glass wash={t.accentWash}>
            <T size={13}>The guard sees {first}'s pass at the gate. You get a note when they enter.</T>
          </Glass>
        </>
      )}
    </Screen>
  );
}
