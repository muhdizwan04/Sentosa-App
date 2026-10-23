import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from '@/theme/theme';

// Home is the middle tab, but the app still opens on it.
export const unstable_settings = { initialRouteName: 'index' };

// Native tab bar: on iOS 26 this is Apple's own Liquid Glass bar.
export default function TabsLayout() {
  const t = useTheme();
  return (
    <NativeTabs tintColor={t.scheme === 'dark' ? '#ffffff' : t.solid}>
      <NativeTabs.Trigger name="fix">
        <NativeTabs.Trigger.Icon sf="hammer" md="handyman" />
        <NativeTabs.Trigger.Label>Renovate</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pass">
        <NativeTabs.Trigger.Icon sf="qrcode" md="qr_code" />
        <NativeTabs.Trigger.Label>Pass</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="care">
        <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} md="favorite" />
        <NativeTabs.Trigger.Label>Care</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Icon sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }} md="person" />
        <NativeTabs.Trigger.Label>Me</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
