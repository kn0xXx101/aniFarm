import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Tv2, Plus, Wifi, WifiOff, AlertCircle, Loader, Trash2, ToggleLeft, ToggleRight } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { MetricCube } from '@/components/neo3d/metric-cube';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { useCctvStore } from '@/lib/stores/cctv-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useCctvFeeds } from '@/lib/cctv/use-cctv-feeds';
import { DetectionSummary } from '@/components/count/detection-summary';
import { isMockApiMode } from '@/lib/api/config';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { IOS_GLASS } from '@/lib/ios-glass';
import type { CctvFeed, CctvFeedStatus } from '@/types/domain';

function StatusDot({ status }: { status?: CctvFeedStatus }) {
  const color =
    status === 'online'
      ? COLORS.primary
      : status === 'connecting'
        ? COLORS.warning
        : status === 'error'
          ? COLORS.danger
          : COLORS.inkMuted;

  const Icon =
    status === 'online' ? Wifi : status === 'connecting' ? Loader : status === 'error' ? AlertCircle : WifiOff;

  return (
    <View style={styles.statusRow}>
      <Icon size={13} color={color} />
      <Text style={[styles.statusLabel, { color }]}>{status ?? 'offline'}</Text>
    </View>
  );
}

function FeedCard({ feed }: { feed: CctvFeed }) {
  const runtime = useCctvStore((s) => s.runtime[feed.id]);
  const toggleFeed = useCctvStore((s) => s.toggleFeed);
  const deleteFeed = useCctvStore((s) => s.deleteFeed);
  const houses = useFarmStore((s) => s.houses);
  const farms = useFarmStore((s) => s.farms);

  const house = houses.find((h) => h.id === feed.houseId);
  const farm = farms.find((f) => f.id === feed.farmId);
  const lastCount = runtime?.lastAliveCount ?? runtime?.lastCount;
  const lastDead = runtime?.lastDeadCount ?? 0;
  const lastExcluded = runtime?.lastExcludedHumans ?? 0;
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
      style={styles.feedCard}
    >
      <View style={styles.feedHeader}>
        <View style={styles.feedTitleRow}>
          <View style={[styles.feedIcon, feed.enabled && styles.feedIconActive]}>
            <Tv2 size={18} color={feed.enabled ? COLORS.secondary : COLORS.inkMuted} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={TYPE.label} numberOfLines={1}>
              {feed.name}
            </Text>
            <Text style={[TYPE.caption, { marginTop: 2 }]} numberOfLines={1}>
              {farm?.name}
              {house ? ` · ${house.name}` : ''}
            </Text>
          </View>
        </View>
        <StatusDot status={feed.enabled ? runtime?.status : undefined} />
      </View>

      {feed.enabled && lastCount != null ? (
        <View style={styles.countBlock}>
          <DetectionSummary
            variant="compact"
            aliveCount={lastCount}
            deadCount={lastDead}
            excludedHumans={lastExcluded}
          />
          <View style={styles.countMeta}>
            {confidence != null ? (
              <Text style={TYPE.caption}>{(confidence * 100).toFixed(0)}% model confidence</Text>
            ) : (
              <View />
            )}
            {timeAgo ? <Text style={TYPE.caption}>{timeAgo}</Text> : null}
          </View>
          {lastDead > 0 ? (
            <Text style={styles.deadFlag}>Dead animals flagged — check pen and alerts</Text>
          ) : null}
        </View>
      ) : feed.enabled ? (
        <View style={styles.waitingBox}>
          <Text style={TYPE.bodySecondary}>Waiting for first count…</Text>
        </View>
      ) : null}

      <Text style={[TYPE.caption, styles.streamUrl]} numberOfLines={1}>
        {feed.streamUrl}
      </Text>

      <View style={styles.actions}>
        <IosGlassSurface
          variant="glass"
          radius={IOS_GLASS.radiusMd}
          padding={0}
          onPress={() => toggleFeed(feed.id)}
          style={{ flex: 1 }}
          contentStyle={styles.toggleInner}
        >
          {feed.enabled ? (
            <ToggleRight size={16} color={COLORS.primary} />
          ) : (
            <ToggleLeft size={16} color={COLORS.inkMuted} />
          )}
          <Text style={[TYPE.label, { color: feed.enabled ? COLORS.primary : COLORS.inkMuted, fontSize: 13 }]}>
            {feed.enabled ? 'Enabled' : 'Disabled'}
          </Text>
        </IosGlassSurface>

        <IosGlassSurface
          variant="glass"
          radius={IOS_GLASS.radiusMd}
          padding={0}
          onPress={() => deleteFeed(feed.id)}
          contentStyle={styles.deleteInner}
        >
          <Trash2 size={16} color={COLORS.danger} />
        </IosGlassSurface>
      </View>
    </Card3D>
  );
}

