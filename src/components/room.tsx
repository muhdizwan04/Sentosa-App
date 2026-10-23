import { View } from 'react-native';
import Svg, { Ellipse, G, Line, Polygon, RadialGradient, Rect, Defs, Stop } from 'react-native-svg';
import { renoStyles, type RenoItemId, type RenoStyle } from '@/data/demo';

// Drawn "photo" of a room corner for Renovate: empty (before) or with the new furniture (after).
// Our own drawings, so no real home photo is needed or sent anywhere.
export function Room({ item, style = 'oak', after = false, height = 200, radius = 18 }: {
  item: RenoItemId; style?: RenoStyle; after?: boolean; height?: number; radius?: number;
}) {
  const c = renoStyles.find((s) => s.id === style)?.color ?? '#c8a27a';
  const dk = style === 'white' ? '#cfc8bd' : 'rgba(0,0,0,0.25)';
  const win =
    item === 'kitchen' ? { x: 206, y: 36, w: 70, h: 52, mid: false }
    : item === 'desk' ? { x: 196, y: 34, w: 80, h: 62, mid: true }
    : { x: 218, y: 40, w: 64, h: 62, mid: true };

  return (
    <View style={{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: '#ddd7cf' }}>
      <Svg width="100%" height="100%" viewBox="0 0 300 210" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="light" cx="0.75" cy="0.25" r="0.8">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="300" height="210" fill="#ddd7cf" />
        <Polygon points="0,0 300,0 300,18 60,18" fill="#ebe7e1" />
        <Polygon points="0,0 60,18 60,170 0,210" fill="#c9c2b8" />
        <Polygon points="0,210 60,170 300,170 300,210" fill="#a9845f" />
        {[0, 1, 2, 3, 4].map((k) => <Line key={k} x1={60 + k * 60} y1="170" x2={k * 70 - 20} y2="210" stroke="rgba(0,0,0,0.12)" />)}
        <Rect x="60" y="166" width="240" height="4" fill="#f4f1ec" />
        <Rect x={win.x} y={win.y} width={win.w} height={win.h} fill="#bcd3ea" />
        <Rect x={win.x} y={win.y} width={win.w} height={win.h} fill="none" stroke="#fff" strokeWidth="4" />
        {win.mid && <Line x1={win.x + win.w / 2} y1={win.y} x2={win.x + win.w / 2} y2={win.y + win.h} stroke="#fff" strokeWidth="3" />}
        <Rect width="300" height="210" fill="url(#light)" />
        {after && item === 'wardrobe' && (
          <G>
            <Ellipse cx="135" cy="172" rx="70" ry="6" fill="rgba(0,0,0,0.18)" />
            <Rect x="72" y="26" width="128" height="145" fill={c} />
            <Rect x="72" y="26" width="128" height="8" fill={dk} />
            {[114, 157].map((x) => <Line key={x} x1={x} y1="34" x2={x} y2="171" stroke={dk} strokeWidth="1.5" />)}
            {[108, 120, 151, 163].map((x) => <Rect key={x} x={x} y="92" width="2.5" height="18" rx="1" fill="#2b2b2b" />)}
          </G>
        )}
        {after && item === 'kitchen' && (
          <G>
            <Rect x="66" y="118" width="234" height="52" fill={c} />
            <Rect x="62" y="113" width="238" height="7" fill="#3a3d44" />
            {[124, 182, 240].map((x) => <Line key={x} x1={x} y1="120" x2={x} y2="170" stroke={dk} strokeWidth="1.5" />)}
            <Rect x="70" y="32" width="118" height="44" fill={c} />
            {[109, 148].map((x) => <Line key={x} x1={x} y1="32" x2={x} y2="76" stroke={dk} strokeWidth="1.5" />)}
            <Rect x="70" y="76" width="118" height="3" fill={dk} />
            <Rect x="214" y="96" width="44" height="17" rx="2" fill="#9aa3ad" />
          </G>
        )}
        {after && item === 'desk' && (
          <G>
            <Rect x="70" y="106" width="226" height="7" fill={c} />
            <Rect x="230" y="113" width="52" height="57" fill={c} />
            {[128, 146].map((y) => <Line key={y} x1="230" y1={y} x2="282" y2={y} stroke={dk} strokeWidth="1.5" />)}
            <Rect x="76" y="113" width="5" height="57" fill={c} />
            <Rect x="80" y="54" width="100" height="5" fill={c} />
            <Rect x="90" y="40" width="10" height="14" fill="#5c7cc4" />
            <Rect x="102" y="44" width="8" height="10" fill="#d9a441" />
            <Rect x="112" y="38" width="9" height="16" fill="#7a8a6a" />
            <Rect x="120" y="92" width="34" height="14" rx="1" fill="#2e3440" />
          </G>
        )}
        {after && item === 'tv' && (
          <G>
            <Rect x="96" y="36" width="150" height="104" fill={c} />
            {[126, 156, 186, 216].map((x) => <Line key={x} x1={x} y1="36" x2={x} y2="140" stroke={dk} strokeWidth="1" />)}
            <Rect x="122" y="58" width="98" height="56" rx="2" fill="#15181e" />
            <Rect x="80" y="140" width="182" height="30" fill={style === 'walnut' ? '#efebe5' : c} />
            <Line x1="171" y1="140" x2="171" y2="170" stroke={dk} strokeWidth="1.5" />
            <Ellipse cx="171" cy="173" rx="95" ry="4" fill="rgba(0,0,0,0.15)" />
          </G>
        )}
      </Svg>
    </View>
  );
}
