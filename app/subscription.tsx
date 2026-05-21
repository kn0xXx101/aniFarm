import { Redirect } from 'expo-router';

/** Legacy path — keep deep links working inside tabs. */
export default function SubscriptionRedirect() {
  return <Redirect href="/(tabs)/subscription" />;
}
