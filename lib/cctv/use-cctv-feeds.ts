/**
 * Manages live CCTV counting for all enabled feeds (mock simulation or server WebSocket).
 */

import { useEffect, useRef } from 'react';
import { useCctvStore } from '@/lib/stores/cctv-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { evaluateCountResult } from '@/lib/alerts/evaluate-count';
import { openCctvSocket, startPolling, type CctvSocket } from '@/lib/api/cctv';
import { canUseFeature } from '@/lib/subscription/service';
import type { CctvCountUpdate, CctvFeed } from '@/types/domain';

export function useCctvFeeds() {
  const feeds = useCctvStore((s) => s.feeds);
  const cctvAllowed = canUseFeature('cctv').ok;
  const setFeedStatus = useCctvStore((s) => s.setFeedStatus);
  const applyCountUpdate = useCctvStore((s) => s.applyCountUpdate);
  const addSession = useSessionStore((s) => s.addSession);
  const houses = useFarmStore((s) => s.houses);
  const updateHouse = useFarmStore((s) => s.updateHouse);
  const farms = useFarmStore((s) => s.farms);

  const socketsRef = useRef<Map<string, CctvSocket>>(new Map());
  const pollersRef = useRef<Map<string, () => void>>(new Map());
  const lastDeadAlertRef = useRef<Map<string, number>>(new Map());
  const sessionTickRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!cctvAllowed) return undefined;

    const enabledFeeds = feeds.filter((f) => f.enabled);
    const enabledIds = new Set(enabledFeeds.map((f) => f.id));

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

    for (const feed of enabledFeeds) {
      if (socketsRef.current.has(feed.id)) continue;

      setFeedStatus(feed.id, 'connecting');

      const handleCount = (update: CctvCountUpdate) => {
        applyCountUpdate(update);
        persistCountSession(feed, update);
      };

      const socket = openCctvSocket(feed, handleCount, (status) => {
        if (status === 'connected') {
          setFeedStatus(feed.id, 'online');
        } else if (status === 'disconnected') {
          setFeedStatus(feed.id, 'offline');
          if (!pollersRef.current.has(feed.id)) {
            const stop = startPolling(feed, handleCount);
            pollersRef.current.set(feed.id, stop);
          }
        } else {
          setFeedStatus(feed.id, 'error');
        }
      });

      socketsRef.current.set(feed.id, socket);
    }

    return () => {
      socketsRef.current.forEach((s) => s.close());
      pollersRef.current.forEach((stop) => stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeds, cctvAllowed]);

  function persistCountSession(feed: CctvFeed, update: CctvCountUpdate) {
    const alive = update.aliveCount ?? update.count;
    const dead = update.deadCount ?? 0;
    const excluded = update.excludedHumans ?? 0;

    const tick = (sessionTickRef.current.get(feed.id) ?? 0) + 1;
    sessionTickRef.current.set(feed.id, tick);

    if (tick % 5 === 0) {
      addSession({
        farmId: feed.farmId,
        houseId: feed.houseId,
        mode: 'cctv',
        count: alive,
        aliveCount: alive,
        deadCount: dead,
        excludedHumans: excluded,
        avgConfidence: update.avgConfidence,
        durationMs: (feed.intervalSeconds ?? 30) * 1000 * 5,
        notes: 'CCTV auto-count',
      });
    }

    if (feed.houseId) {
      updateHouse(feed.houseId, {
        currentCount: alive,
        lastCountedAt: update.countedAt,
      });
    }

    const house = feed.houseId ? houses.find((h) => h.id === feed.houseId) : undefined;
    const farm = farms.find((f) => f.id === feed.farmId);

    const prevDead = lastDeadAlertRef.current.get(feed.id) ?? 0;
    const deadSpike = dead > prevDead;

    if (house && farm && deadSpike) {
      lastDeadAlertRef.current.set(feed.id, dead);
      evaluateCountResult({
        farmId: feed.farmId,
        farmName: farm.name,
        house: { ...house, currentCount: alive, lastCountedAt: update.countedAt },
        houseId: feed.houseId,
        mode: 'cctv',
        aliveCount: alive,
        deadCount: dead,
        excludedHumans: excluded,
        avgConfidence: update.avgConfidence,
      });
    }
  }
}
