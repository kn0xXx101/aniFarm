/**
 * Network/offline awareness. Wraps NetInfo if available, falls back to "always online"
 * for web/Expo Go. Pending sessions are auto-synced on reconnect.
 */

import { useEffect, useState } from 'react';
import { useSessionStore } from '@/lib/stores/session-store';

let netListeners: Array<(online: boolean) => void> = [];
let currentOnline = true;

// Try NetInfo if installed, otherwise stay optimistic.
type NetInfoModule = {
  addEventListener?: (cb: (s: { isConnected: boolean | null }) => void) => () => void;
};

let NetInfo: NetInfoModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  NetInfo = require('@react-native-community/netinfo');
} catch {
  NetInfo = null;
}

if (NetInfo?.addEventListener) {
  NetInfo.addEventListener((s) => {
    const online = s.isConnected !== false;
    if (online !== currentOnline) {
      currentOnline = online;
      netListeners.forEach((l) => l(online));
    }
  });
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(currentOnline);
  useEffect(() => {
    const listener = (v: boolean) => setOnline(v);
    netListeners.push(listener);
    return () => {
      netListeners = netListeners.filter((l) => l !== listener);
    };
  }, []);
  return online;
}

/** Hook that runs `syncPending` whenever connectivity flips on. */
export function useAutoSync(enabled: boolean) {
  const online = useOnlineStatus();
  const syncPending = useSessionStore((s) => s.syncPending);
  useEffect(() => {
    if (enabled && online) {
      void syncPending();
    }
  }, [enabled, online, syncPending]);
}
