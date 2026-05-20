import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLG, Stop, Line } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/design-system';
import type { AnalyticsPoint } from '@/types/domain';

interface Props {
  data: AnalyticsPoint[];
  height?: number;
  metric?: 'count' | 'mortality';
  stroke?: string;
  fillId?: string;
}

/** Lightweight area chart for analytics dashboards. SVG only, no chart deps. */
export function LineAreaChart({
  data,
  height = 180,
  metric = 'count',
  stroke = '#6BBF7B',
  fillId = 'area-grad',
}: Props) {
  const { paths, ticks, maxV, minV } = useMemo(() => {
    if (!data.length) return { paths: { line: '', area: '' }, ticks: [], maxV: 0, minV: 0 };
    const values = data.map((d) => d[metric]);
    const mxV = Math.max(...values);
    const mnV = Math.min(...values);
    const range = Math.max(1, mxV - mnV);
    const w = 100;
    const h = 100;
    const stepX = w / Math.max(1, data.length - 1);
    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = h - ((d[metric] - mnV) / range) * h;
      return { x, y };
    });
    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
    const area = `${line} L ${(points[points.length - 1]?.x ?? 0).toFixed(2)} ${h} L 0 ${h} Z`;
    const tk = [0, Math.floor(data.length / 2), data.length - 1].map((i) => ({
      idx: i,
      label: data[i]?.date.slice(5),
    }));
    return { paths: { line, area }, ticks: tk, maxV: mxV, minV: mnV };
  }, [data, metric]);

  return (
    <View style={{ height }}>
      <Svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
        <Defs>
          <SvgLG id={fillId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={stroke} stopOpacity={0.35} />
            <Stop offset="1" stopColor={stroke} stopOpacity={0} />
          </SvgLG>
        </Defs>
        <Line x1="0" y1="25" x2="100" y2="25" stroke="rgba(160,200,180,0.12)" strokeWidth={0.4} />
        <Line x1="0" y1="50" x2="100" y2="50" stroke="rgba(160,200,180,0.12)" strokeWidth={0.4} />
        <Line x1="0" y1="75" x2="100" y2="75" stroke="rgba(160,200,180,0.12)" strokeWidth={0.4} />
        <Path d={paths.area} fill={`url(#${fillId})`} />
        <Path d={paths.line} stroke={stroke} strokeWidth={0.7} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </Svg>
      <View className="flex-row justify-between px-1 mt-1">
        {ticks.map((t) => (
          <Text key={t.idx} style={{ color: COLORS.inkMuted, fontSize: 11 }}>
            {t.label}
          </Text>
        ))}
      </View>
      <View accessibilityLabel={`Range ${minV} to ${maxV}`} />
    </View>
  );
}
