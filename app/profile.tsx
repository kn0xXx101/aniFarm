import { Redirect } from 'expo-router';

/** Legacy path — open profile inside tabs so the tab bar stays visible. */
export default function ProfileRedirect() {
  return <Redirect href="/(tabs)/profile" />;
}
