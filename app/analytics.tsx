import { Redirect } from 'expo-router';

/** Legacy path — Insights lives in tabs. */
export default function AnalyticsRedirect() {
  return <Redirect href="/(tabs)/analytics" />;
}
