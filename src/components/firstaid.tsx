import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View } from 'react-native';
import { Icon, T } from '@/components/ui';
import { hazardConfig, heatDevices, leakSpots, type HazardKey } from '@/data/demo';
import { useTheme } from '@/theme/theme';

// Short animations that show how each first aid works.
// Before `playing` they show the hazard happening; after, they play the fix and call onDone.

type Props = { playing: boolean; onDone: () => void };
type Phase = 'alarm' | 'acting' | 'checking' | 'done';

const W = 300;
const H = 200;
const WATER = '#4da3ff';

function useCounter(from: number, decimals = 0) {
  const v = useRef(new Animated.Value(from)).current;
  const [text, setText] = useState(from.toFixed(decimals));
  useEffect(() => {
    const id = v.addListener(({ value }) => setText(value.toFixed(decimals)));
    return () => v.removeListener(id);
  }, [v, decimals]);
  return { v, text };
}

// A looping particle (drop, puff of gas, air) that can be faded out when the hazard stops.
function useLoops(count: number, duration: number, running: boolean) {
  const vals = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  const fade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loops = vals.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay((i * duration) / count),
          Animated.timing(v, { toValue: 1, duration, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [vals, duration, count]);
  useEffect(() => {
    Animated.timing(fade, { toValue: running ? 1 : 0, duration: 350, useNativeDriver: true }).start();
  }, [running, fade]);
  return { vals, fade };
}

function Caption({ phase, lines }: { phase: Phase; lines: Record<Phase, string> }) {
  const t = useTheme();
  return (
    <T size={13} color={phase === 'done' ? t.accentText : t.soft} style={{ textAlign: 'center', marginTop: 10 }}>
      {phase === 'done' ? '✓ ' : ''}{lines[phase]}
    </T>
  );
}

function DoneBadge({ show }: { show: boolean }) {
  const t = useTheme();
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (show) Animated.spring(s, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    else s.setValue(0);
  }, [show, s]);
  return (
    <Animated.View
      style={{
        position: 'absolute', right: 8, top: 8, width: 34, height: 34, borderRadius: 17,
        backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center', transform: [{ scale: s }],
      }}>
      <Icon name="check" size={20} color="#fff" />
    </Animated.View>
  );
}

// 💧 Leak → clamp-ready sleeves.
// A sleeve waits open at every risky joint. The wet sensor pad shows which joint leaks;
// Sentosa pulls that sleeve's latch and a spring snaps it shut. Hidden pipes: the branch valve closes.
function Sleeve({ x, pipeY, pipeH, close, latch }: { x: number; pipeY: number; pipeH: number; close: Animated.Value; latch: Animated.Value }) {
  const t = useTheme();
  const half = (top: boolean) => ({
    position: 'absolute' as const,
    left: x - 24,
    width: 48,
    height: 13,
    top: top ? pipeY - 13 : pipeY + pipeH,
    borderRadius: 4,
    backgroundColor: t.solid,
    transform: [{ translateY: close.interpolate({ inputRange: [0, 1], outputRange: [top ? -12 : 12, 0] }) }],
  });
  return (
    <>
      <Animated.View style={half(true)}>
        <View style={{ position: 'absolute', bottom: 0, left: 4, right: 4, height: 4, borderRadius: 2, backgroundColor: t.accent }} />
      </Animated.View>
      <Animated.View style={half(false)}>
        <View style={{ position: 'absolute', top: 0, left: 4, right: 4, height: 4, borderRadius: 2, backgroundColor: t.accent }} />
      </Animated.View>
      {/* latch pin that holds the sleeve open */}
      <Animated.View
        style={{
          position: 'absolute', left: x - 3, top: pipeY - 40, width: 6, height: 15, borderRadius: 3, backgroundColor: t.danger,
          opacity: latch.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ translateY: latch.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
        }}
      />
    </>
  );
}

