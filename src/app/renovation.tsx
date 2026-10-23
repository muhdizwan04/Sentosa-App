import { Redirect } from 'expo-router';

// Old renovation page: the new flow starts with "Snap a space".
export default function RenovationScreen() {
  return <Redirect href="/renovate/snap" />;
}
