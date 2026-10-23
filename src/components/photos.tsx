import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

// Simple drawn "photos" for the demo (no real photos of real homes).
type Kind = 'crack' | 'leaky' | 'fixed' | 'patched';

export function Photo({ kind, height = 170 }: { kind: Kind; height?: number }) {
  return (
    <View style={{ height, borderRadius: 18, overflow: 'hidden', backgroundColor: '#1a2234' }}>
      <Svg width="100%" height="100%" viewBox="0 0 320 170" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#e9e4da" />
            <Stop offset="1" stopColor="#cfc8ba" />
          </LinearGradient>
          <LinearGradient id="cab" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2a3550" />
            <Stop offset="1" stopColor="#151d30" />
          </LinearGradient>
        </Defs>
        {kind === 'patched' ? (
          <>
            <Rect x="0" y="0" width="320" height="170" fill="url(#wall)" />
            <Rect x="210" y="20" width="90" height="70" fill="#9fb7d6" stroke="#f4f1ea" strokeWidth="6" />
            <Rect x="58" y="8" width="56" height="150" rx="6" fill="#f1ece3" opacity={0.9} />
            <Circle cx="268" cy="132" r="16" fill="#2f5bd3" />
            <Path d="M260 132 l6 6 l10 -12" stroke="#fff" strokeWidth="3" fill="none" />
            <Rect x="0" y="150" width="320" height="20" fill="#b8ae9c" />
          </>
        ) : kind === 'crack' ? (
          <>
            <Rect x="0" y="0" width="320" height="170" fill="url(#wall)" />
            <Rect x="210" y="20" width="90" height="70" fill="#9fb7d6" stroke="#f4f1ea" strokeWidth="6" />
            <Path d="M70 10 L82 40 L74 58 L92 86 L84 104 L101 132 L96 160" stroke="#5c5346" strokeWidth="2.5" fill="none" />
            <Path d="M82 40 L96 46 M92 86 L106 84" stroke="#5c5346" strokeWidth="1.5" fill="none" />
            <Rect x="0" y="150" width="320" height="20" fill="#b8ae9c" />
          </>
        ) : (
          <>
            <Rect x="0" y="0" width="320" height="170" fill="url(#cab)" />
            <Line x1="0" y1="78" x2="320" y2="78" stroke="#c3cad6" strokeWidth="16" />
            <Rect x="138" y="64" width="44" height="28" rx="5" fill="#aeb8c8" />
            <Path d="M160 78 C 160 40, 200 30, 240 28" stroke={kind === 'fixed' ? '#8fb0ff' : '#6b7a93'} strokeWidth="10" fill="none" strokeLinecap="round" />
            {kind === 'leaky' ? (
              <>
                <Path d="M158 96 q-5 9 0 12 q5-3 0-12z" fill="#4da3ff" />
                <Path d="M163 118 q-5 9 0 12 q5-3 0-12z" fill="#4da3ff" opacity={0.8} />
                <Rect x="60" y="150" width="200" height="10" rx="5" fill="#4da3ff" opacity={0.5} />
              </>
            ) : (
              <>
                <Rect x="134" y="54" width="52" height="10" rx="3" fill="#ffffff" />
                <Rect x="134" y="92" width="52" height="10" rx="3" fill="#ffffff" />
                <Circle cx="268" cy="34" r="16" fill="#2f5bd3" />
                <Path d="M260 34 l6 6 l10 -12" stroke="#fff" strokeWidth="3" fill="none" />
              </>
            )}
          </>
        )}
      </Svg>
    </View>
  );
}

// Camera viewfinder with a scan line, used for "Snap and report" and the guard's QR scanner.
export function Viewfinder({ children, height = 300, scanning = true }: { children?: React.ReactNode; height?: number; scanning?: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [v]);
  const corner = (s: object) => <View style={[{ position: 'absolute', width: 34, height: 34, borderColor: '#fff' }, s]} />;
  return (
    <View style={{ height, borderRadius: 26, overflow: 'hidden', backgroundColor: '#000' }}>
      {children}
      {corner({ left: 16, top: 16, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 10 })}
      {corner({ right: 16, top: 16, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 10 })}
      {corner({ left: 16, bottom: 16, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 10 })}
      {corner({ right: 16, bottom: 16, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 10 })}
      {scanning ? (
        <Animated.View
          style={{
            position: 'absolute', left: 20, right: 20, height: 3, borderRadius: 2, backgroundColor: '#8fb0ff',
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, height - 24] }) }],
          }}
        />
      ) : null}
    </View>
  );
}
