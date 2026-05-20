import { Link, Stack } from 'expo-router';

import { Button } from '@/components/ui/button';
import { AppScreen } from '@/components/shell/app-screen';
import { EmptyState } from '@/components/layout/empty-state';
import { COLORS } from '@/lib/design-system';
import { MapPinOff } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreen withTabs={false}>
        <EmptyState
          icon={<MapPinOff size={28} color={COLORS.primary} />}
          title="Page not found"
          description="This screen doesn't exist."
        />
        <Link href="/" asChild>
          <Button className="mt-6 rounded-xl">Go home</Button>
        </Link>
      </AppScreen>
    </>
  );
}
