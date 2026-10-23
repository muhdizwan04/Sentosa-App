import { View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { call, goBack, shareText } from '@/components/actions';
import { Btn, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { atGateNow, scamRadar, timeText } from '@/data/estate';
import { useTheme } from '@/theme/theme';

// Scam radar result: the same unbooked "officer" tried several houses, so the whole estate is warned.
export default function EstateAlertScreen() {
  const t = useTheme();
  const radar = scamRadar();
  const events = [...radar.matches, atGateNow].sort((a, b) => a.at - b.at);
  const claim = atGateNow.claim;

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <View>
          <T size={12} soft>Elmina West · all gates</T>
          <T size={17} weight="medium">Estate alert</T>
        </View>
      </Row>

      <Glass pad={18} wash="rgba(229,72,77,0.30)">
        <Row gap={12}>
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: t.danger, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="radar" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <T size={13} weight="semibold" color={t.dangerText} style={{ letterSpacing: 0.6 }}>LIKELY SCAM</T>
            <T size={20} weight="medium" style={{ lineHeight: 25 }}>Fake "{claim}"</T>
          </View>
        </Row>
        <T size={15} style={{ marginTop: 10, lineHeight: 21 }}>
          Tried {events.length} houses in {radar.spanMin} minutes. No booking at any of them.
        </T>
      </Glass>

      <Glass pad={12}>
        <EstateMap houses={events.map((e) => e.house)} />
      </Glass>

      <Glass pad={16}>
        <View style={{ gap: 12 }}>
          {events.map((e) => (
            <Row key={e.house} gap={12}>
              <T size={13} soft style={{ width: 62 }}>{timeText(e.at)}</T>
              <View style={{ flex: 1 }}>
                <T size={15} weight="medium">{e.house} · "{e.reason}"</T>
                <T size={13} soft>{e.outcome}</T>
              </View>
            </Row>
          ))}
        </View>
      </Glass>

      <Glass pad={16}>
        <T size={15} weight="medium">What to do</T>
        {['Do not open your gate or door.', 'Real water company staff come with a booking — check with the official hotline.', 'Tell the guard house if you see this person.'].map((x) => (
          <Row key={x} gap={8} style={{ marginTop: 8, alignItems: 'flex-start' }}>
            <Icon name="check" size={16} color={t.accentText} />
            <T size={14} style={{ flex: 1 }}>{x}</T>
          </Row>
        ))}
      </Glass>

      <Row gap={8}>
        <View style={{ flex: 1 }}><Btn label="Warn family" icon="share-variant-outline" onPress={() => shareText(`Sentosa estate alert · Elmina West\nSomeone claiming to be a "${claim}" (no booking) tried ${events.length} houses today (${events.map((e) => e.house).join(', ')}). Don't open the gate. (demo)`)} /></View>
        <View style={{ flex: 1 }}><Btn label="Official hotline" icon="phone-outline" ghost onPress={() => call('Water company hotline', 'Official number · checks staff ID')} /></View>
      </Row>
      <T size={11} soft style={{ textAlign: 'center' }}>
        Scam radar: same claim + no booking + several houses + short time → every gate and resident warned. Demo data.
      </T>
    </Screen>
  );
}

// Simple estate map: two streets, houses, the gate. Houses the "officer" tried are red; yours is blue.
function EstateMap({ houses }: { houses: string[] }) {
  const t = useTheme();
  const lots = (street: number, y: number) =>
    Array.from({ length: 8 }, (_, i) => {
      const no = street === 3 ? i * 2 + 2 : i * 2 + 1; // Jalan Elmina 3: even numbers · Jalan Elmina 5: odd
      return { no, x: 52 + i * 36, y };
    });
  const all = [...lots(3, 22), ...lots(5, 116)];
  return (
    <Svg width="100%" height={176} viewBox="0 0 340 176">
      <Rect x={40} y={66} width={300} height={34} rx={6} fill={t.glass2} />
      <SvgText x={190} y={88} fill={t.soft} fontSize={10} textAnchor="middle">Jalan Elmina 3 · Jalan Elmina 5</SvgText>
      <Rect x={0} y={58} width={40} height={50} rx={8} fill={t.accentWash} />
      <SvgText x={20} y={87} fill={t.accentText} fontSize={10} textAnchor="middle" fontWeight="600">Gate A</SvgText>
      <Line x1={40} y1={83} x2={52} y2={83} stroke={t.soft} strokeWidth={1} />
      {all.map((h) => {
        const label = `No. ${h.no}`;
        const hit = houses.includes(label);
        const mine = h.no === 12;
        return (
          <Rect key={label} x={h.x} y={h.y} width={28} height={36} rx={5}
            fill={hit ? t.danger : mine ? t.accent : t.glass2} stroke={mine ? '#fff' : hit ? 'none' : t.line} strokeWidth={mine ? 2.5 : 1} />
        );
      })}
      {all.map((h) => {
        const label = `No. ${h.no}`;
        const hit = houses.includes(label);
        const mine = h.no === 12;
        return (
          <SvgText key={label + 't'} x={h.x + 14} y={h.y + 22} fill={hit || mine ? '#fff' : t.soft} fontSize={10} textAnchor="middle" fontWeight={hit || mine ? '700' : '400'}>
            {h.no}
          </SvgText>
        );
      })}
      <Circle cx={190} cy={166} r={4} fill={t.danger} />
      <SvgText x={198} y={169} fill={t.soft} fontSize={10}>tried by the "officer"</SvgText>
      <Rect x={47} y={161} width={10} height={10} rx={2} fill="none" stroke="#fff" strokeWidth={2} />
      <SvgText x={62} y={169} fill={t.soft} fontSize={10}>your house (No. 12)</SvgText>
    </Svg>
  );
}