export function LeakAnim({ playing, onDone, variant }: Props & { variant?: string }) {
  const t = useTheme();
  const spot = leakSpots.find((s) => s.id === variant) ?? leakSpots[0];
  const hasSleeve = spot.x !== null;
  const [phase, setPhase] = useState<Phase>('alarm');
  const flow = useCounter(Number(spot.flow), 1);
  const drops = useLoops(4, 700, phase === 'alarm' || phase === 'acting');
  const pulse = usePulse();
  const sleeves = useRef(Object.fromEntries(leakSpots.map((s) => [s.id, { close: new Animated.Value(0), latch: new Animated.Value(0) }]))).current;
  const valve = useRef(new Animated.Value(0)).current;

  const pipe = t.scheme === 'dark' ? '#c3cad6' : '#8f9bb0';
  const pipeY = 100;
  const pipeH = 24;
  const startX = 40;
  const spanW = 214;
  const wallX = 262;
  const xOf = (f: number) => startX + f * spanW;
  const leakX = hasSleeve ? xOf(spot.x!) : wallX + 18;

  const finish = () => {
    setPhase('checking');
    Animated.timing(flow.v, { toValue: 0, duration: 1300, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      setPhase('done');
      setTimeout(onDone, 700);
    });
  };

  useEffect(() => {
    if (!playing || phase !== 'alarm') return;
    setPhase('acting');
    if (hasSleeve) {
      const sl = sleeves[spot.id];
      Animated.timing(sl.latch, { toValue: 1, duration: 350, useNativeDriver: true }).start(() => {
        Animated.spring(sl.close, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
          finish();
        }, 300);
      });
    } else {
      Animated.timing(valve, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        finish();
      });
    }
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View>
      <View style={{ width: W, height: 210, alignSelf: 'center' }}>
        <View style={{ position: 'absolute', left: 0, top: 0 }}>
          <T size={30} weight="light">{flow.text}<T size={13} soft> L/min</T></T>
          <T size={11} soft>leak flow</T>
        </View>

        {/* wall with hidden pipe */}
        <View style={{ position: 'absolute', left: wallX, width: W - wallX, top: 56, height: 122, borderRadius: 6, backgroundColor: t.track, borderWidth: 1, borderColor: t.line }} />
        <T size={10} soft style={{ position: 'absolute', left: wallX + 6, top: 160 }}>wall</T>

        {/* pipe + joints */}
        <View style={{ position: 'absolute', left: 0, width: wallX + 6, top: pipeY, height: pipeH, borderRadius: 6, backgroundColor: pipe }} />
        {leakSpots.filter((s) => s.x !== null).map((s) => (
          <View key={s.id} style={{ position: 'absolute', left: xOf(s.x!) - 12, width: 24, top: pipeY - 4, height: pipeH + 8, borderRadius: 5, backgroundColor: pipe, borderWidth: 2, borderColor: t.bg }} />
        ))}

        {/* branch valve at the start of the pipe */}
        <View style={{ position: 'absolute', left: 0, top: pipeY - 10, width: 30, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              style={{
                width: 38, height: 7, borderRadius: 4,
                backgroundColor: hasSleeve ? t.soft : phase === 'alarm' || phase === 'acting' ? t.danger : t.accent,
                transform: [{ rotate: valve.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
              }}
            />
          </View>
        </View>
        <T size={10} soft style={{ position: 'absolute', left: 0, top: pipeY + 36 }}>valve</T>

        {/* sensor pads: the wet one shows which joint leaks */}
        {leakSpots.map((s) => {
          const x = s.x !== null ? xOf(s.x) : wallX + 18;
          const wet = s.id === spot.id && phase !== 'done';
          return (
            <Animated.View
              key={s.id}
              style={{
                position: 'absolute', left: x - 15, top: 182, width: 30, height: 7, borderRadius: 3,
                backgroundColor: wet ? t.danger : phase === 'done' && s.id === spot.id ? t.accent : t.tick,
                opacity: wet ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) : 1,
              }}
            />
          );
        })}
        <T size={10} soft style={{ position: 'absolute', left: startX + 10, top: 194 }}>leak sensor pads</T>

        {/* dripping water at the leak */}
        <Animated.View style={{ opacity: drops.fade }}>
          {drops.vals.map((v, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute', left: leakX - 4 + (i % 2 ? 4 : -4), top: pipeY + pipeH + 2, width: 7, height: 10,
                borderRadius: 5, borderTopLeftRadius: 1, backgroundColor: WATER,
                opacity: v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
                transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) }, { rotate: '45deg' }],
              }}
            />
          ))}
        </Animated.View>

        {/* a sleeve waiting at every visible joint */}
        {leakSpots.filter((s) => s.x !== null).map((s) => (
          <Sleeve key={s.id} x={xOf(s.x!)} pipeY={pipeY} pipeH={pipeH} close={sleeves[s.id].close} latch={sleeves[s.id].latch} />
        ))}
        {leakSpots.filter((s) => s.x !== null).map((s) => (
          <T key={s.id} size={10} soft style={{ position: 'absolute', left: xOf(s.x!) - 30, width: 60, textAlign: 'center', top: 44 }}>{s.label}</T>
        ))}

        <DoneBadge show={phase === 'done'} />
      </View>
      <Caption
        phase={phase}
        lines={
          hasSleeve
            ? {
                alarm: `Pad under the ${spot.label.toLowerCase()} is wet`,
                acting: 'Latch pulled · sleeve snapping shut…',
                checking: 'Sleeve closed · checking the flow…',
                done: 'Flow stopped · other sleeves still ready',
              }
            : {
                alarm: 'Water seeping from a hidden pipe · no sleeve there',
                acting: 'Closing the kitchen water valve…',
                checking: 'Valve closed · checking the flow…',
                done: 'Flow stopped · only the kitchen is without water',
              }
        }
      />
    </View>
  );
}

