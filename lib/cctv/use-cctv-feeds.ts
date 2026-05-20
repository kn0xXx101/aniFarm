/**
 * useCctvFeeds — manages WebSocket connections for all enabled feeds.
 *
 * Opens one socket per enabled feed, falls back to polling if WS fails,
 * and writes count updates into the CCTV store.
 *
 * Mount this once at the app level (e.g. in the CCTV tab) so connections
 * persist while the tab is active.
 */
import { useEffect, useRef } from 'react';
import { useCctvStore } from '@/lib/stores/cctv-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { openCctvSocket, startPolling, type CctvSocket } from '@/lib/api/cctv';
import type { CctvCountUpdate, CctvFeed } from '@/types/domain';

export function useCctvFeeds() {
  const feeds = useCctvStore((s) => s.feeds);
  const setFeedStatus = useCctvStore((s) => s.setFeedStatus);
  const applyCountUpdate = useCctvStore((s) => s.applyCountUpdate);
  const addSession = useSessionStore((s) => s.addSession);
  const houses = useFarmStore((s) => s.houses);
  const updateHouse = useFarmStore((s) => s.updateHouse);
  const farms = useFarmStore((s) => s.farms);

  // Track open sockets so we can close them on cleanup
  const socketsRef = useRef<Map<string, CctvSocket>>(new Map());
  const pollersRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    const enabledFeeds = feeds.filter((f) => f.enabled);
    const enabledIds = new Set(enabledFeeds.map((f) => f.id));

    // Close sockets for feeds that are now disabled or deleted
    socketsRef.current.forEach((socket, id) => {
      if (!enabledIds.has(id)) {
        socket.close();
        socketsRef.current.delete(id);
      }
    });
    pollersRef.current.forEach((stop, id) => {
      if (!enabledIds.has(id)) {
        stop();
        pollersRef.current.delete(id);
      }
    });

    // Open connections for newly enabled feeds
    for (const feed of enabledFeeds) {
      if (socketsRef.current.has(feed.id)) continue;

      setFeedStatus(feed.id, 'connecting');

      const handleCount = (update: CctvCountUpdate) => {
        applyCountUpdate(update);
        persistCountSession(feed, update);
      };

      const socket = openCctvSocket(
        feed.id,
        handleCount,
        (status) => {
          if (status === 'connected') {
            setFeedStatus(feed.id, 'online');
          } else if (status === 'disconnected') {
            setFeedStatus(feed.id, 'offline');
            // Start polling as fallback
            if (!pollersRef.current.has(feed.id)) {
              const stop = startPolling(feed, handleCount);
              pollersRef.current.set(feed.id, stop);
            }
          } else {
            setFeedStatus(feed.id, 'error');
          }
        },
      );

      socketsRef.current.set(feed.id, socket);
    }

    return () => {
      // Cleanup on unmount
      socketsRef.current.forEach((s) => s.close());
      pollersRef.current.forEach((stop) => stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds]);

  function persistCountSession(feed: CctvFeed, update: CctvCountUpdate) {
    // Save as a counting session so it appears in analytics + reports
    addSession({
      farmId: feed.farmId,
      houseId: feed.houseId,
      mode: 'cctv',
      count: update.count,
      avgConfidence: update.avgConfidence,
      durationMs: 0,
    });

    // Update house currentCount
    if (feed.houseId) {
      updateHouse(feed.houseId, {
        currentCount: update.count,
        lastCountedAt: update.countedAt,
      });

      // Evaluate alert thresholds
      const house = houses.find((h) => h.id === feed.houseId);
      const farm = farms.find((f) => f.id === feed.farmId);
      if (house && farm) {
        evaluateHouseAlerts({
          farmId: feed.farmId,
          farmName: farm.name,
          house: { ...house, currentCount: update.count, lastCountedAt: update.countedAt },
        });
      }
    }
  }
}
