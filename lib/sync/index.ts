/**
 * Sync module — connectivity, queue, hooks.
 */

import { useEffect, useState } from 'react';
import {
  processSyncQueue,
  subscribeSyncQueue,
  getSyncQueueState,
  type SyncQueueState,
} from '@/lib/sync/queue';
import { useOnlineStatus } from '@/lib/sync/connectivity';

export { useOnlineStatus, getIsOnline, waitForOnline } from '@/lib/sync/connectivity';
export {
  processSyncQueue,
  subscribeSyncQueue,
  getSyncQueueState,
  type SyncQueueResult,
  type SyncQueueState,
} from '@/lib/sync/queue';

/** Reflects queue runner state for profile / dashboard chips. */
export function useSyncStatus() {
  const [state, setState] = useState<SyncQueueState>(getSyncQueueState);

  useEffect(() => subscribeSyncQueue(setState), []);
  return state;
}

/** Runs the upload queue when connectivity returns and auto-sync is enabled. */
export function useAutoSync(enabled: boolean) {
  const online = useOnlineStatus();

  useEffect(() => {
    if (enabled && online) {
      void processSyncQueue();
    }
  }, [enabled, online]);
}