function EmptyFeeds() {
  return (
    <Card3D variant="glass" glowColor={COLORS.secondary} style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Tv2 size={32} color={COLORS.secondary} />
      </View>
      <Text style={[TYPE.titleSm, { textAlign: 'center' }]}>No CCTV feeds yet</Text>
      <Text style={[TYPE.bodySecondary, styles.emptyText]}>
        Connect barn, pen, or paddock cameras. Live AI counts herds and flocks, flags mortality, and ignores people in
        frame.
      </Text>
    </Card3D>
  );
}

export default function CctvTab() {
  const router = useRouter();
  const { horizontal } = useScreenInsets(true);
  const feeds = useCctvStore((s) => s.feeds);

  useCctvFeeds();

  const onlineCount = useCctvStore((s) => Object.values(s.runtime).filter((r) => r.status === 'online').length);
  const enabledCount = feeds.filter((f) => f.enabled).length;

  const handleAdd = useCallback(() => {
    router.push('/cctv/add-feed');
  }, [router]);

  return (
    <NeoScreen scroll withTabs padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar
        title="CCTV"
        showBack={false}
        showAlerts
        right={
          <IosGlassSurface variant="glass" radius={12} padding={0} onPress={handleAdd} contentStyle={styles.addBtn}>
            <Plus size={18} color={COLORS.secondary} />
          </IosGlassSurface>
        }
      />

      <StaggerIn index={0}>
        <SectionHeading
          eyebrow="Live feeds"
          title="Herd & flock monitoring"
          description={
            feeds.length > 0
              ? `${feeds.length} feed${feeds.length !== 1 ? 's' : ''} · ${onlineCount} online${isMockApiMode() ? ' · demo' : ''}`
              : 'Continuous AI: alive totals, mortality flags, staff excluded'
          }
        />
      </StaggerIn>

      {feeds.length > 0 ? (
        <StaggerIn index={1}>
          <View style={styles.metricRow}>
            <View style={styles.metricCell}>
              <MetricCube
                value={String(feeds.length)}
                label="Total feeds"
                icon={<Tv2 size={18} color={COLORS.secondary} />}
                glowColor={COLORS.secondary}
              />
            </View>
            <View style={styles.metricCell}>
              <MetricCube
                value={String(onlineCount)}
                label="Online now"
                icon={<Wifi size={18} color={COLORS.primary} />}
                glowColor={COLORS.primary}
              />
            </View>
            <View style={styles.metricCell}>
              <MetricCube
                value={String(enabledCount)}
                label="Enabled"
                icon={<ToggleRight size={18} color={COLORS.accent} />}
                glowColor={COLORS.accent}
              />
            </View>
          </View>
        </StaggerIn>
      ) : null}

      {feeds.length === 0 ? (
        <StaggerIn index={2}>
          <EmptyFeeds />
        </StaggerIn>
      ) : (
        feeds.map((feed, i) => (
          <StaggerIn key={feed.id} index={i + 2}>
            <FeedCard feed={feed} />
          </StaggerIn>
        ))
      )}

      <StaggerIn index={feeds.length + 3}>
        <CountPillButton
          label={feeds.length === 0 ? 'Add first feed' : 'Add CCTV feed'}
          icon={Plus}
          variant="secondary"
          size="lg"
          onPress={handleAdd}
          style={styles.addCta}
        />
      </StaggerIn>
    </NeoScreen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusLabel: {
    fontFamily: FONTS.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedCard: {
    marginBottom: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  feedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  feedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedIconActive: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: COLORS.secondary,
  },
  countBlock: {
    marginBottom: 12,
    gap: 10,
  },
  countMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadFlag: {
    color: COLORS.danger,
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  waitingBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  streamUrl: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    minHeight: 44,
  },
  deleteInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.secondaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metricCell: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 100,
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCta: {
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
  },
});
