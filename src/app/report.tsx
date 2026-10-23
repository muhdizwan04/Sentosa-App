import { router } from 'expo-router';
import { goBack } from '@/components/actions';
import { ActivityIndicator, View } from 'react-native';
import { Photo, Viewfinder } from '@/components/photos';
import { useSteps } from '@/components/steps';
import { Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { useTheme } from '@/theme/theme';

// Snap & Report: photo of a problem sensors can't see → AI explains → "Me too" → fixed-price booking.
export default function ReportScreen() {
  const t = useTheme();
  const { step, next } = useSteps(4, [2600, 2000, 3600, 3400]);
  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Chip label={['Snap and report', 'Analysing', 'Result', 'Me too'][step]} on />
      </Row>

      {step === 0 && (
        <>
          <T size={28} weight="light">What's wrong?</T>
          <Viewfinder height={340} scanning={false}>
            <Photo kind="crack" height={340} />
          </Viewfinder>
          <Glass><T size={11} soft>Where?</T><T size={15}>Living room wall, near the window</T></Glass>
          <Btn label="Take photo" icon="camera-outline" onPress={next} />
        </>
      )}

      {step === 1 && (
        <>
          <T size={28} weight="light">Checking the photo…</T>
          <Photo kind="crack" height={240} />
          <Row gap={10} style={{ justifyContent: 'center', marginTop: 10 }}>
            <ActivityIndicator color={t.accentText} />
            <T size={14} soft>AI is looking at the crack</T>
          </Row>
        </>
      )}

      {step === 2 && (
        <>
          <T size={28} weight="light">Hairline crack</T>
          <Glass wash={t.accentWash}>
            <Row gap={10}><Icon name="information-outline" size={20} color={t.accentText} /><T size={15} weight="medium">Low urgency · not structural from the photo</T></Row>
            <T size={13} soft style={{ marginTop: 6 }}>Repair within 30 days. A wider or growing crack needs an engineer.</T>
          </Glass>
          <Glass><T size={12} soft>Do now</T><T size={14}>Mark both ends with a pencil to see if it grows.</T></Glass>
          <Glass><T size={12} soft>Warranty check (SDP)</T><T size={14}>Defect period ended 2025 → book a company</T></Glass>
          <Btn label="See if neighbours have it too" onPress={next} />
        </>
      )}

      {step === 3 && (
        <>
          <T size={28} weight="light">You're not alone</T>
          <Glass wash="rgba(229,72,77,0.22)">
            <T size={17} weight="medium">6 houses reported similar cracks</T>
            <T size={13} soft>Same house type · Jalan Elmina 3 · last 30 days</T>
          </Glass>
          <Glass wash={t.accentWash}>
            <Row gap={10}><Icon name="file-send-outline" size={20} color={t.accentText} /><T size={15}>Joint report #E-118 sent to Sime Darby Property</T></Row>
          </Glass>
          <Btn label="Book a fix · RM250*" onPress={() => router.replace('/book?repair=crack')} />
          <T size={11} soft style={{ textAlign: 'center' }}>*Illustrative price</T>
        </>
      )}
    </Screen>
  );
}
