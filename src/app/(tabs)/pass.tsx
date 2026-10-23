import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { passMessage, shareText } from '@/components/actions';
import { QrPattern } from '@/components/gauges';
import { Avatar, Btn, Chip, Glass, Icon, Row, Screen, T } from '@/components/ui';
import { home } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

export default function PassScreen() {
  const t = useTheme();
  const { job, visitors, cancelJob, removeVisitor, reno } = useStore();
  const crewOn = !!reno && reno.approved < 4;
  const [tab, setTab] = useState<'job' | 'visitors'>(job ? 'job' : 'visitors');
  const [open, setOpen] = useState<string | null>(null);
  const confirmCancelJob = () =>
    Alert.alert('Cancel this booking?', 'The gate pass stops working and the company is told. The alert stays open until it is fixed.', [
      { text: 'Keep booking', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: cancelJob },
    ]);
  useEffect(() => { setTab(job ? 'job' : 'visitors'); }, [job]);

  return (
    <Screen>
      <Row>
        <Chip label="Job pass" on={tab === 'job'} onPress={() => setTab('job')} />
        <Chip label="Visitors" on={tab === 'visitors'} onPress={() => setTab('visitors')} />
      </Row>

      {tab === 'job' && job ? (
        <>
          <View>
            <T size={28} weight="light">{job.company.name.replace(' Sdn Bhd', '')}</T>
            <T size={13} soft>Job #{job.id} · {job.jobName.toLowerCase()}</T>
          </View>
          <Glass pad={18}>
            <QrPattern />
            <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
              <View>
                <T size={11} soft>Valid</T>
                <T size={14}>{job.slot}</T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T size={11} soft>Entry</T>
                <T size={14}>One time · {home.address.split(',')[0]}</T>
              </View>
            </Row>
          </Glass>
          <Glass>
            <Row gap={12}>
              <Avatar initials={job.company.workerInitials} />
              <View style={{ flex: 1 }}>
                <T size={14}>{job.company.worker}</T>
                <T size={12} soft>Worker · ID checked by company</T>
              </View>
              <Icon name="check-decagram-outline" size={22} color={t.accentText} />
            </Row>
          </Glass>
          <Row gap={8}>
            <Btn label="Share" icon="share-variant-outline" style={{ flex: 1 }}
              onPress={() => shareText(`Sentosa job pass #${job.id}\n${job.company.name} · ${job.company.worker}\n${home.address} · Gate A\n${job.slot} · one entry (demo)`)} />
            <View style={{ flex: 1 }}><Btn label="Cancel" ghost onPress={confirmCancelJob} /></View>
          </Row>
        </>
      ) : tab === 'job' ? (
        <Glass>
          <Row gap={12}>
            <Icon name="qrcode" size={26} color={t.soft} />
            <View style={{ flex: 1 }}>
              <T size={15} weight="medium">No job pass yet</T>
              <T size={12} soft>When you book a fix, the company gets a pass for that job only.</T>
            </View>
          </Row>
        </Glass>
      ) : (
        <>
          <View>
            <T size={28} weight="light">Visitors</T>
            <T size={13} soft>Make a pass for family, friends or deliveries</T>
          </View>
          {crewOn && (
            <Glass onPress={() => setOpen(open === 'crew' ? null : 'crew')} wash={t.accentWash}>
              <Row gap={12}>
                <Avatar initials={reno!.pro.name.slice(0, 2).toUpperCase()} />
                <View style={{ flex: 1 }}>
                  <T size={14}>{reno!.pro.name} · renovation crew</T>
                  <T size={12} soft>Mon–Tue · 9 am–6 pm · {reno!.pro.crew} people</T>
                </View>
                <Icon name={open === 'crew' ? 'chevron-up' : 'qrcode'} color={t.soft} />
              </Row>
              {open === 'crew' && (
                <View style={{ marginTop: 14, gap: 10 }}>
                  <QrPattern seed={31} />
                  <Btn label="See the renovation" ghost onPress={() => router.push('/renovate/project')} />
                </View>
              )}
            </Glass>
          )}
          {visitors.map((v) => (
            <Glass key={v.id} onPress={() => setOpen(open === v.id ? null : v.id)} wash={open === v.id ? t.accentWash : undefined}>
              <Row gap={12}>
                <Avatar initials={v.name.slice(0, 2).toUpperCase()} />
                <View style={{ flex: 1 }}>
                  <T size={14}>{v.name} · {v.kind.toLowerCase()}</T>
                  <T size={12} soft>{v.when} · {v.entry.toLowerCase()}</T>
                </View>
                <Icon name={open === v.id ? 'chevron-up' : 'qrcode'} color={t.soft} />
              </Row>
              {open === v.id && (
                <View style={{ marginTop: 14, gap: 10 }}>
                  <QrPattern seed={19} />
                  <Row gap={8}>
                    <Btn label="Share" icon="share-variant-outline" style={{ flex: 1 }} onPress={() => shareText(passMessage(v))} />
                    <View style={{ flex: 1 }}>
                      <Btn label="Cancel pass" ghost onPress={() => Alert.alert('Cancel this pass?', `${v.name} will not be let in with it.`, [
                        { text: 'Keep', style: 'cancel' },
                        { text: 'Cancel pass', style: 'destructive', onPress: () => removeVisitor(v.id) },
                      ])} />
                    </View>
                  </Row>
                </View>
              )}
            </Glass>
          ))}
          <Btn label="New visitor pass" icon="plus" onPress={() => router.push('/visitor')} />
          <Btn label="Gate log" ghost onPress={() => router.push('/guard')} />
        </>
      )}
    </Screen>
  );
}
