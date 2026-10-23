import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { Room } from '@/components/room';
import { Btn, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { renoItems, renoStyles } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Step 2: what to add, which colour, how big. Big choices, few words.
export default function DesignScreen() {
  const t = useTheme();
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const { draft, setDraft } = useStore();
  const item = renoItems.find((i) => i.id === draft.item) ?? renoItems[0];

  // Tour: show the size being adjusted, like a person would.
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => setDraft({ size: 1 }), 1800);
    return () => clearTimeout(id);
  }, [auto]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <View>
          <T size={12} soft>Renovate · step 2 of 4</T>
          <T size={17} weight="medium">What do you want here?</T>
        </View>
      </Row>

      <Glass pad={10} onPress={goBack}>
        <Row gap={12}>
          <View style={{ width: 132 }}><Room item={item.id} height={92} radius={12} /></View>
          <View style={{ flex: 1 }}>
            <T size={15} weight="medium">Your photo</T>
            <T size={13} soft>{item.room}</T>
            <T size={13} color={t.accentText} style={{ marginTop: 4 }}>Retake</T>
          </View>
        </Row>
      </Glass>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {renoItems.map((i) => {
          const on = i.id === draft.item;
          return (
            <Pressable key={i.id} onPress={() => setDraft({ item: i.id })} accessibilityLabel={i.short} style={{ width: '48.5%' }}>
              <Glass pad={14} wash={on ? t.accentWash : undefined}>
                <Row gap={10}>
                  <Icon name={i.icon} size={24} color={on ? t.accentText : t.text} />
                  <T size={15} weight={on ? 'semibold' : 'regular'} style={{ flex: 1 }}>{i.short}</T>
                  {on && <Icon name="check-circle" size={20} color={t.accentText} />}
                </Row>
              </Glass>
            </Pressable>
          );
        })}
      </View>

      <T size={14} soft>Colour</T>
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        {renoStyles.map((s) => {
          const on = s.id === draft.style;
          return (
            <Pressable key={s.id} onPress={() => setDraft({ style: s.id })} accessibilityLabel={s.name}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 99, backgroundColor: on ? t.solid : t.glass2 }}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: s.color, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' }} />
              <T size={14} weight={on ? 'semibold' : 'regular'} color={on ? t.onSolid : t.text}>{s.name}</T>
            </Pressable>
          );
        })}
      </Row>

      <Glass pad={16}>
        <Row gap={10}>
          <View style={{ flex: 1 }}>
            <T size={13} soft>Size (read from your photo)</T>
            <T size={17} weight="medium">{item.sizes[draft.size]}</T>
          </View>
          <Pressable onPress={() => setDraft({ size: (draft.size + 1) % item.sizes.length })} style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, backgroundColor: t.glass2 }}>
            <T size={14}>Change</T>
          </Pressable>
        </Row>
        <T size={12} soft style={{ marginTop: 6 }}>The contractor measures exactly at the free site visit.</T>
      </Glass>

      <Btn label="See it in my room" icon="image-outline" onPress={() => router.push('/renovate/see')} />
    </Screen>
  );
}
