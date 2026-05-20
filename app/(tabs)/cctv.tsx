import { useCallback } from 'react';
import { View, Pressable, FlatList, type ListRenderItemInfo } from 'react-native';
import { useRouter } from 'expo-router';
import { Tv2, Plus, Wifi, WifiOff, AlertCircle, Loader, Trash2, ToggleLeft, ToggleRight } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { Card3D } from '@/components/ui/card-3d';
import { useCctvStore } from '@/lib/stores/cctv-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useCctvFeeds } from '@/lib/cctv/use-cctv-feeds';
import { COLORS, FONTS } from '@/lib/design-system';
import type { CctvFeed, CctvFeedStatus } from '@/types/domain';

// ── Status indicator ──────────────────────────────────────────────────────────

function StatusDot({ status }: { status?: CctvFeedStatus }) {
  const color =
    status === 'online' ? COLORS.primary :
    status === 'connecting' ? COLORS.warning :
    status === 'error' ? COLORS.danger :
    COLORS.inkMuted;

  const Icon =
    status === 'online' ? Wifi :
    status === 'connecting' ? Loader :
    status === 'error' ? AlertCircle :
    WifiOff;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon size={13} color={color} />
      <Text style={{ fontFamily: FONTS.semibold, color, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {status ?? 'offline'}
      </Text>
    </View>
  );
}

// ── Feed card ─────────────────────────────────────────────────────────────────

function FeedCard({ feed }: { feed: CctvFeed }) {
  const runtime = useCctvStore((s) => s.runtime[feed.id]);
  const toggleFeed = useCctvStore((s) => s.toggleFeed);
  const deleteFeed = useCctvStore((s) => s.deleteFeed);
  const houses = useFarmStore((s) => s.houses);
  const farms = useFarmStore((s) => s.farms);

  const house = houses.find((h) => h.id === feed.houseId);
  const farm = farms.find((f) => f.id === feed.farmId);
  const lastCount = runtime?.lastCount;
  const lastAt = runtime?.lastCountedAt;
  const confidence = runtime?.avgConfidence;

  const timeAgo = lastAt
    ? (() => {
        const diff = Math.floor((Date.now() - lastAt) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
      })()
    : null;

  return (
    <Card3D
      variant={feed.enabled ? 'neon' : 'glass'}
      glowColor={feed.enabled ? COLORS.secondary : COLORS.inkMuted}
      style={{ marginBottom: 12 }}
    >
      {/* Top row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: feed.enabled ? COLORS.secondaryLight : COLORS.surfaceMuted,
              borderWidth: 1,
              borderColor: feed.enabled ? COLORS.secondary : COLORS.borderSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Tv2 size={18} color={feed.enabled ? COLORS.secondary : COLORS.inkMuted} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 15 }}
              numberOfLines={1}
            >
              {feed.name}
            </Text>
            <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {farm?.name}{house ? ` · ${house.name}` : ''}
            </Text>
          </View>
        </View>
        <StatusDot status={feed.enabled ? runtime?.status : undefined} />
      </View>

      {/* Count display */}
      {feed.enabled && lastCount != null ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            backgroundColor: COLORS.surfaceMuted,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.inkMuted, fontSize: 11, fontFamily: FONTS.medium, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Last count
            </Text>
            <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.primary, fontSize: 28, lineHeight: 32 }}>
              {lastCount.toLocaleString()}
            </Text>
            <Text style={{ color: COLORS.inkMuted, fontSize: 11, marginTop: 2 }}>birds</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {confidence != null ? (
              <View>
                <Text style={{ color: COLORS.inkMuted, fontSize: 11, fontFamily: FONTS.medium }}>Confidence</Text>
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.secondary, fontSize: 16 }}>
                  {(confidence * 100).toFixed(0)}%
                </Text>
              </View>
            ) : null}
            {timeAgo ? (
              <Text style={{ color: COLORS.inkMuted, fontSize: 11, marginTop: 6 }}>{timeAgo}</Text>
            ) : null}
          </View>
        </View>
      ) : feed.enabled ? (
        <View
          style={{
            backgroundColor: COLORS.surfaceMuted,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: COLORS.inkMuted, fontSize: 13 }}>
            Waiting for first count…
          </Text>
        </View>
      ) : null}

      {/* Stream URL */}
      <Text style={{ color: COLORS.inkMuted, fontSize: 11, fontFamily: FONTS.regular, marginBottom: 12 }} numberOfLines={1}>
        {feed.streamUrl}
      </Text>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={() => toggleFeed(feed.id)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            paddingVertical: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: feed.enabled ? COLORS.border : COLORS.borderSoft,
            backgroundColor: feed.enabled ? COLORS.primaryLight : COLORS.surfaceMuted,
          }}
          accessibilityLabel={feed.enabled ? 'Disable feed' : 'Enable feed'}
        >
          {feed.enabled
            ? <ToggleRight size={16} color={COLORS.primary} />
            : <ToggleLeft size={16} color={COLORS.inkMuted} />}
          <Text style={{
            fontFamily: FONTS.semibold,
            color: feed.enabled ? COLORS.primary : COLORS.inkMuted,
            fontSize: 13,
          }}>
            {feed.enabled ? 'Enabled' : 'Disabled'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => deleteFeed(feed.id)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: COLORS.dangerLight,
            backgroundColor: COLORS.dangerLight,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Delete feed"
        >
          <Trash2 size={16} color={COLORS.danger} />
        </Pressable>
      </View>
    </Card3D>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyFeeds({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          backgroundColor: COLORS.secondaryLight,
          borderWidth: 1,
          borderColor: COLORS.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Tv2 size={32} color={COLORS.secondary} />
      </View>
      <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>
        No CCTV feeds yet
      </Text>
      <Text style={{ color: COLORS.inkMuted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 28 }}>
        Connect your barn cameras. The server counts birds automatically — no phone needed in the barn.
      </Text>
      <Pressable
        onPress={onAdd}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: 14,
          backgroundColor: COLORS.secondary,
        }}
      >
        <Plus size={18} color={COLORS.canvas} />
        <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas, fontSize: 15 }}>
          Add first feed
        </Text>
      </Pressable>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CctvTab() {
  const router = useRouter();
  const feeds = useCctvStore((s) => s.feeds);

  // Start WebSocket connections for all enabled feeds
  useCctvFeeds();

  const onlineCount = useCctvStore((s) =>
    Object.values(s.runtime).filter((r) => r.status === 'online').length,
  );

  const handleAdd = useCallback(() => {
    router.push('/cctv/add-feed');
  }, [router]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CctvFeed>) => <FeedCard feed={item} />,
    [],
  );

  return (
    <NeoScreen>
      <TopBar
        title="CCTV"
        showBack={false}
        showAlerts
        right={
          <Pressable
            onPress={handleAdd}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: COLORS.secondaryLight,
              borderWidth: 1,
              borderColor: COLORS.secondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Add CCTV feed"
          >
            <Plus size={18} color={COLORS.secondary} />
          </Pressable>
        }
      />

      <SectionHeading
        eyebrow="Live feeds"
        title="Camera monitoring"
        description={
          feeds.length > 0
            ? `${feeds.length} feed${feeds.length !== 1 ? 's' : ''} · ${onlineCount} online`
            : 'Server-side AI counting from your barn cameras'
        }
      />

      {feeds.length === 0 ? (
        <EmptyFeeds onAdd={handleAdd} />
      ) : (
        <FlatList
          data={feeds}
          renderItem={renderItem}
          keyExtractor={(f) => f.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </NeoScreen>
  );
}
