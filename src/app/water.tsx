import { router } from 'expo-router';
import { goBack } from '@/components/actions';
import { useState } from 'react';
import { View } from 'react-native';
import { TempDial } from '@/components/gauges';
import { Chip, Glass, IconButton, Row, Screen, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

const modes = {
  Normal: { warn: 43, cut: 49 },
  Child: { warn: 38, cut: 40 },
  Elderly: { warn: 38, cut: 40 },
} as const;
type Mode = keyof typeof modes;

export default function WaterScreen() {
  const t = useTheme();
  const [outlet, setOutlet] = useState('Shower');
  const [mode, setMode] = useState<Mode>('Normal');
  const { hazards } = useStore();
  const water = hazards.water;
  const now = Number(water.value);
  const { warn, cut } = modes[mode];
  const state =
    water.status === 'cutoff' ? 'Supply closed' : now >= cut ? 'Too hot!' : now >= warn ? 'Too hot · wait' : 'Safe';

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        {['Shower', 'Kitchen tap'].map((o) => (
          <Chip key={o} label={o} on={o === outlet} onPress={() => setOutlet(o)} />
        ))}
      </Row>

      <View style={{ alignItems: 'center' }}>
        <T size={28} weight="light">Water temperature</T>
        <T size={13} soft>Scald guard · {outlet === 'Shower' ? 'bathroom 1' : 'kitchen'}</T>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <TempDial value={now} warn={warn} cut={cut} />
        <View
          style={{
            position: 'absolute', top: 66, width: 128, height: 128, borderRadius: 64,
            backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center',
            shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 12 },
          }}>
          <T size={11} color={t.onSolidSoft}>Now</T>
          <T size={36} color={t.onSolid}>{now}°</T>
          <T size={11} color={now >= warn ? t.accent : t.onSolidSoft}>{state}</T>
        </View>
      </View>

      <Row gap={22} style={{ justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <T size={14}>Limits</T>
          <T size={12} soft>warn {warn}° · cut {cut}°</T>
        </View>
      </Row>

      <Glass>
        <T size={12} soft style={{ marginBottom: 10 }}>Who uses this {outlet === 'Shower' ? 'shower' : 'tap'}</T>
        <Row gap={6}>
          {(Object.keys(modes) as Mode[]).map((m) => (
            <Chip key={m} label={m} on={m === mode} onPress={() => setMode(m)} />
          ))}
        </Row>
        <T size={12} soft style={{ marginTop: 10 }}>
          Above {warn}° a light and beep warn. At {cut}° the supply closes until the water is safe.
        </T>
      </Glass>
    </Screen>
  );
}
