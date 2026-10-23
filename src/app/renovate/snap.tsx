import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { Viewfinder } from '@/components/photos';
import { Room } from '@/components/room';
import { Chip, Glass, IconButton, Row, Screen, T } from '@/components/ui';
import { renoItems } from '@/data/demo';
import { useStore } from '@/data/store';

// Step 1 of Renovate: photograph the empty space. The demo uses our own drawn sample rooms (no real home photos).
export default function SnapScreen() {
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const { draft, setDraft } = useStore();
  const [taken, setTaken] = useState(false);
  const flash = useRef(new Animated.Value(0)).current;
  const item = renoItems.find((i) => i.id === draft.item) ?? renoItems[0];

  const snap = () => {
    if (taken) return;
    setTaken(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
    // The tour moves on by itself; a person goes straight to the next step.
    if (!auto) setTimeout(() => router.push('/renovate/design'), 650);
  };
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(snap, 2400);
    return () => clearTimeout(id);
  }, [auto]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <View>
          <T size={12} soft>Renovate · step 1 of 4</T>
          <T size={17} weight="medium">Snap a space</T>
        </View>
      </Row>

      <Viewfinder height={280} scanning={false}>
        <Room item={item.id} height={280} radius={0} />
        <View style={{ position: 'absolute', bottom: 18, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 99 }}>
          <T size={13} color="#fff">{taken ? 'Got it ✓' : 'Fit the whole wall in the frame'}</T>
        </View>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#fff', opacity: flash }} />
      </Viewfinder>

      <Glass pad={12}>
        <T size={13} soft style={{ marginBottom: 8 }}>Sample rooms for the demo</T>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {renoItems.map((i) => (
            <Chip key={i.id} label={i.room.split(' · ')[0]} on={i.id === draft.item} onPress={() => { setTaken(false); setDraft({ item: i.id }); }} />
          ))}
        </ScrollView>
      </Glass>

      <Pressable onPress={snap} accessibilityLabel="Take photo" style={({ pressed }) => ({ alignSelf: 'center', width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
        <View style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff' }} />
      </Pressable>
      <T size={13} soft style={{ textAlign: 'center' }}>{item.room}</T>
    </Screen>
  );
}
