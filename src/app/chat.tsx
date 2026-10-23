import { router } from 'expo-router';
import { goBack } from '@/components/actions';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Avatar, Glass, Icon, IconButton, Row, Screen, T } from '@/components/ui';
import { useStore } from '@/data/store';
import { useTheme } from '@/theme/theme';

type Msg = { me: boolean; text: string; time: string };

// Owner ↔ company messages about one job. Demo only: replies are written in, nothing is sent.
export default function ChatScreen() {
  const t = useTheme();
  const { job } = useStore();
  const company = job?.company.name.replace(' Sdn Bhd', '') ?? 'ABC Plumbing';
  const worker = job?.company.worker ?? 'Ahmad';
  const [msgs, setMsgs] = useState<Msg[]>([
    { me: false, text: `Hi, this is ${worker} from ${company}. Booking received for ${job?.slot.toLowerCase() ?? 'today 3–5 pm'}.`, time: '2:16 PM' },
    { me: false, text: job?.hazard ? 'Sentosa shows the leak is closed, so the house is safe until I arrive.' : 'I saw your photo. I will bring filler and matching paint.', time: '2:16 PM' },
  ]);
  const [draft, setDraft] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const send = (text: string) => {
    const x = text.trim();
    if (!x) return;
    setMsgs((m) => [...m, { me: true, text: x, time: 'now' }]);
    setDraft('');
    timer.current = setTimeout(() => setMsgs((m) => [...m, { me: false, text: 'Noted, thank you! I will message when I reach the gate.', time: 'now' }]), 1600);
  };

  return (
    <Screen tabBar={false}>
      <Row>
        <IconButton icon="arrow-left" label="Back" onPress={goBack} />
        <Avatar initials={job?.company.workerInitials ?? 'AR'} size={36} />
        <View style={{ flex: 1 }}>
          <T size={15} weight="medium">{worker} · {company}</T>
          <T size={11} soft>Verified company · replies in app</T>
        </View>
      </Row>

      <View style={{ gap: 8 }}>
        {msgs.map((m, i) => (
          <View key={i} style={{ alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
            <Glass wash={m.me ? t.accentWash : undefined} radius={18} pad={12}>
              <T size={14}>{m.text}</T>
            </Glass>
            <T size={10} soft style={{ marginTop: 2, textAlign: m.me ? 'right' : 'left' }}>{m.time}</T>
          </View>
        ))}
      </View>

      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        {['Gate code is on the pass', 'Please call when you arrive', 'Can you come earlier?'].map((q) => (
          <Pressable key={q} onPress={() => send(q)} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 99, backgroundColor: t.glass2 }}>
            <T size={12.5}>{q}</T>
          </Pressable>
        ))}
      </Row>

      <Glass radius={99} pad={6}>
        <Row gap={8}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => send(draft)}
            placeholder="Message"
            placeholderTextColor={t.soft}
            returnKeyType="send"
            style={{ flex: 1, color: t.text, fontFamily: 'Urbanist_400Regular', fontSize: 15, paddingHorizontal: 12, paddingVertical: 8 }}
          />
          <Pressable onPress={() => send(draft)} accessibilityLabel="Send" style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="send" size={18} color={t.onSolid} />
          </Pressable>
        </Row>
      </Glass>
      <T size={11} soft style={{ textAlign: 'center' }}>Demo chat · nothing is sent</T>
    </Screen>
  );
}
