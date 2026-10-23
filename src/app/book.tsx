import { router, useLocalSearchParams } from 'expo-router';
import { goBack } from '@/components/actions';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Avatar, Btn, Chip, Glass, Icon, IconButton, Row, Screen, Solid, T } from '@/components/ui';
import { companies, hazardConfig, home, timeSlots, type HazardKey } from '@/data/demo';
import { useConfig, useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

const tradeName: Record<string, string> = { plumbing: 'plumbers', electrical: 'licensed electricians', gas: 'gas technicians', general: 'repair companies' };
// Problems found by Snap & Report have no sensor, so they bring their own job and price.
const reported: Record<string, { job: string; price: number; trade: string; after: string }> = {
  crack: { job: 'Repair wall crack', price: 250, trade: 'general', after: 'Snap & Report · hairline crack' },
};

export default function BookScreen() {
  const t = useTheme();
  const { hazard, auto, repair } = useLocalSearchParams<{ hazard?: HazardKey; auto?: string; repair?: string }>();
  const c = useConfig(hazard && hazardConfig[hazard] ? hazard : 'leak');
  const r = repair ? reported[repair] : undefined;
  const job = r ? { job: r.job, price: r.price, trade: r.trade } : c.repair;
  const hazardKey = r ? null : c.key;
  const { bookJob } = useStore();
  const list = companies.filter((x) => x.trade === job.trade);
  const [companyId, setCompanyId] = useState(list[0].id);
  const [slot, setSlot] = useState(timeSlots[0]);
  const company = list.find((x) => x.id === companyId) ?? list[0];

  // Auto tour: confirm the booking by itself after `auto` ms.
  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      bookJob(hazardKey, company.id, slot, r);
      router.replace('/job');
    }, Number(auto));
    return () => clearTimeout(id);
  }, [auto]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label="Book a fix" on />
      </Row>

      <View>
        <T size={28} weight="light">{job.job}</T>
        <T size={13} soft>{home.houseType} · {r ? r.after : `after ${c.alarm.title.toLowerCase()}`}</T>
      </View>

      <Solid>
        <T size={12} color={t.onSolidSoft}>Fixed price</T>
        <T size={34} weight="light" color={t.onSolid}>RM{job.price}*</T>
        <T size={12} color={t.onSolidSoft}>Extra cost only with your approval in the app</T>
      </Solid>

      <T size={13} soft style={{ marginTop: 4 }}>Verified {tradeName[job.trade]} · rated by your estate</T>
      {list.map((x) => {
        const on = x.id === companyId;
        return (
          <Glass key={x.id} onPress={() => setCompanyId(x.id)} wash={on ? t.accentWash : undefined}>
            <Row gap={12}>
              <Avatar initials={x.name.slice(0, 2).toUpperCase()} />
              <View style={{ flex: 1 }}>
                <T size={15} weight="medium">{x.name}</T>
                <T size={12} soft>{x.rating}★ · {x.neighbours} neighbours · SSM ✓</T>
              </View>
              <Icon name={on ? 'check-circle' : 'circle-outline'} size={22} color={on ? t.accentText : t.soft} />
            </Row>
          </Glass>
        );
      })}

      <T size={13} soft style={{ marginTop: 4 }}>Time</T>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {timeSlots.map((s) => (
          <Chip key={s} label={s} on={s === slot} onPress={() => setSlot(s)} />
        ))}
      </Row>

      <Glass>
        <Row gap={12}>
          <Avatar initials={company.workerInitials} />
          <View style={{ flex: 1 }}>
            <T size={14}>{company.worker}</T>
            <T size={12} soft>Worker · ID checked by company</T>
          </View>
          <Icon name="qrcode" size={20} color={t.soft} />
        </Row>
        <T size={12} soft style={{ marginTop: 10 }}>A gate pass for this job only is created automatically.</T>
      </Glass>

      <Btn
        label="Confirm booking"
        onPress={() => {
          bookJob(hazardKey, company.id, slot, r);
          router.replace('/job');
        }}
      />
      <T size={11} soft style={{ textAlign: 'center' }}>*Illustrative price · demo companies</T>
    </Screen>
  );
}
