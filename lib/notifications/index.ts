import { isExpoGo } from '@/lib/expo-go';

let handlerInstalled = false;

async function getNotifications() {
  if (typeof window !== 'undefined' || isExpoGo()) return null;
  return import('expo-notifications');
}

async function ensureHandler() {
  if (handlerInstalled) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerInstalled = true;
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (typeof window !== 'undefined' || isExpoGo()) return null;

  const Notifications = await getNotifications();
  if (!Notifications) return null;

  await ensureHandler();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export async function scheduleLocalAlert(title: string, body: string) {
  if (typeof window !== 'undefined' || isExpoGo()) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await ensureHandler();
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
