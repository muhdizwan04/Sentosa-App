// Home screen with Guard (leak, heat, gas…). Used only when GUARD is on (data/features.ts) — kept for the top 10.
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, View } from 'react-native';
import { callGuard, sos } from '@/components/actions';
import { Avatar, Btn, Chip, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care, hazardList, home, resolveConfig, type HazardConfig, type HazardKey } from '@/data/demo';
import { tourOn } from '@/data/tour';
import { useAlerts, useStore, type HazardState } from '@/data/store';
import { statusColor, useTheme } from '@/theme/theme';

// Home is read by everyone from kids to grandparents: plain words first, big text, one clear button.
// Numbers stay small and secondary.

const rooms = ['Whole home', 'Kitchen', 'Bathroom', 'Roof'];
// Which checks show in each room (heat points are spread across the house).
const inRoom: Record<string, string[]> = { Kitchen: ['leak', 'gas', 'heat'], Bathroom: ['water', 'heat'], Roof: ['tank'] };

// Everyday names and sentences for each check.
const plain: Record<HazardKey, { short: string; name: string; where: string; problem: string }> = {
  leak: { short: 'Leak', name: 'Water leak', where: 'Kitchen pipes', problem: 'Water is leaking. Sentosa can stop it now.' },
  heat: { short: 'Heat', name: 'Overheating', where: '6 plugs and the DB box', problem: 'Something is getting too hot. Sentosa can cool it or switch it off.' },
  water: { short: 'Shower', name: 'Hot water', where: 'Shower', problem: 'The shower water is too hot. Sentosa can close the supply.' },
  gas: { short: 'Gas', name: 'Gas', where: 'Kitchen', problem: 'Gas in the kitchen. Open the windows. Do not touch any switch.' },
  tank: { short: 'Tank', name: 'Roof tank', where: 'Roof', problem: 'The roof tank is overflowing. Sentosa can close the inlet.' },
};
const fixer: Record<string, string> = { plumbing: 'plumber', electrical: 'electrician', gas: 'gas technician' };
const an = (w: string) => (/^[aeiou]/i.test(w) ? `an ${w}` : `a ${w}`);
// Short "where" for a check: the leaking joint or the hot device when there is a problem.
function whereNow(key: HazardKey, s: HazardState) {
  if (s.status === 'ok') {
    if (key === 'water') return `Shower · ${s.value}°C`;
    if (key === 'tank') return `Roof · ${s.value}% full`;
    return plain[key].where;
  }
  const place = resolveConfig(key, s.variant).place.split(' · ');
  const w = key === 'heat' ? place[0] : place[place.length - 1];
  return w.charAt(0).toUpperCase() + w.slice(1);
}
const statusWord = { ok: 'OK', detected: 'Act now', firstaid: 'Fixed for now', cutoff: 'Turned off' } as const;

function greeting() {
  const h = tourOn ? 15 : new Date().getHours();
  if (h < 12) return 'Selamat pagi';
  if (h < 15) return 'Selamat tengah hari';
  if (h < 19) return 'Selamat petang';
  return 'Selamat malam';
}

