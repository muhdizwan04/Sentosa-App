import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Switch, View } from 'react-native';
import { goBack, shareText } from '@/components/actions';
import { Avatar, Btn, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care, home } from '@/data/demo';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

// Me → Family members / Notifications / Privacy and consent. Settings live in demo memory only.
export default function SettingsScreen() {
  const t = useTheme();
  const { page = 'privacy' } = useLocalSearchParams<{ page?: string }>();
  const { prefs, setPref, resetDemo } = useStore();

  const toggle = (k: string, title: string, sub: string) => (
    <Row key={k} gap={12} style={{ paddingVertical: 8 }}>
      <View style={{ flex: 1 }}>
        <T size={15}>{title}</T>
        <T size={12} soft>{sub}</T>
      </View>
      <Switch value={!!prefs[k]} onValueChange={(v) => setPref(k, v)} trackColor={{ true: '#2f5bd3' }} />
    </Row>
  );

  const title = page === 'family' ? 'Family members' : page === 'notifications' ? 'Notifications' : 'Privacy and consent';

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <T size={13} soft>Me</T>
      </Row>
      <T size={28} weight="light">{title}</T>

      {page === 'family' && (
        <>
          <Glass>
            <Row gap={12} style={{ paddingVertical: 6 }}>
              <Avatar initials={home.initials} />
              <View style={{ flex: 1 }}><T size={15}>{home.owner} (you)</T><T size={12} soft>Owner · gets every alert</T></View>
            </Row>
            {[['famNurul', 'NA', 'Nurul', 'Spouse'], ['famMom', 'MO', care.person, 'Lives at No. 21 · Care']].map(([k, ini, n, r]) => (
              <Row key={k} gap={12} style={{ paddingVertical: 6 }}>
                <Avatar initials={ini} />
                <View style={{ flex: 1 }}><T size={15}>{n}</T><T size={12} soft>{r} · {prefs[k] ? 'gets alerts' : 'no alerts'}</T></View>
                <Switch value={!!prefs[k]} onValueChange={(v) => setPref(k, v)} trackColor={{ true: '#2f5bd3' }} />
              </Row>
            ))}
          </Glass>
          <Btn label="Invite family" icon="account-plus-outline" onPress={() => shareText(`Join our home on Sentosa: ${home.address}, ${home.estate}. Ask ${home.owner} for the invite code. (demo)`)} />
          <T size={12} soft style={{ textAlign: 'center' }}>Everyone sees alerts and repairs. Only you can book and pay.</T>
        </>
      )}

      {page === 'notifications' && (
        <Glass>
          {toggle('push', 'Push alerts', 'Leak, heat, gas, hot water, roof tank')}
          {toggle('gasSound', 'Loud sound for gas', 'Plays even when the phone is on silent')}
          {toggle('careUpdates', 'Care updates', `"OK" or "check needed" for ${care.person}`)}
          {toggle('weekly', 'Weekly home summary', 'Every Sunday morning')}
        </Glass>
      )}

      {page === 'privacy' && (
        <>
          <Glass>
            <T size={13} soft style={{ marginBottom: 8 }}>What Sentosa keeps</T>
            {[
              ['check', 'Sensor readings and alerts for your home'],
              ['check', 'Bookings, gate passes and the Home Health Record'],
              ['close', 'No cameras, no microphones, no live feed'],
              ['close', 'Your location is not tracked'],
            ].map(([i, x]) => (
              <Row key={x} gap={8} style={{ marginBottom: 6 }}>
                <Icon name={i} size={16} color={i === 'check' ? t.accentText : t.soft} />
                <T size={13} style={{ flex: 1 }}>{x}</T>
              </Row>
            ))}
          </Glass>
          <Glass>
            {toggle('carePaused', `Pause Care for ${care.person}`, `Consent: ${care.consent}. ${care.person} can pause any time.`)}
          </Glass>
          <Btn
            label="Delete my data"
            icon="delete-outline"
            ghost
            onPress={() =>
              Alert.alert('Delete my data?', 'In this demo, this clears everything you did and starts fresh. Nothing is stored outside this phone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => { resetDemo(); goBack(); } },
              ])
            }
          />
          <T size={11} soft style={{ textAlign: 'center' }}>Follows Malaysia's PDPA · demo data only</T>
        </>
      )}
    </Screen>
  );
}
