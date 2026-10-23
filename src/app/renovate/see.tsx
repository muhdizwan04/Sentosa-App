import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, PanResponder, Pressable, View } from 'react-native';
import { Room } from '@/components/room';
import { Btn, Glass, IconButton, Row, Screen, T } from '@/components/ui';
import { renoItems, renoStyles, type RenoStyle } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

const H = 270;

// Step 3: see the new furniture in your own space before paying anyone. Drag the slider: left = now, right = after.
export default function SeeScreen() {
  const t = useTheme();
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const { draft, setDraft } = useStore();
  const item = renoItems.find((i) => i.id === draft.item) ?? renoItems[0];
  const [ready, setReady] = useState(false);
  const [w, setW] = useState(0);
  const [pos, setPos] = useState(0.92); // share of the picture still showing "before"
  const wRef = useRef(0);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => wRef.current && setPos(Math.min(1, Math.max(0, e.nativeEvent.locationX / wRef.current))),
    onPanResponderMove: (e) => wRef.current && setPos(Math.min(1, Math.max(0, e.nativeEvent.locationX / wRef.current))),
    onPanResponderTerminationRequest: () => false,
  })).current;

  // "Drawing" for a moment, then sweep the slider to reveal the new look.
  useEffect(() => {
    const a = setTimeout(() => setReady(true), 1600);
    return () => clearTimeout(a);
  }, []);
  useEffect(() => {
    if (!ready) return;
    let p = 0.92;
    const id = setInterval(() => { p -= 0.03; setPos(Math.max(0.35, p)); if (p <= 0.35) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [ready]);
  // Tour: try two colours, then settle on light oak.
  useEffect(() => {
    if (!auto) return;
    const steps: [number, RenoStyle][] = [[4200, 'white'], [5600, 'walnut'], [7000, 'oak']];
    const ids = steps.map(([ms, s]) => setTimeout(() => setDraft({ style: s }), ms));
    return () => ids.forEach(clearTimeout);
  }, [auto]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <View style={{ flex: 1 }}>
          <T size={12} soft>Renovate · step 3 of 4</T>
          <T size={17} weight="medium">Your space, with a {item.short.toLowerCase().split(' /')[0]}</T>
        </View>
      </Row>

      <View
        onLayout={(e) => { setW(e.nativeEvent.layout.width); wRef.current = e.nativeEvent.layout.width; }}
        style={{ height: H, borderRadius: 22, overflow: 'hidden' }}
        {...(ready ? pan.panHandlers : {})}>
        <Room item={item.id} style={draft.style} after={ready} height={H} radius={0} />
        {ready && w > 0 && (
          <>
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: w * pos, overflow: 'hidden' }}>
              <View style={{ width: w }}><Room item={item.id} height={H} radius={0} /></View>
            </View>
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: w * pos - 1.5, width: 3, backgroundColor: '#fff' }} />
            <View pointerEvents="none" style={{ position: 'absolute', top: H / 2 - 20, left: w * pos - 20, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <T size={16} weight="semibold" color="#0b1530">⇆</T>
            </View>
            <Tag text="Now" style={{ left: 10 }} />
            <Tag text="After" style={{ right: 10 }} />
          </>
        )}
        {!ready && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4,7,13,0.55)', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <ActivityIndicator color="#fff" />
            <T size={15} color="#fff">Drawing your {item.short.toLowerCase().split(' /')[0]}…</T>
          </View>
        )}
      </View>
      <T size={12} soft style={{ marginTop: -4, textAlign: 'center' }}>Drag the slider · concept picture, final design after the site visit</T>

      <Row gap={8}>
        {renoStyles.slice(0, 3).map((s) => {
          const on = s.id === draft.style;
          return (
            <Pressable key={s.id} onPress={() => setDraft({ style: s.id })} style={{ flex: 1 }} accessibilityLabel={s.name}>
              <View style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 2.5, borderColor: on ? t.accentText : 'transparent' }}>
                <Room item={item.id} style={s.id} after height={70} radius={0} />
              </View>
              <T size={13} weight={on ? 'semibold' : 'regular'} soft={!on} style={{ textAlign: 'center', marginTop: 4 }}>{s.name}</T>
            </Pressable>
          );
        })}
      </Row>

      <Glass pad={16}>
        <T size={13} soft>Estimated price · {item.sizes[draft.size].toLowerCase()}</T>
        <T size={24} weight="medium">RM {item.from.toLocaleString('en-MY')} – {item.to.toLocaleString('en-MY')}*</T>
        <T size={12} soft>Fixed package from the contractor after measuring · *demo prices</T>
      </Glass>

      <Btn label="Find contractors who can build this" icon="account-hard-hat-outline" onPress={() => router.push('/renovate/pros')} />
    </Screen>
  );
}

function Tag({ text, style }: { text: string; style: object }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', top: 10, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 99 }, style]}>
      <T size={12} color="#fff">{text}</T>
    </View>
  );
}