function usePulse() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]));
    p.start();
    return () => p.stop();
  }, [pulse]);
  return pulse;
}

// 🔥 Overheat: Sentosa watches many devices, finds the hot one, then
// cools it (closed boxes like the DB box) or cuts power to that socket only (plugs).
export function HeatAnim({ playing, onDone, variant }: Props & { variant?: string }) {
  const t = useTheme();
  const device = heatDevices.find((d) => d.id === variant && d.alarm) ?? heatDevices[0];
  const a = device.alarm!;
  const [phase, setPhase] = useState<Phase>('alarm');
  const [found, setFound] = useState(false);
  const temp = useCounter(a.temp);
  const amps = useCounter(4.2, 1);
  const pulse = usePulse();
  const sweep = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const power = useRef(new Animated.Value(1)).current;
  const air = useLoops(3, 650, a.action === 'fan' && (phase === 'acting' || phase === 'checking'));

  // scan all devices once, then point at the hot one
  useEffect(() => {
    Animated.timing(sweep, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => setFound(true));
  }, [sweep]);

  useEffect(() => {
    if (!playing || phase !== 'alarm') return;
    setPhase('acting');
    let stopSpin = () => {};
    if (a.action === 'fan') {
      const s = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 450, easing: Easing.linear, useNativeDriver: true }));
      s.start();
      stopSpin = () => s.stop();
    } else {
      Animated.timing(power, { toValue: 0, duration: 450, useNativeDriver: true }).start();
      Animated.timing(amps.v, { toValue: 0, duration: 500, useNativeDriver: false }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
    setTimeout(() => {
      setPhase('checking');
      Animated.timing(temp.v, { toValue: a.after, duration: 2400, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(() => {
        setPhase('done');
        setTimeout(() => { stopSpin(); onDone(); }, 900);
      });
    }, 700);
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const cellW = 92;
  const hot = Number(temp.text) > 45;

  return (
    <View>
      <View style={{ width: W, height: 222, alignSelf: 'center' }}>
        {/* all monitored devices */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, overflow: 'hidden', borderRadius: 12 }}>
          {heatDevices.map((d) => {
            const isHot = d.id === device.id && found;
            return (
              <Animated.View
                key={d.id}
                style={{
                  width: cellW, height: 62, borderRadius: 12, padding: 8, justifyContent: 'space-between',
                  backgroundColor: isHot ? 'rgba(229,72,77,0.25)' : t.glass2,
                  borderWidth: isHot ? 1.5 : 0, borderColor: t.danger,
                  opacity: found && !isHot ? 0.45 : 1,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name={d.icon} size={13} color={isHot ? t.dangerText : t.soft} />
                  <T size={10} soft numberOfLines={1} style={{ flex: 1 }}>{d.name}</T>
                </View>
                <T size={17} weight="light" color={isHot && hot ? t.dangerText : t.text}>
                  {d.id === device.id && found ? temp.text : d.normal}°
                </T>
              </Animated.View>
            );
          })}
          {/* scanning sweep */}
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute', top: 0, bottom: 0, width: 40, backgroundColor: t.accentWash,
              opacity: found ? 0 : 1,
              transform: [{ translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-40, W] }) }],
            }}
          />
        </View>

        {/* close-up of the hot device and its first aid */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 146, height: 72, borderRadius: 16, backgroundColor: t.glass2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10, opacity: found ? 1 : 0 }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: phase === 'done' ? t.accentWash : 'rgba(229,72,77,0.25)' }}>
            {phase === 'alarm' ? (
              <Animated.View style={{ position: 'absolute', width: 46, height: 46, borderRadius: 23, backgroundColor: t.danger, opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }) }} />
            ) : null}
            <Icon name={device.icon} size={24} color={phase === 'done' ? t.accentText : t.dangerText} />
          </View>
          <View style={{ flex: 1 }}>
            <T size={13} weight="medium" numberOfLines={1}>{device.name}</T>
            <T size={11} soft numberOfLines={1}>{device.place}</T>
            <T size={20} weight="light" color={hot ? t.dangerText : t.text}>{temp.text}°C</T>
          </View>

          {a.action === 'fan' ? (
            <View style={{ width: 86, height: 60, alignItems: 'center', justifyContent: 'center' }}>
              <Animated.View style={{ opacity: air.fade, position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }}>
                {air.vals.map((v, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      position: 'absolute', left: 0, top: 14 + i * 14, width: 22, height: 3, borderRadius: 2, backgroundColor: WATER,
                      opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                      transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [20, -14] }) }],
                    }}
                  />
                ))}
              </Animated.View>
              <Animated.View style={{ marginLeft: 26, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
                <Icon name="fan" size={44} color={phase === 'alarm' ? t.soft : t.accentText} />
              </Animated.View>
            </View>
          ) : (
            <View style={{ width: 86, alignItems: 'center', gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Animated.View style={{ opacity: power }}>
                  <Icon name="flash" size={18} color={t.dangerText} />
                </Animated.View>
                <Icon name={phase === 'alarm' ? 'toggle-switch-outline' : 'toggle-switch-off-outline'} size={40} color={phase === 'alarm' ? t.text : t.accentText} />
              </View>
              <T size={11} soft>{amps.text} A</T>
            </View>
          )}
        </View>
        <DoneBadge show={phase === 'done'} />
      </View>
      <Caption
        phase={phase}
        lines={{
          alarm: found ? `${device.name} is too hot · ${heatDevices.length} points checked` : `Checking ${heatDevices.length} points…`,
          acting: a.action === 'fan' ? 'Cooling fan starting…' : 'Switching off this socket only…',
          checking: a.action === 'fan' ? 'Cool air in · temperature falling…' : 'Power off · plug cooling down…',
          done: a.action === 'fan' ? `Cooled to ${a.after}°C · power stayed on` : `Cooled to ${a.after}°C · rest of the house still has power`,
        }}
      />
    </View>
  );
}

