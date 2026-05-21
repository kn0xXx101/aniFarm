import { Redirect } from 'expo-router';

/** Legacy path — keep deep links working inside tabs. */
export default function ReportsRedirect() {
  return <Redirect href="/(tabs)/reports" />;
}
