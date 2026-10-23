import { router, useLocalSearchParams } from 'expo-router';
import { closeAll, goBack } from '@/components/actions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Room } from '@/components/room';
import { Avatar, Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { renoItems, renoPrice, renoPros, renoStyles } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

const sorts = ['Best rated', 'Lowest price', 'Earliest'] as const;
const dayNo = (d: string) => Number(d.split(' ')[1]) + (d.includes('Nov') ? 100 : 0);

// Step 4: only CIDB-registered companies, rated by neighbours, who have built the same thing in this estate.
export default function ProsScreen() {
  const t = useTheme();
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const { draft, bookReno } = useStore();
  const item = renoItems.find((i) => i.id === draft.item) ?? renoItems[0];
  const style = renoStyles.find((s) => s.id === draft.style) ?? renoStyles[0];
  const [sort, setSort] = useState<(typeof sorts)[number]>('Best rated');
  const [pick, setPick] = useState(renoPros[0].id);

  const list = [...renoPros].sort((a, b) =>
    sort === 'Best rated' ? b.rating - a.rating : sort === 'Lowest price' ? a.factor - b.factor : dayNo(a.earliest) - dayNo(b.earliest));
  const chosen = renoPros.find((p) => p.id === pick)!;

  const book = () => { bookReno(chosen.id); closeAll(); router.push('/renovate/project'); };

  // Tour: glance at the cheapest, go back to best rated, keep XYZ.
  useEffect(() => {
    if (!auto) return;
    const a = setTimeout(() => setSort('Lowest price'), 1500);
    const b = setTimeout(() => setSort('Best rated'), 3200);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [auto]);

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <View style={{ flex: 1 }}>
          <T size={12} soft>Renovate · step 4 of 4</T>
          <T size={17} weight="medium">{renoPros.length} trusted companies can build this</T>
        </View>
      </Row>

      <Glass pad={10}>
        <Row gap={12}>
          <View style={{ width: 86 }}><Room item={item.id} style={style.id} after height={60} radius={12} /></View>
          <View style={{ flex: 1 }}>
            <T size={15} weight="medium">{item.name}</T>
            <T size={13} soft>{style.name} · {item.sizes[draft.size].toLowerCase()}</T>
          </View>
        </Row>
      </Glass>

      <Row gap={6}>{sorts.map((s) => <Chip key={s} label={s} on={s === sort} onPress={() => setSort(s)} />)}</Row>

      {list.map((p) => {
        const on = p.id === pick;
        return (
          <Glass key={p.id} pad={16} wash={on ? t.accentWash : undefined} onPress={() => setPick(p.id)}>
            <Row gap={12}>
              <Avatar initials={p.name.slice(0, 2).toUpperCase()} size={44} />
              <View style={{ flex: 1 }}>
                <T size={16} weight="semibold">{p.name}</T>
                <Row gap={4}>
                  <Icon name="star" size={14} color="#f5c451" />
                  <T size={13} soft>{p.rating} · CIDB ✓ · {p.jobs} similar jobs in Elmina</T>
                </Row>
              </View>
              <Icon name={on ? 'check-circle' : 'circle-outline'} size={24} color={on ? t.accentText : t.soft} />
            </Row>
            <Row style={{ marginTop: 10 }}>
              <T size={20} weight="medium" style={{ flex: 1 }}>RM {renoPrice(item.id, p).toLocaleString('en-MY')}*</T>
              <T size={13} soft>Earliest {p.earliest}</T>
            </Row>
          </Glass>
        );
      })}

      <Btn label={`Book free site visit · ${chosen.name.split(' ')[0]}`} icon="calendar-check-outline" onPress={book} />
      <T size={12} soft style={{ textAlign: 'center' }}>No payment now. You pay stage by stage, only after you approve photos. *Demo prices</T>
    </Screen>
  );
}
