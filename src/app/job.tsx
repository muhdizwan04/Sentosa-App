import { router } from 'expo-router';
import { goBack } from '@/components/actions';
import { View } from 'react-native';
import { Avatar, Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { jobStages, useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

export default function JobScreen() {
  const t = useTheme();
  const { job } = useStore();

  if (!job) {
    return (
      <Screen tabBar={false}>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <T size={20}>No job booked yet</T>
      </Screen>
    );
  }

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label={`Job #${job.id}`} on />
      </Row>

      <View>
        <T size={28} weight="light">{job.jobName}</T>
        <T size={13} soft>{job.company.name} · {job.slot}</T>
      </View>

      <Glass wash={t.accentWash}>
        <Row gap={10}>
          <Icon name="check-decagram-outline" size={22} color={t.accentText} />
          <View style={{ flex: 1 }}>
            <T size={15} weight="medium">Booked</T>
            <T size={12} soft>Gate pass created for this job only</T>
          </View>
        </Row>
      </Glass>

      <Glass>
        <View style={{ gap: 12 }}>
          {jobStages.map((s, i) => {
            const done = i <= job.stage;
            return (
              <Row key={s} gap={12}>
                <View
                  style={{
                    width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: done ? t.solid : 'transparent',
                    borderWidth: done ? 0 : 1, borderStyle: 'dashed', borderColor: t.soft,
                  }}>
                  {done ? <Icon name="check" size={14} color={t.onSolid} /> : null}
                </View>
                <T size={14} soft={!done}>{s}</T>
              </Row>
            );
          })}
        </View>
      </Glass>

      <Glass>
        <Row gap={12}>
          <Avatar initials={job.company.workerInitials} />
          <View style={{ flex: 1 }}>
            <T size={14}>{job.company.worker} · {job.company.name.split(' ')[0]}</T>
            <T size={12} soft>You'll see when the guard scans the pass</T>
          </View>
          <IconButton icon="message-outline" label="Message company" onPress={() => router.push('/chat')} />
        </Row>
      </Glass>

      <Btn label="Show gate pass" icon="qrcode" onPress={() => router.navigate('/pass')} />
      <Btn label="Back to home" ghost onPress={() => router.navigate('/')} />
    </Screen>
  );
}
