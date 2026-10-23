import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { closeAll, goBack, shareText } from '@/components/actions';
import { QrPattern } from '@/components/gauges';
import { Room } from '@/components/room';
import { Btn, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { home, renoItems, renoStages, renoStyles } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Booked renovation: pay stage by stage after photos; the crew gets a gate pass for job days only.
export default function ProjectScreen() {
  const t = useTheme();
  const { auto } = useLocalSearchParams<{ auto?: string }>();
  const { reno, approveStage } = useStore();
  const [showQr, setShowQr] = useState(false);

  if (!reno) {
    return (
      <Screen tabBar={false}>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <T size={26} weight="light">No renovation yet</T>
        <T size={15} soft>Snap a space to see your idea and find a trusted contractor.</T>
        <Btn label="Snap a space" icon="camera-outline" onPress={() => router.replace('/renovate/snap')} />
      </Screen>
    );
  }

  const item = renoItems.find((i) => i.id === reno.item) ?? renoItems[0];
  const style = renoStyles.find((s) => s.id === reno.style) ?? renoStyles[0];
  const done = reno.approved >= renoStages.length;
  const next = renoStages[reno.approved];
  const amount = (share: number) => `RM ${Math.round((reno.price * share) / 100).toLocaleString('en-MY')}`;
  const crewText = `Sentosa crew pass · ${reno.pro.name}\n${reno.pro.crew} people · lead ${reno.pro.lead}\n${home.address} · Gate A\nMon–Tue · 9 am–6 pm · job #${reno.id} (demo)`;

  const approve = () => {
    if (auto) return approveStage(); // tours approve without the pop-up
    Alert.alert(`Approve "${next.name}"?`, `${amount(next.share)} is released to ${reno.pro.name}.`, [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Approve', onPress: approveStage },
    ]);
  };

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <View style={{ flex: 1 }}>
          <T size={12} soft>{reno.pro.name} · job #{reno.id}</T>
          <T size={17} weight="medium">{item.name}</T>
        </View>
      </Row>

      <Room item={item.id} style={style.id} after height={210} />
      <T size={13} soft style={{ marginTop: -6 }}>{style.name} · {item.sizes[reno.size].toLowerCase()} · RM {reno.price.toLocaleString('en-MY')}* fixed</T>

      {done ? (
        <Glass pad={18} wash={t.accentWash}>
          <Row gap={12}>
            <Icon name="check-decagram" size={30} color={t.accentText} />
            <View style={{ flex: 1 }}>
              <T size={19} weight="medium">Done · saved to your Home Record</T>
              <T size={13} soft>Warranty 12 months · all 4 stages approved by you</T>
            </View>
          </Row>
          <Btn label="See Home Record" onPress={() => { closeAll(); router.navigate('/fix'); }} style={{ marginTop: 14 }} />
        </Glass>
      ) : (
        <Glass pad={16} wash={t.accentWash}>
          <Row gap={12}>
            <Icon name={reno.approved === 0 ? 'calendar-check-outline' : 'camera-outline'} size={26} color={t.accentText} />
            <View style={{ flex: 1 }}>
              <T size={13} soft>Next · stage {reno.approved + 1} of {renoStages.length}</T>
              <T size={17} weight="medium">{reno.approved === 0 ? `Site visit ${reno.pro.earliest}, 10 am` : `${next.name}: photos are ready`}</T>
            </View>
          </Row>
          <Btn label={`${reno.approved === 0 ? 'Site visit done' : 'Approve photos'} · release ${amount(next.share)}`} icon="check" onPress={approve} style={{ marginTop: 14 }} />
        </Glass>
      )}

      <Glass pad={16}>
        <View style={{ gap: 12 }}>
          {renoStages.map((s, i) => {
            const ok = i < reno.approved;
            const now = i === reno.approved;
            return (
              <Row key={s.name} gap={12}>
                <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: ok ? t.solid : 'transparent', borderWidth: ok ? 0 : 1.5, borderStyle: now ? 'solid' : 'dashed', borderColor: now ? t.accentText : t.soft }}>
                  {ok ? <Icon name="check" size={16} color={t.onSolid} /> : <T size={12} soft>{i + 1}</T>}
                </View>
                <T size={15} soft={!ok && !now} weight={now ? 'medium' : 'regular'} style={{ flex: 1 }}>{s.name}</T>
                <T size={13} soft>{s.share}% · {amount(s.share)}</T>
              </Row>
            );
          })}
        </View>
      </Glass>

      {!done && (
        <Glass pad={16} onPress={() => setShowQr((v) => !v)}>
          <Row gap={12}>
            <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="qrcode" size={32} color="#0b1530" />
            </View>
            <View style={{ flex: 1 }}>
              <T size={13} soft>Crew gate pass · sent automatically</T>
              <T size={16} weight="medium">{reno.pro.name.split(' ')[0]} crew · {reno.pro.crew} people</T>
              <T size={13} soft>Mon–Tue · 9 am–6 pm · No. 12 only</T>
            </View>
            <Icon name={showQr ? 'chevron-up' : 'chevron-down'} size={22} color={t.soft} />
          </Row>
          {showQr && (
            <View style={{ marginTop: 14, gap: 10 }}>
              <QrPattern seed={31} />
              <Btn label="Share crew pass" icon="share-variant-outline" onPress={() => shareText(crewText)} />
            </View>
          )}
        </Glass>
      )}
      <T size={12} soft style={{ textAlign: 'center' }}>Each stage is paid only after you approve its photos. *Demo price</T>
    </Screen>
  );
}
