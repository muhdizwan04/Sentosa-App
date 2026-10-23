import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { dayType, learn, type DayType, type Morning } from '@/data/routine';
import { useTheme } from '@/theme/theme';

const START = 6 * 60 + 30, END = 11 * 60 + 15; // 6:30 am → 11:15 am
const X0 = 62, X1 = 332;
const x = (m: number) => X0 + ((m - START) / (END - START)) * (X1 - X0);
const ROWS: { type: DayType; label: string; y: number }[] = [
  { type: 'weekday', label: 'Mon–Thu', y: 34 },
  { type: 'friday', label: 'Friday', y: 72 },
  { type: 'weekend', label: 'Sat–Sun', y: 110 },
];

// Mom's last 30 mornings as dots, her learned "usual" band per kind of day, today's marker,
// and the old fixed rule (11 am) for comparison.
export function RoutineChart({ mornings, today, todayFirst, missed }: { mornings: Morning[]; today: Date; todayFirst: number; missed: boolean }) {
  const t = useTheme();
  const todayType = dayType(today.getDay());
  const red = t.danger;
  return (
    <Svg width="100%" height={160} viewBox="0 0 340 160">
      {/* old fixed rule */}
      <Line x1={x(660)} y1={14} x2={x(660)} y2={128} stroke={t.soft} strokeWidth={1.2} strokeDasharray="3 4" />
      <SvgText x={x(660) + 4} y={10} fill={t.soft} fontSize={9.5} textAnchor="end">old rule: 11 am</SvgText>
      {ROWS.map((r) => {
        const b = learn(r.type, mornings);
        const isToday = r.type === todayType;
        return [
          <SvgText key={r.type + 'l'} x={0} y={r.y + 4} fill={isToday ? t.text : t.soft} fontSize={11} fontWeight={isToday ? '600' : '400'}>{r.label}</SvgText>,
          <Rect key={r.type + 'b'} x={x(b.from)} y={r.y - 11} width={x(b.to) - x(b.from)} height={22} rx={11} fill={t.accentWash} />,
          ...mornings.filter((m) => dayType(m.dow) === r.type).map((m) => (
            <Circle key={r.type + m.daysAgo} cx={x(m.first)} cy={r.y} r={3.2} fill={t.accentText} opacity={0.75} />
          )),
          isToday && !missed ? <Circle key={r.type + 't'} cx={x(todayFirst)} cy={r.y} r={7} fill={t.solid} stroke={t.accentText} strokeWidth={3} /> : null,
          isToday && missed ? <Line key={r.type + 'm'} x1={x(b.checkAt)} y1={r.y - 16} x2={x(b.checkAt)} y2={r.y + 16} stroke={red} strokeWidth={3} strokeLinecap="round" /> : null,
          isToday && missed ? <SvgText key={r.type + 'mt'} x={x(b.checkAt) + 6} y={r.y + 4} fill={red} fontSize={10} fontWeight="600">no sign</SvgText> : null,
        ];
      })}
      {[7, 8, 9, 10, 11].map((h) => (
        <SvgText key={h} x={x(h * 60)} y={150} fill={t.soft} fontSize={10} textAnchor="middle">{h} am</SvgText>
      ))}
    </Svg>
  );
}
