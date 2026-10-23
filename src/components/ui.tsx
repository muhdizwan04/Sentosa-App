import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop, Ellipse } from 'react-native-svg';
import { font, useTheme } from '@/theme/theme';

// Real Liquid Glass on iOS 26+, frosted blur everywhere else.
const LIQUID_GLASS =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export function Icon({ name, size = 18, color }: { name: string; size?: number; color?: string }) {
  const t = useTheme();
  return <MaterialCommunityIcons name={name as IconName} size={size} color={color ?? t.text} />;
}

type Weight = 'light' | 'regular' | 'medium' | 'semibold';

export function T({
  children,
  size = 14,
  weight = 'regular',
  color,
  soft,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  size?: number;
  weight?: Weight;
  color?: string;
  soft?: boolean;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const t = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        { fontFamily: font[weight], fontSize: size, color: color ?? (soft ? t.soft : t.text) },
        style,
      ]}>
      {children}
    </Text>
  );
}

// Blue night glow behind every screen (dark) or soft grey daylight (light).
export function Background() {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={t.bgTop} />
            <Stop offset="0.55" stopColor={t.bg} />
            <Stop offset="1" stopColor={t.bgBottom} />
          </LinearGradient>
          <RadialGradient id="a" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={t.blobA} stopOpacity={t.scheme === 'dark' ? 0.75 : 0.35} />
            <Stop offset="1" stopColor={t.blobA} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="b" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={t.blobB} stopOpacity={0.8} />
            <Stop offset="1" stopColor={t.blobB} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="c" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={t.blobC} stopOpacity={t.scheme === 'dark' ? 0.18 : 0.9} />
            <Stop offset="1" stopColor={t.blobC} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="s" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={t.strip} stopOpacity={0.55} />
            <Stop offset="1" stopColor={t.strip} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#bg)" />
        <Ellipse cx={width * 0.95} cy={height * 0.22} rx={width * 0.75} ry={width * 0.75} fill="url(#a)" />
        <Ellipse cx={width * 0.0} cy={height * 0.9} rx={width * 0.8} ry={width * 0.8} fill="url(#b)" />
        <Ellipse cx={width * 0.3} cy={-height * 0.02} rx={width * 0.6} ry={width * 0.5} fill="url(#c)" />
        <Ellipse cx={width * 0.9} cy={height * 0.55} rx={18} ry={height * 0.38} fill="url(#s)" />
      </Svg>
    </View>
  );
}

// Glass card. Pass onPress to make it tappable.
export function Glass({
  children,
  style,
  onPress,
  radius = 26,
  pad = 14,
  wash,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  radius?: number;
  pad?: number;
  wash?: string; // optional colour tint, e.g. for alerts
}) {
  const t = useTheme();
  const base: ViewStyle = { borderRadius: radius, padding: pad, overflow: 'hidden' };
  const body = LIQUID_GLASS ? (
    <GlassView
      glassEffectStyle="regular"
      colorScheme={t.scheme}
      tintColor={wash}
      style={[base, style]}>
      {children}
    </GlassView>
  ) : (
    <BlurView
      intensity={40}
      tint={t.scheme === 'dark' ? 'dark' : 'light'}
      style={[
        base,
        { backgroundColor: wash ?? t.glassFallback, borderWidth: StyleSheet.hairlineWidth, borderColor: t.line },
        style,
      ]}>
      {children}
    </BlurView>
  );
  if (!onPress) return body;
  return <Tap onPress={onPress} style={style}>{body}</Tap>;
}

// Pressable wrapper that keeps the card's outer size (flex / width) so cards in a row still fill it.
function Tap({ onPress, style, children }: { onPress: () => void; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const { flex, width, alignSelf } = StyleSheet.flatten(style) ?? {};
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ flex, width, alignSelf, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      {children}
    </Pressable>
  );
}

// Solid card: white in dark mode, navy in light mode. Used for the main item on a screen.
export function Solid({
  children,
  style,
  onPress,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const t = useTheme();
  const v = <View style={[{ backgroundColor: t.solid, borderRadius: 26, padding: 14 }, style]}>{children}</View>;
  if (!onPress) return v;
  return <Tap onPress={onPress} style={style}>{v}</Tap>;
}

export function IconButton({ icon, onPress, label }: { icon: string; onPress?: () => void; label: string }) {
  return (
    <Glass radius={20} pad={0} onPress={onPress} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
      <View accessibilityLabel={label} accessibilityRole="button">
        <Icon name={icon} size={19} />
      </View>
    </Glass>
  );
}

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const t = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
      <T size={13} weight="semibold" color={t.onSolid}>{initials}</T>
    </View>
  );
}

export function Chip({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 99,
        backgroundColor: on ? t.solid : t.glass2,
        borderWidth: on ? 0 : StyleSheet.hairlineWidth,
        borderColor: t.line,
      }}>
      <T size={12.5} weight={on ? 'medium' : 'regular'} color={on ? t.onSolid : t.text}>{label}</T>
    </Pressable>
  );
}

export function Btn({
  label,
  onPress,
  ghost,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  ghost?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const inner = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {icon ? <Icon name={icon} size={18} color={ghost ? t.text : t.onSolid} /> : null}
      <T size={15} weight={ghost ? 'regular' : 'semibold'} color={ghost ? t.text : t.onSolid}>{label}</T>
    </View>
  );
  if (ghost) {
    return (
      <Glass radius={99} pad={15} onPress={onPress} style={style}>
        {inner}
      </Glass>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        { backgroundColor: t.solid, borderRadius: 99, padding: 15, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}>
      {inner}
    </Pressable>
  );
}

export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

export function Row({ children, gap = 8, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

// Full screen with background glow, scroll, and room for the floating tab bar.
export function Screen({ children, tabBar = true }: { children: ReactNode; tabBar?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <Background />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 18,
          paddingBottom: insets.bottom + (tabBar ? 110 : 30),
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <TopFade height={insets.top + 12} />
    </View>
  );
}

// Soft fade behind the status bar so scrolled content never sits under the clock.
function TopFade({ height }: { height: number }) {
  const t = useTheme();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height }}>
      <Svg width="100%" height={height}>
        <Defs>
          <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.bgTop} stopOpacity={1} />
            <Stop offset="0.7" stopColor={t.bgTop} stopOpacity={0.85} />
            <Stop offset="1" stopColor={t.bgTop} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height={height} fill="url(#fade)" />
      </Svg>
    </View>
  );
}
