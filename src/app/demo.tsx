import { router } from 'expo-router';
import { goBack } from '@/components/actions';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { hazardList, variantsFor, type HazardKey } from '@/data/demo';
import { GUARD } from '@/data/features';
import { useStore } from '@/data/store';
import { tours } from '@/data/tour';
import { useTheme } from '@/theme/theme';

// Demo controls: start any situation or self-playing tour. Guard (sensor first aid) shows only when switched on.
export default function DemoScreen() {
  const t = useTheme();
  const store = useStore();
  const { hazards, trigger, resetDemo } = store;
  // Chosen leak spot / hot device. Empty = take turns.
  const [pick, setPick] = useState<Partial<Record<HazardKey, string>>>({});

  return (
    <Screen tabBar={false}>
      <Row>
        <View style={{ flex: 1 }}>
          <T size={28} weight="light">Demo prototype</T>
          <T size={13} soft>{GUARD ? 'Pretend a sensor fired and watch Sentosa respond' : 'Start a situation, or let a tour play by itself'}</T>
        </View>
        <IconButton icon="close" label="Close" onPress={goBack} />
      </Row>

      {GUARD && hazardList.map((h) => {
        const st = hazards[h.key].status;
        const options = variantsFor[h.key];
        const title =
          h.key === 'leak' ? 'Water leak' : h.key === 'heat' ? 'Device overheating' : h.alarm.title;
        return (
          <Glass
            key={h.key}
            onPress={() => {
              trigger(h.key, pick[h.key]);
              router.replace(`/respond/${h.key}`);
            }}>
            <Row gap={12}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.glass2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={h.icon} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <T size={15} weight="medium">{title}</T>
                <T size={12} soft>
                  {st !== 'ok' ? 'Already triggered · tap to run again' : options ? (pick[h.key] ? 'Tap to simulate' : 'Tap to simulate · takes turns') : `Simulate · then ${h.action.button.toLowerCase()}`}
                </T>
              </View>
              <Icon name="play-circle-outline" size={24} color={t.accentText} />
            </Row>
            {options ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginTop: 12 }}>
                <Chip label="Take turns" on={!pick[h.key]} onPress={() => setPick((p) => ({ ...p, [h.key]: undefined }))} />
                {options.map((o) => (
                  <Chip key={o.id} label={o.label} on={pick[h.key] === o.id} onPress={() => setPick((p) => ({ ...p, [h.key]: o.id }))} />
                ))}
              </ScrollView>
            ) : null}
          </Glass>
        );
      })}

      <T size={13} soft style={{ marginTop: 6 }}>{GUARD ? 'More situations' : 'Situations'}</T>
      <Glass onPress={() => { store.setCare('missed'); router.replace('/care-alert'); }}>
        <Row gap={12}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.glass2, alignItems: 'center', justifyContent: 'center' }}><Icon name="heart-pulse" size={20} /></View>
          <View style={{ flex: 1 }}><T size={15} weight="medium">Parent: no daily signal</T><T size={12} soft>Family alert → guard check</T></View>
          <Icon name="play-circle-outline" size={24} color={t.accentText} />
        </Row>
      </Glass>
      <Glass onPress={() => router.replace('/gate-ask')}>
        <Row gap={12}>
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.glass2, alignItems: 'center', justifyContent: 'center' }}><Icon name="account-question-outline" size={20} /></View>
          <View style={{ flex: 1 }}><T size={15} weight="medium">Unbooked "officer" at the gate</T><T size={12} soft>Owner decides before entry</T></View>
          <Icon name="play-circle-outline" size={24} color={t.accentText} />
        </Row>
      </Glass>

      {!GUARD && (
        <Glass onPress={() => { store.setDraft({ item: 'wardrobe', style: 'oak', size: 0 }); router.replace('/renovate/snap'); }}>
          <Row gap={12}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.glass2, alignItems: 'center', justifyContent: 'center' }}><Icon name="wardrobe-outline" size={20} /></View>
            <View style={{ flex: 1 }}><T size={15} weight="medium">Empty corner → wardrobe</T><T size={12} soft>Snap → see it first → contractor → stages</T></View>
            <Icon name="play-circle-outline" size={24} color={t.accentText} />
          </Row>
        </Glass>
      )}

      <T size={13} soft style={{ marginTop: 6 }}>Other roles</T>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <Chip label="Guard tablet" onPress={() => router.replace('/guard')} />
        <Chip label="Crew at the gate" onPress={() => router.replace('/guard?mode=scan&who=crew')} />
        <Chip label="Scam radar (guard)" onPress={() => router.replace('/guard?mode=walkin')} />
        <Chip label="Technician app" onPress={() => router.replace('/tech')} />
        <Chip label="Owner confirms job" onPress={() => router.replace('/confirm')} />
      </Row>

      <T size={13} soft style={{ marginTop: 6 }}>Auto tours (play by themselves)</T>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {Object.entries(tours).map(([k, v]) => (
          <Chip key={k} label={v.label} onPress={() => v.run(store)} />
        ))}
      </Row>
      <Btn
        label="Reset demo"
        icon="restart"
        ghost
        onPress={() =>
          Alert.alert('Reset demo?', 'Everything goes back to the start: no visitors, no renovation, no booked jobs, Mom OK.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: () => { resetDemo(); goBack(); } },
          ])
        }
      />
      <T size={11} soft style={{ textAlign: 'center' }}>Demo only · made-up people, companies and prices</T>
    </Screen>
  );
}
