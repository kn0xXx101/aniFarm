/**
 * Network connectivity — NetInfo on native, navigator.onLine on web.
 */

import { useEffect, useState } from 'react';

type Unsubscribe = () => void;

let currentOnline = true;
const listeners = new Set<(online: boolean) => void>();

function setOnline(online: boolean) {
  if (online === currentOnline) return;
  currentOnline = online;
  listeners.forEach((l) => l(online));
}

function subscribe(listener: (online: boolean) => void): Unsubscribe {
  listeners.add(listener);
  listener(currentOnline);
  return () => listeners.delete(listener);
}

// Web
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  currentOnline = navigator.onLine !== false;
  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));
}

// Native — NetInfo
if (typeof window === 'undefined') {
  void import('@react-native-community/netinfo')
    .then((NetInfo) => {
      const unsub = NetInfo.default.addEventListener((state) => {
        setOnline(state.isConnected !== false && state.isInternetReachable !== false);
      });
      void NetInfo.default.fetch().then((state) => {
        setOnline(state.isConnected !== false);
      });
      return unsub;
    })
    .catch(() => {
      // Dev without native module — stay optimistic
      setOnline(true);
    });
}

export function getIsOnline(): boolean {
  return currentOnline;
}

export function useOnlineStatus(): boolean {
  const [online, setOnlineState] = useState(currentOnline);
  useEffect(() => subscribe(setOnlineState), []);
  return online;
}

export async function waitForOnline(timeoutMs = 30_000): Promise<boolean> {
  if (currentOnline) return true;
  return new Promise((resolve) => {
    const unsub = subscribe((online) => {
      if (online) {
        unsub();
        resolve(true);
      }
    });
    setTimeout(() => {
      unsub();
      resolve(false);
    }, timeoutMs);
  });
}
