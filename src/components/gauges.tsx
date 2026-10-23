import { View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import type { Status } from '@/data/demo';
import { font, statusColor, useTheme } from '@/theme/theme';

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

// Home: one ring split into 5 parts, one per hazard.
export function StatusRing({ statuses, size = 118 }: { statuses: Status[]; size?: number }) {
  const t = useTheme();
  const n = statuses.length;
  const seg = 360 / n;
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140">
      <Circle cx={70} cy={70} r={58} fill="none" stroke={t.track} strokeWidth={12} />
      {statuses.map((s, i) => {
        const color = statusColor(t, s);
        const alert = s !== 'ok';
        return (
          <Path
            key={i}
            d={arc(70, 70, 58, i * seg + 5, (i + 1) * seg - 5)}
            fill="none"
            stroke={color}
            strokeWidth={alert ? 12 : 8}
            strokeLinecap="round"
            opacity={alert ? 1 : 0.8}
          />
        );
      })}
    </Svg>
  );
}

// Incident: flow gauge. Dashed part = the flow that was there, dot = flow now.
export function FlowGauge({ before, now, max = 1, size = 110 }: { before: number; now: number; max?: number; size?: number }) {
  const t = useTheme();
  const toA = (v: number) => -135 + (Math.min(v, max) / max) * 270;
  const [x, y] = polar(70, 70, 58, toA(now));
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140">
      <Path d={arc(70, 70, 58, -135, 135)} fill="none" stroke={t.track} strokeWidth={10} strokeLinecap="round" />
      <Path d={arc(70, 70, 58, -135, toA(before))} fill="none" stroke={t.tick} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 6" />
      <Circle cx={x} cy={y} r={7} fill={t.tickOn} />
    </Svg>
  );
}

// Scald guard: thermostat-style dial, 20–60 °C over 270°.
export function TempDial({ value, warn, cut, size = 270 }: { value: number; warn: number; cut: number; size?: number }) {
  const t = useTheme();
  const cx = 125, cy = 115, R = 100;
  const t2a = (v: number) => -135 + ((v - 20) / 40) * 270;
  const ticks = [];
  for (let v = 20; v <= 60; v++) {
    const a = t2a(v);
    const long = v % 5 === 0;
    const [x0, y0] = polar(cx, cy, R, a);
    const [x1, y1] = polar(cx, cy, R - (long ? 12 : 7), a);
    const stroke = v >= cut ? t.danger : v >= warn ? t.accent : v <= value ? t.tickOn : t.tick;
    ticks.push(<Line key={v} x1={x0} y1={y0} x2={x1} y2={y1} stroke={stroke} strokeWidth={long ? 2 : 1.2} strokeLinecap="round" />);
  }
  const [kx, ky] = polar(cx, cy, R - 24, t2a(value));
  const labels: [number, string][] = [[20, '20°'], [warn, `${warn}°`], [cut, `${cut}°`], [60, '60°']];
  return (
    <Svg width={size} height={size * 0.92} viewBox="0 0 250 230">
      {ticks}
      <Path d={arc(cx, cy, R - 24, t2a(20), t2a(value))} fill="none" stroke={t.tickOn} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={kx} cy={ky} r={6} fill={t.tickOn} />
      {labels.map(([v, l]) => {
        const [x, y] = polar(cx, cy, R + 13, t2a(v));
        const fill = v >= cut ? t.dangerText : v >= warn ? t.accentText : t.soft;
        return (
          <SvgText key={l} x={x} y={y + 4} textAnchor="middle" fontSize={11} fontFamily={font.medium} fill={fill}>
            {l}
          </SvgText>
        );
      })}
    </Svg>
  );
}

// Care: how much of the day has passed, with a glow when today is OK.
export function DayRing({ fraction, size = 180 }: { fraction: number; size?: number }) {
  const t = useTheme();
  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const [x0, y0] = polar(70, 70, 50, i * 7.5);
    const [x1, y1] = polar(70, 70, 47, i * 7.5);
    ticks.push(<Line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={t.tick} strokeWidth={1} />);
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 140 140">
      <Circle cx={70} cy={70} r={60} fill="none" stroke={t.track} strokeWidth={6} />
      <Path d={arc(70, 70, 60, 0, 360 * fraction)} fill="none" stroke={t.accent} strokeWidth={6} strokeLinecap="round" />
      {ticks}
    </Svg>
  );
}

// Decorative QR-style pattern for the preview (not a real code yet).
export function QrPattern({ size = 168, seed = 7 }: { size?: number; seed?: number }) {
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
  const cells = [];
  for (let y = 0; y < 25; y++)
    for (let x = 0; x < 25; x++)
      if (!inFinder(x, y) && rnd() > 0.52)
        cells.push(<Rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.3} fill="#0b1530" />);
  const finder = (x: number, y: number) => [
    <Rect key={`f${x}${y}a`} x={x} y={y} width={7} height={7} rx={1.5} fill="#0b1530" />,
    <Rect key={`f${x}${y}b`} x={x + 1} y={y + 1} width={5} height={5} rx={1} fill="#fff" />,
    <Rect key={`f${x}${y}c`} x={x + 2} y={y + 2} width={3} height={3} rx={0.8} fill="#0b1530" />,
  ];
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 22, padding: 12, width: size, height: size, alignSelf: 'center' }}>
      <Svg width="100%" height="100%" viewBox="0 0 25 25">
        {cells}
        {finder(0, 0)}
        {finder(18, 0)}
        {finder(0, 18)}
      </Svg>
    </View>
  );
}