export default function GuardHome() {
  const t = useTheme();
  const { hazards, job, careState } = useStore();
  const alerts = useAlerts();
  const [room, setRoom] = useState(rooms[0]);
  const first = alerts[0];
  const firstState = first ? hazards[first.key] : null;
  const firstConfig = first ? resolveConfig(first.key, firstState?.variant) : null;
  const careMissed = careState === 'missed' || careState === 'guard';

  const openHazard = (key: HazardKey) => {
    const st = hazards[key].status;
    if (st === 'detected') router.push(`/respond/${key}`);
    else if (st !== 'ok') router.push(`/incident/${key}`);
    else if (key === 'water') router.push('/water');
    else router.push(`/incident/${key}`);
  };

  return (
    <Screen>
      {/* Who and when: avatar, greeting, alerts */}
      <Row gap={12}>
        <Pressable onPress={() => router.navigate('/me')} accessibilityLabel="My profile"><Avatar initials={home.initials} size={50} /></Pressable>
        <View style={{ flex: 1 }}>
          <T size={15} soft>{greeting()},</T>
          <T size={26} weight="medium" style={{ letterSpacing: -0.3, lineHeight: 31 }}>{home.owner}</T>
        </View>
        <View>
          <IconButton icon="bell-outline" label="Alerts" onPress={() => router.push('/alerts')} />
          {alerts.length || careMissed ? <View style={{ position: 'absolute', top: 2, right: 2, width: 11, height: 11, borderRadius: 6, backgroundColor: t.danger }} /> : null}
        </View>
      </Row>

      {/* 1. The answer first: is my home OK? One card, plain words, all 5 checks at a glance */}
      {(() => {
        const mode = !first || !firstState || !firstConfig ? 'safe' : firstState.status === 'detected' ? 'alarm' : 'held';
        const wash = mode === 'alarm' ? 'rgba(229,72,77,0.30)' : mode === 'held' ? t.accentWash : undefined;
        const checks = (
          <Row style={{ justifyContent: 'space-between', marginTop: 18, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: t.line }}>
            {hazardList.map((h) => {
              const st = hazards[h.key].status;
              const ok = st === 'ok';
              return (
                <Pressable key={h.key} onPress={() => openHazard(h.key)} accessibilityLabel={`${plain[h.key].name}: ${statusWord[st]}`} style={{ alignItems: 'center', gap: 6, width: 58 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: ok ? t.glass2 : statusColor(t, st), alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={h.icon} size={21} color={ok ? t.text : '#fff'} />
                    <View style={{ position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: ok ? t.solid : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={ok ? 'check' : st === 'detected' ? 'exclamation-thick' : 'shield-half-full'} size={11} color={ok ? t.onSolid : statusColor(t, st)} />
                    </View>
                  </View>
                  <T size={12.5} soft={ok} weight={ok ? 'regular' : 'semibold'}>{plain[h.key].short}</T>
                </Pressable>
              );
            })}
          </Row>
        );
        return (
          <Glass pad={20} wash={wash} radius={30}>
            <Row>
              <Icon name="home-outline" size={16} color={t.soft} />
              <T size={14} soft style={{ flex: 1, marginLeft: 6 }}>{home.address}</T>
              <LiveDot color={mode === 'alarm' ? t.dangerText : t.accentText} />
              <T size={13} weight="medium" color={mode === 'alarm' ? t.dangerText : t.accentText} style={{ marginLeft: 6 }}>Live</T>
            </Row>
            <Row gap={16} style={{ marginTop: 16, alignItems: mode === 'safe' ? 'center' : 'flex-start' }}>
              <Shield
                icon={mode === 'safe' ? 'shield-check' : mode === 'alarm' ? 'alert' : 'shield-half-full'}
                bg={mode === 'safe' ? t.solid : mode === 'alarm' ? t.danger : t.accent}
                color={mode === 'safe' ? t.onSolid : '#fff'}
                glow={mode === 'alarm' ? t.danger : t.accent}
              />
              <View style={{ flex: 1 }}>
                {mode === 'safe' || !first || !firstState || !firstConfig ? (
                  <>
                    <T size={25} weight="medium" style={{ lineHeight: 30 }}>Your home is safe</T>
                    <T size={15} soft style={{ marginTop: 4 }}>All 5 checks OK · checked just now</T>
                  </>
                ) : mode === 'alarm' ? (
                  <>
                    <T size={13} weight="semibold" color={t.dangerText} style={{ letterSpacing: 0.6 }}>NEEDS YOU NOW · {firstState.since}</T>
                    <T size={22} weight="medium" style={{ marginTop: 2, lineHeight: 27 }}>{plain[first.key].name} · {whereNow(first.key, firstState)}</T>
                    <T size={16} style={{ marginTop: 6, lineHeight: 22 }}>{plain[first.key].problem}</T>
                  </>
                ) : (
                  <>
                    <T size={13} weight="semibold" color={t.accentText} style={{ letterSpacing: 0.6 }}>SAFE FOR NOW</T>
                    <T size={22} weight="medium" style={{ marginTop: 2, lineHeight: 27 }}>{plain[first.key].name}: {firstState.status === 'cutoff' ? 'turned off' : 'stopped'}</T>
                    <T size={16} style={{ marginTop: 6, lineHeight: 22 }}>
                      {job?.hazard === first.key
                        ? `${job.company.name.replace(' Sdn Bhd', '')} is coming ${job.slot.toLowerCase()} to fix it.`
                        : `${an(fixer[firstConfig.repair.trade] ?? 'technician').replace(/^a/, 'A')} still needs to fix it properly.`}
                    </T>
                  </>
                )}
              </View>
            </Row>
            {mode !== 'safe' && first && firstConfig && (
              mode === 'alarm'
                ? <Btn label="See what to do" icon="arrow-right" onPress={() => openHazard(first.key)} style={{ marginTop: 16 }} />
                : job?.hazard === first.key
                  ? <Btn label="Track the repair" icon="map-marker-path" onPress={() => router.push('/job')} style={{ marginTop: 16 }} />
                  : <Btn label={`Book a fix · RM${firstConfig.repair.price}*`} icon="wrench-outline" onPress={() => router.push(`/book?hazard=${first.key}`)} style={{ marginTop: 16 }} />
            )}
            {checks}
          </Glass>
        );
      })()}
      {alerts.length > 1 && (
        <Pressable onPress={() => router.push('/alerts')}>
          <T size={15} color={t.accentText} style={{ textAlign: 'center' }}>+ {alerts.length - 1} more {alerts.length === 2 ? 'problem' : 'problems'} · see all</T>
        </Pressable>
      )}

      {/* 2. Help is always one tap away */}
      <Row gap={10}>
        <Glass style={{ flex: 1 }} pad={18} onPress={callGuard}>
          <Row gap={10} style={{ justifyContent: 'center' }}>
            <Icon name="shield-account-outline" size={24} />
            <T size={17} weight="medium">Call guard</T>
          </Row>
        </Glass>
        <Glass style={{ flex: 1 }} pad={18} wash="rgba(229,72,77,0.42)" onPress={sos}>
          <Row gap={10} style={{ justifyContent: 'center' }}>
            <Icon name="alarm-light-outline" size={24} color={t.dangerText} />
            <T size={17} weight="semibold" color={t.dangerText}>SOS</T>
          </Row>
        </Glass>
      </Row>

      {/* 3. Every check in plain words */}
      <T size={18} weight="medium" style={{ marginTop: 6 }}>Home checks</T>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 18 }} style={{ marginHorizontal: -18, marginTop: -4 }}>
        {rooms.map((r) => <Chip key={r} label={r} on={r === room} onPress={() => setRoom(r)} />)}
      </ScrollView>
      <Glass pad={6}>
        {hazardList
          .filter((h) => room === rooms[0] || inRoom[room]?.includes(h.key))
          .map((h, i) => <CheckRow key={h.key} h={h} s={hazards[h.key]} first={i === 0} onPress={() => openHazard(h.key)} />)}
      </Glass>

      {/* 4. Family */}
      <T size={18} weight="medium" style={{ marginTop: 6 }}>Family</T>
      <Glass pad={16} onPress={() => router.push(careMissed ? '/care-alert' : '/care')} wash={careMissed ? 'rgba(229,72,77,0.25)' : undefined}>
        <Row gap={14}>
          <Bubble icon={careMissed ? 'heart-pulse' : 'heart-outline'} bg={careMissed ? t.danger : t.accentWash} color={careMissed ? '#fff' : t.accentText} size={48} />
          <View style={{ flex: 1 }}>
            <T size={17} weight="medium">
              {careMissed ? `${care.person} needs a check` : careState === 'resolved' ? `${care.person} is OK · guard checked` : `${care.person} is OK today`}
            </T>
            <T size={14} soft style={{ marginTop: 2 }}>
              {careMissed ? 'No sign of a normal morning yet' : `Fridge door ${care.signals[0].detail}`}
            </T>
          </View>
          <Icon name="chevron-right" size={24} color={t.soft} />
        </Row>
      </Glass>

      {/* Demo helper for pitches, kept small at the bottom */}
      <Pressable onPress={() => router.push('/demo')} style={{ alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 14 }}>
        <Row gap={6}>
          <Icon name="play-circle-outline" size={16} color={t.accentText} />
          <T size={14} color={t.accentText}>Demo: try a problem</T>
        </Row>
      </Pressable>
    </Screen>
  );
}

// Status icon with a slow glow, so the card feels alive (Sentosa is watching).
function Shield({ icon, bg, color, glow }: { icon: string; bg: string; color: string; glow: string }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(p, { toValue: 1, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [p]);
  return (
    <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: glow,
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }), transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.35] }) }] }} />
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={color} />
      </View>
    </View>
  );
}