// 🔥 Gas / 🚿 scald / 🪣 tank → a valve turns from open to closed and the danger fades.
const valveKinds = {
  gas: { icon: 'gas-cylinder', particle: 'rgba(170,180,195,0.85)', dir: -1, from: 38, to: 4, unit: '%', label: 'LPG level' },
  water: { icon: 'shower-head', particle: '#ff8f92', dir: 1, from: 51, to: 36, unit: '°C', label: 'water at the shower' },
  tank: { icon: 'storage-tank-outline', particle: WATER, dir: 1, from: 100, to: 95, unit: '%', label: 'tank level' },
} as const;

export function ValveAnim({ kind, playing, onDone }: Props & { kind: keyof typeof valveKinds }) {
  const t = useTheme();
  const k = valveKinds[kind];
  const c = hazardConfig[kind];
  const [phase, setPhase] = useState<Phase>('alarm');
  const turn = useRef(new Animated.Value(0)).current;
  const value = useCounter(k.from);
  const parts = useLoops(5, 900, phase === 'alarm' || phase === 'acting');

  useEffect(() => {
    if (!playing || phase !== 'alarm') return;
    setPhase('acting');
    Animated.timing(turn, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }).start(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      setPhase('checking');
      Animated.timing(value.v, { toValue: k.to, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
        setPhase('done');
        setTimeout(onDone, 700);
      });
    });
  }, [playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const pipeY = 112;
  const srcX = 196;
  const danger = phase === 'alarm' || phase === 'acting';

  return (
    <View>
      <View style={{ width: W, height: H, alignSelf: 'center' }}>
        <View style={{ position: 'absolute', left: 0, top: 0 }}>
          <T size={30} weight="light" color={danger ? t.dangerText : t.text}>{value.text}<T size={13} soft>{k.unit}</T></T>
          <T size={11} soft>{k.label}</T>
        </View>
        {/* pipe from valve to the source */}
        <View style={{ position: 'absolute', left: 10, width: srcX - 10, top: pipeY, height: 14, borderRadius: 7, backgroundColor: t.tick }} />
        {/* valve body + handle */}
        <View style={{ position: 'absolute', left: 52, top: pipeY - 17, width: 48, height: 48, borderRadius: 24, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              width: 62, height: 10, borderRadius: 5,
              backgroundColor: phase === 'done' || phase === 'checking' ? t.accent : t.danger,
              transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
            }}
          />
        </View>
        <T size={11} soft style={{ position: 'absolute', left: 46, top: pipeY + 40 }}>
          {phase === 'alarm' ? 'Valve open' : phase === 'acting' ? 'Closing…' : 'Valve closed'}
        </T>
        {/* source: gas cylinder / shower head / roof tank */}
        <View style={{ position: 'absolute', left: srcX, top: pipeY - 50, width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={k.icon} size={76} color={t.text} />
        </View>
        {/* leaking gas / hot water / overflow */}
        <Animated.View style={{ opacity: parts.fade }}>
          {parts.vals.map((v, i) => {
            const size = kind === 'gas' ? 16 : 6;
            return (
              <Animated.View
                key={i}
                style={{
                  position: 'absolute',
                  left: srcX + 26 + (i % 3) * 16,
                  top: k.dir < 0 ? pipeY - 56 : pipeY + 34,
                  width: size, height: kind === 'gas' ? size : 14, borderRadius: size / 2,
                  backgroundColor: k.particle,
                  opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.9, 0.7, 0] }),
                  transform: [
                    { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, 46 * k.dir] }) },
                    { scale: kind === 'gas' ? v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] }) : 1 },
                  ],
                }}
              />
            );
          })}
        </Animated.View>
        <DoneBadge show={phase === 'done'} />
      </View>
      <Caption
        phase={phase}
        lines={{
          alarm: c.alarm.detail,
          acting: `${c.action.button}…`,
          checking: 'Valve closed · checking it worked…',
          done: c.action.verified.replace('Verified: ', ''),
        }}
      />
    </View>
  );
}

export function FirstAidAnimation({ hazard, variant, playing, onDone }: Props & { hazard: HazardKey; variant?: string }) {
  if (hazard === 'leak') return <LeakAnim variant={variant} playing={playing} onDone={onDone} />;
  if (hazard === 'heat') return <HeatAnim variant={variant} playing={playing} onDone={onDone} />;
  return <ValveAnim kind={hazard} playing={playing} onDone={onDone} />;
}
