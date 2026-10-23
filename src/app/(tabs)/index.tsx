import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { call, callGuard, sos } from '@/components/actions';
import { Room } from '@/components/room';
import { Avatar, Btn, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { care, home, renoItems, renoStages } from '@/data/demo';
import { GUARD } from '@/data/features';
import { useStore } from '@/data/store';
import { tourOn } from '@/data/tour';
import GuardHome from '@/guard/GuardHome';
import { useTheme } from '@/theme/theme';

// Home answers three questions at a glance, in plain words for every age:
// Is Mom OK? Who is coming today? How is my renovation going?

function greeting() {
  const h = tourOn ? 15 : new Date().getHours();
  if (h < 12) return 'Selamat pagi';
  if (h < 15) return 'Selamat tengah hari';
  if (h < 19) return 'Selamat petang';
  return 'Selamat malam';
}

function CareHome() {
  const t = useTheme();
  const { careState, visitors, reno, setDraft, scam } = useStore();
  const careMissed = careState === 'missed' || careState === 'guard';
  const crewOn = !!reno && reno.approved < renoStages.length;
  const item = reno ? renoItems.find((i) => i.id === reno.item) : undefined;
  const renoWaiting = crewOn && reno!.approved > 0;
  const today = new Date().toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long' });

  // One plain sentence that answers "is everything OK?"
  const needs = [careMissed && `${care.person} needs a check`, scam && 'Fake plumber in your estate', renoWaiting && 'Renovation photos to approve'].filter(Boolean) as string[];
  const summary = needs.length ? needs[0] : 'Everything is OK today';

  // Who is coming today: visitor passes plus the renovation crew.
  const coming = [
    ...(crewOn ? [{ key: 'crew', initials: reno!.pro.name.slice(0, 2).toUpperCase(), name: `${reno!.pro.name.split(' ')[0]} crew`, when: '9 am–6 pm', tag: 'Renovation' }] : []),
    ...visitors.map((v) => ({ key: v.id, initials: v.name.slice(0, 2).toUpperCase(), name: v.name.split(' (')[0], when: v.when.split(' · ').pop() ?? '', tag: v.kind })),
  ];

  return (
    <Screen>
      <Row gap={12}>
        <Pressable onPress={() => router.navigate('/me')} accessibilityLabel="My profile"><Avatar initials={home.initials} size={50} /></Pressable>
        <View style={{ flex: 1 }}>
          <T size={15} soft>{greeting()},</T>
          <T size={26} weight="medium" style={{ letterSpacing: -0.3, lineHeight: 31 }}>{home.owner}</T>
        </View>
        <View>
          <IconButton icon="bell-outline" label="Alerts" onPress={() => router.push('/alerts')} />
          {needs.length ? <View style={{ position: 'absolute', top: 2, right: 2, width: 11, height: 11, borderRadius: 6, backgroundColor: t.danger }} /> : null}
        </View>
      </Row>

      {/* The answer first */}
      <Pressable onPress={needs.length ? () => router.push('/alerts') : undefined}>
        <T size={14} soft>{today}</T>
        <Row gap={8} style={{ marginTop: 2 }}>
          <Icon name={careMissed || scam ? 'alert-circle' : needs.length ? 'information' : 'check-circle'} size={24} color={careMissed || scam ? t.dangerText : t.accentText} />
          <T size={22} weight="medium" style={{ flex: 1 }}>{summary}</T>
        </Row>
      </Pressable>

      {scam && (
        <Glass pad={16} wash="rgba(229,72,77,0.30)" onPress={() => router.push('/estate-alert')}>
          <Row gap={12}>
            <Bubble icon="radar" bg={t.danger} color="#fff" />
            <View style={{ flex: 1 }}>
              <T size={13} weight="semibold" color={t.dangerText}>ESTATE ALERT · scam radar</T>
              <T size={17} weight="medium" style={{ lineHeight: 22 }}>Fake "water plumber" tried 3 houses today</T>
              <T size={13} soft>Don't open your gate · tap to see where</T>
            </View>
            <Icon name="chevron-right" size={24} color={t.soft} />
          </Row>
        </Glass>
      )}

      {/* Big shortcuts for the most common jobs */}
      <Row gap={8}>
        <Shortcut icon="qrcode-plus" label="Visitor pass" onPress={() => router.push('/visitor')} />
        <Shortcut icon="camera-outline" label="Renovate" onPress={() => { setDraft({ item: 'wardrobe' }); router.push('/renovate/snap'); }} />
        <Shortcut icon="phone-outline" label={`Call ${care.person}`} onPress={() => call(care.person, care.address, careMissed ? 'noanswer' : 'call', 'MO')} />
        <Shortcut icon="shield-account-outline" label="Call guard" onPress={callGuard} />
      </Row>

      {/* Care: is Mom OK today? */}
      <Glass pad={18} onPress={() => router.push(careMissed ? '/care-alert' : '/care')} wash={careMissed ? 'rgba(229,72,77,0.28)' : undefined}>
        <Row gap={12}>
          <Bubble icon={careMissed ? 'heart-pulse' : 'heart-outline'} bg={careMissed ? t.danger : t.accentWash} color={careMissed ? '#fff' : t.accentText} />
          <View style={{ flex: 1 }}>
            <T size={13} soft>Care · Daily Signal</T>
            <T size={19} weight="medium">
              {careMissed ? `${care.person} needs a check` : careState === 'resolved' ? `${care.person} is OK · guard checked` : `${care.person} is OK today`}
            </T>
          </View>
          <Pill ok={!careMissed} label={careMissed ? 'Check' : 'OK'} />
        </Row>
        <Row style={{ marginTop: 14, justifyContent: 'space-between' }}>
          {care.signals.slice(0, 4).map((s, i) => (
            <View key={s.key} style={{ alignItems: 'center', width: '24%' }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: careMissed ? 'rgba(229,72,77,0.35)' : t.glass2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={19} color={careMissed ? t.dangerText : t.text} />
                {!careMissed && (
                  <View style={{ position: 'absolute', right: -3, bottom: -3, width: 17, height: 17, borderRadius: 9, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={11} color={t.onSolid} />
                  </View>
                )}
              </View>
              <T size={12} soft style={{ marginTop: 4, textAlign: 'center' }} numberOfLines={1}>{careMissed ? 'not yet' : ['Fridge', 'Light', 'Movement', 'Door'][i]}</T>
            </View>
          ))}
        </Row>
        {careMissed && <Btn label="See what to do" icon="arrow-right" onPress={() => router.push('/care-alert')} style={{ marginTop: 14 }} />}
      </Glass>

      {/* Pass: who is coming today? */}
      <Glass pad={18} onPress={() => router.navigate('/pass')}>
        <Row>
          <T size={13} soft style={{ flex: 1 }}>Pass · who is coming today</T>
          <T size={13} color={t.accentText}>Gate log ›</T>
        </Row>
        {coming.length ? (
          <View style={{ gap: 10, marginTop: 12 }}>
            {coming.slice(0, 3).map((c) => (
              <Row key={c.key} gap={12}>
                <Avatar initials={c.initials} size={40} />
                <View style={{ flex: 1 }}>
                  <T size={16} weight="medium">{c.name}</T>
                  <T size={13} soft>{c.when}</T>
                </View>
                <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 99, backgroundColor: c.key === 'crew' ? t.accentWash : t.glass2 }}>
                  <T size={12.5}>{c.tag}</T>
                </View>
              </Row>
            ))}
            {coming.length > 3 && <T size={13} soft>+ {coming.length - 3} more</T>}
          </View>
        ) : (
          <Row gap={12} style={{ marginTop: 12 }}>
            <Bubble icon="qrcode" bg={t.glass2} color={t.text} />
            <View style={{ flex: 1 }}>
              <T size={17} weight="medium">No one expected</T>
              <T size={13} soft>Make a pass so the guard knows</T>
            </View>
          </Row>
        )}
      </Glass>

      {/* Renovate: how is my renovation going? */}
      {reno && item ? (
        <Glass pad={14} wash={t.accentWash} onPress={() => router.push('/renovate/project')}>
          <Row gap={14}>
            <View style={{ width: 112 }}><Room item={reno.item} style={reno.style} after height={84} radius={14} /></View>
            <View style={{ flex: 1 }}>
              <T size={13} soft>Renovate · {reno.pro.name.split(' ')[0]}</T>
              <T size={17} weight="medium" style={{ lineHeight: 21 }}>{item.short}</T>
              <T size={13} soft>
                {reno.approved === 0 ? `Site visit ${reno.pro.earliest}`
                  : reno.approved >= renoStages.length ? 'Done · saved to your record'
                  : `Stage ${reno.approved + 1}: ${renoStages[reno.approved].name.toLowerCase()}`}
              </T>
            </View>
          </Row>
          <Row gap={5} style={{ marginTop: 12 }}>
            {renoStages.map((s, i) => (
              <View key={s.name} style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: i < reno.approved ? t.accentText : t.track }} />
            ))}
          </Row>
        </Glass>
      ) : (
        <Glass pad={14} onPress={() => { setDraft({ item: 'wardrobe' }); router.push('/renovate/snap'); }}>
          <Row gap={14}>
            <View style={{ width: 112 }}><Room item="wardrobe" after height={84} radius={14} /></View>
            <View style={{ flex: 1 }}>
              <T size={13} soft>Renovate</T>
              <T size={17} weight="medium" style={{ lineHeight: 21 }}>See a wardrobe in your room before you build</T>
            </View>
            <Icon name="chevron-right" size={24} color={t.soft} />
          </Row>
        </Glass>
      )}

      {/* Emergency: always at the bottom, big and clear */}
      <Glass pad={16} wash="rgba(229,72,77,0.42)" onPress={sos}>
        <Row gap={10} style={{ justifyContent: 'center' }}>
          <Icon name="alarm-light-outline" size={24} color={t.dangerText} />
          <T size={17} weight="semibold" color={t.dangerText}>SOS · alert guard and family</T>
        </Row>
      </Glass>

      <Pressable onPress={() => router.push('/demo')} style={{ alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 14 }}>
        <Row gap={6}>
          <Icon name="play-circle-outline" size={16} color={t.accentText} />
          <T size={14} color={t.accentText}>Demo controls</T>
        </Row>
      </Pressable>
    </Screen>
  );
}

// Big square shortcut: icon in a circle with a short label under it.
function Shortcut({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}>
      <Glass pad={10}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={22} color={t.onSolid} />
          </View>
          <T size={12.5} style={{ textAlign: 'center' }} numberOfLines={1}>{label}</T>
        </View>
      </Glass>
    </Pressable>
  );
}

function Bubble({ icon, bg, color }: { icon: string; bg: string; color: string }) {
  return (
    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={24} color={color} />
    </View>
  );
}

function Pill({ ok, label }: { ok: boolean; label: string }) {
  const t = useTheme();
  return (
    <View style={{ paddingVertical: 5, paddingHorizontal: 11, borderRadius: 99, backgroundColor: ok ? t.solid : t.danger }}>
      <Row gap={4}>
        <Icon name={ok ? 'check' : 'alert'} size={14} color={ok ? t.onSolid : '#fff'} />
        <T size={14} weight="semibold" color={ok ? t.onSolid : '#fff'}>{label}</T>
      </Row>
    </View>
  );
}

// Round 1 shows Care · Pass · Renovate. With GUARD on (top 10), the Guard home comes back.
export default GUARD ? GuardHome : CareHome;