function LiveDot({ color }: { color: string }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(p, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [p]);
  return <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }} />;
}

function Bubble({ icon, bg, color, size = 56 }: { icon: string; bg: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.5} color={color} />
    </View>
  );
}

// One check as a readable row: icon · name · where · status word.
function CheckRow({ h, s, first, onPress }: { h: HazardConfig; s: HazardState; first: boolean; onPress: () => void }) {
  const t = useTheme();
  const p = plain[h.key];
  const ok = s.status === 'ok';
  const col = statusColor(t, s.status);
  return (
    <Pressable onPress={onPress} accessibilityLabel={`${p.name}: ${statusWord[s.status]}`} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Row gap={12} style={{ paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: first ? 0 : 0.5, borderTopColor: t.line }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: ok ? t.glass2 : col, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={h.icon} size={22} color={ok ? t.text : '#fff'} />
        </View>
        <View style={{ flex: 1 }}>
          <T size={17} weight="medium">{p.name}</T>
          <T size={14} soft numberOfLines={1}>{whereNow(h.key, s)}</T>
        </View>
        <View style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99, backgroundColor: ok ? t.glass2 : col }}>
          <Row gap={4}>
            {ok && <Icon name="check" size={14} />}
            <T size={14} weight="semibold" color={ok ? t.text : '#fff'}>{statusWord[s.status]}</T>
          </Row>
        </View>
        <Icon name="chevron-right" size={22} color={t.soft} />
      </Row>
    </Pressable>
  );
}
