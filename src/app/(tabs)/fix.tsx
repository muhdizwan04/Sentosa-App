import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { shareRecord } from '@/components/actions';
import { Btn, Glass, Icon, Row, Screen, Solid, T } from '@/components/ui';
import { renoItems, renoStages } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Renovate tab: big projects (see it first, trusted contractors) and small repairs (Snap & Report), plus the Home Record.
export default function RenovateScreen() {
  const t = useTheme();
  const { job, history, reno, setDraft } = useStore();
  const start = (item?: (typeof renoItems)[number]['id']) => { if (item) setDraft({ item }); router.push('/renovate/snap'); };

  return (
    <Screen>
      <View>
        <T size={30} weight="light">Renovate</T>
        <T size={15} soft>See it before you build it</T>
      </View>

      <Solid onPress={() => start()}>
        <Icon name="camera-outline" size={28} color={t.onSolid} />
        <T size={20} weight="semibold" color={t.onSolid} style={{ marginTop: 14 }}>Snap a space</T>
        <T size={14} color={t.onSolidSoft}>Photo of an empty corner or wall → see your idea in it</T>
      </Solid>

      <T size={15} soft>What do you want to add?</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {renoItems.map((i) => (
          <Pressable key={i.id} onPress={() => start(i.id)} accessibilityLabel={i.short} style={{ width: '48.4%' }}>
            <Glass pad={16}>
              <Icon name={i.icon} size={26} />
              <T size={16} weight="medium" style={{ marginTop: 12 }}>{i.short}</T>
              <T size={13} soft>From RM {i.from.toLocaleString('en-MY')}*</T>
            </Glass>
          </Pressable>
        ))}
      </View>

      {reno && (
        <>
          <T size={15} soft style={{ marginTop: 4 }}>My renovation</T>
          <Glass pad={16} wash={t.accentWash} onPress={() => router.push('/renovate/project')}>
            <Row gap={12}>
              <Icon name={renoItems.find((i) => i.id === reno.item)?.icon ?? 'hammer'} size={26} color={t.accentText} />
              <View style={{ flex: 1 }}>
                <T size={16} weight="medium">{renoItems.find((i) => i.id === reno.item)?.name}</T>
                <T size={13} soft>{reno.pro.name} · {reno.approved}/{renoStages.length} stages approved</T>
              </View>
              <Icon name="chevron-right" size={24} color={t.soft} />
            </Row>
          </Glass>
        </>
      )}

      <T size={15} soft style={{ marginTop: 4 }}>Small repairs</T>
      <Glass pad={16} onPress={() => router.push('/report')}>
        <Row gap={12}>
          <Icon name="wrench-outline" size={24} />
          <View style={{ flex: 1 }}>
            <T size={16} weight="medium">Snap and report</T>
            <T size={13} soft>Crack, leak, broken tile · fixed-price repair</T>
          </View>
          <Icon name="chevron-right" size={24} color={t.soft} />
        </Row>
      </Glass>
      {job && (
        <Glass pad={16} onPress={() => router.push('/job')}>
          <Row gap={12}>
            <Icon name="progress-wrench" size={24} color={t.accentText} />
            <View style={{ flex: 1 }}>
              <T size={16} weight="medium">{job.jobName}</T>
              <T size={13} soft>{job.company.name} · {job.slot}</T>
            </View>
            <Icon name="chevron-right" size={24} color={t.soft} />
          </Row>
        </Glass>
      )}

      <T size={15} soft style={{ marginTop: 4 }}>Home Health Record</T>
      <Glass pad={16}>
        <View style={{ gap: 12 }}>
          {history.map((f) => (
            <Row key={f.date + f.what} gap={12}>
              <T size={13} soft style={{ width: 50 }}>{f.date}</T>
              <View style={{ flex: 1 }}>
                <T size={15} weight={f.fresh ? 'medium' : 'regular'} color={f.fresh ? t.accentText : undefined}>{f.what}</T>
                <T size={13} soft>{f.who} · {f.price}</T>
              </View>
            </Row>
          ))}
        </View>
      </Glass>
      <Btn label="Export for buyer or insurer" ghost icon="file-document-outline" onPress={() => shareRecord(history)} />
    </Screen>
  );
}
