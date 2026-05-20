import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions, Platform } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bird,
  Bell,
  FileText,
  CreditCard,
  Shield,
  User,
  Settings as SettingsIcon,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { SUNRISE_GRADIENT, NEON } from '@/lib/constants';

interface DrawerCtxValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const DrawerCtx = createContext<DrawerCtxValue | null>(null);

export function useDrawer() {
  const ctx = useContext(DrawerCtx);
  if (!ctx) throw new Error('useDrawer must be used inside <DrawerProvider/>');
  return ctx;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  href: Href;
  badge?: number;
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(320, width * 0.85);

  const translate = useSharedValue(-drawerWidth);
  const overlay = useSharedValue(0);

  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const unread = useAlertStore((s) => s.alerts.filter((a) => !a.read).length);

  const open = useCallback(() => {
    setMounted(true);
    setIsOpen(true);
    translate.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    overlay.value = withTiming(1, { duration: 260 });
  }, [overlay, translate]);

  const close = useCallback(() => {
    translate.value = withTiming(-drawerWidth, {
      duration: 220,
      easing: Easing.in(Easing.cubic),
    });
    overlay.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
        runOnJS(setMounted)(false);
      }
    });
  }, [drawerWidth, overlay, translate]);

  // keep translate in sync with width changes while closed
  useEffect(() => {
    if (!isOpen) translate.value = -drawerWidth;
  }, [drawerWidth, isOpen, translate]);

  const ctxValue = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translate.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlay.value * 0.55,
    pointerEvents: overlay.value > 0.01 ? ('auto' as const) : ('none' as const),
  }));

  const items: NavItem[] = [
    { label: 'My farms', icon: Bird, href: '/(tabs)/farms' as Href },
    { label: 'Alerts', icon: Bell, href: '/(tabs)/alerts' as Href, badge: unread },
    { label: 'Reports', icon: FileText, href: '/reports' as Href },
    { label: 'Subscription', icon: CreditCard, href: '/subscription' as Href },
    { label: 'Admin console', icon: Shield, href: '/admin' as Href },
    { label: 'Profile', icon: User, href: '/profile' as Href },
  ];

  const handleNav = (href: Href) => {
    close();
    // delay so animation feels smooth
    setTimeout(() => router.push(href), 120);
  };

  const handleSignOut = () => {
    close();
    setTimeout(() => {
      signOut();
      router.replace('/(auth)/login');
    }, 120);
  };

  return (
    <DrawerCtx.Provider value={ctxValue}>
      {children}
      {mounted ? (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
          }}
          pointerEvents="box-none"
        >
          {/* dim overlay */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                inset: 0,
                backgroundColor: '#000',
              },
              overlayStyle,
            ]}
          >
            <Pressable
              onPress={close}
              style={{ flex: 1 }}
              accessibilityLabel="Close menu"
            />
          </Animated.View>

          {/* drawer panel */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: drawerWidth,
              },
              drawerStyle,
            ]}
          >
            <View className="flex-1" style={{ backgroundColor: NEON.bgDeep }}>
              {/* Hero header with gradient */}
              <View className="overflow-hidden">
                <LinearGradient
                  colors={[...SUNRISE_GRADIENT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingBottom: 28 }}
                >
                  <SafeAreaView edges={['top']}>
                    <View className="px-5 pt-2 flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View className="size-9 rounded-2xl bg-black/30 items-center justify-center border border-white/20">
                          <Sparkles size={18} color="white" />
                        </View>
                        <Text className="text-white font-bold text-lg" style={{ letterSpacing: 1 }}>POULTRA AI</Text>
                      </View>
                      <Pressable
                        onPress={close}
                        className="size-10 rounded-full bg-black/30 items-center justify-center border border-white/20"
                        accessibilityLabel="Close menu"
                      >
                        <X size={18} color="white" />
                      </Pressable>
                    </View>

                    <View className="px-5 mt-6 flex-row items-center gap-3">
                      <View
                        className="size-14 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: NEON.bgDeep,
                          borderWidth: 2,
                          borderColor: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        <Text className="text-2xl font-bold" style={{ color: NEON.green }}>
                          {user?.name?.[0]?.toUpperCase() ?? 'P'}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg" numberOfLines={1}>
                          {user?.name ?? 'Operator'}
                        </Text>
                        <Text className="text-white/85 text-sm" numberOfLines={1}>
                          {user?.email ?? 'guest@poultra.ai'}
                        </Text>
                      </View>
                    </View>
                  </SafeAreaView>
                </LinearGradient>
              </View>

              {/* nav items */}
              <View className="px-3 pt-4 flex-1">
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Pressable
                      key={it.label}
                      onPress={() => handleNav(it.href)}
                      className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-secondary min-h-[52px]"
                      accessibilityRole="button"
                      accessibilityLabel={it.label}
                    >
                      <View
                        className="size-10 rounded-xl items-center justify-center border"
                        style={{
                          backgroundColor: 'rgba(0,255,163,0.08)',
                          borderColor: 'rgba(0,255,163,0.25)',
                        }}
                      >
                        <Icon size={18} color={NEON.green} />
                      </View>
                      <Text className="flex-1 font-semibold">{it.label}</Text>
                      {it.badge && it.badge > 0 ? (
                        <View
                          className="rounded-full min-w-[22px] h-[22px] px-1.5 items-center justify-center"
                          style={{ backgroundColor: NEON.pink }}
                        >
                          <Text className="text-[11px] font-bold text-white">
                            {it.badge > 9 ? '9+' : it.badge}
                          </Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}

                <View className="h-px bg-border my-3 mx-3" />

                <Pressable
                  onPress={() => handleNav('/profile' as Href)}
                  className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-secondary min-h-[52px]"
                >
                  <View
                    className="size-10 rounded-xl items-center justify-center border"
                    style={{
                      backgroundColor: 'rgba(0,229,255,0.08)',
                      borderColor: 'rgba(0,229,255,0.25)',
                    }}
                  >
                    <SettingsIcon size={18} color={NEON.cyan} />
                  </View>
                  <Text className="flex-1 font-semibold">Settings</Text>
                </Pressable>

                <Pressable
                  onPress={handleSignOut}
                  className="flex-row items-center gap-3 px-3 py-3 rounded-2xl active:bg-destructive/10 min-h-[52px]"
                >
                  <View className="size-10 rounded-xl bg-destructive/10 border border-destructive/30 items-center justify-center">
                    <LogOut size={18} color="hsl(0 90% 62%)" />
                  </View>
                  <Text className="flex-1 font-semibold text-destructive">Sign out</Text>
                </Pressable>
              </View>

              <SafeAreaView edges={['bottom']}>
                <View className="px-5 py-3 border-t border-border">
                  <Text variant="muted" size="xs" style={{ letterSpacing: 1 }}>
                    POULTRA AI · v1.0.0 · {Platform.OS.toUpperCase()}
                  </Text>
                </View>
              </SafeAreaView>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </DrawerCtx.Provider>
  );
}
