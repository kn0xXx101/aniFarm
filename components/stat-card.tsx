import React from 'react';
import { View, type ViewProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface StatCardProps extends ViewProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-primary',
  warning: 'text-amber-400',
  destructive: 'text-destructive',
  info: 'text-accent',
};

const iconBgByTone: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-secondary',
  success: 'bg-primary/10 border border-primary/30',
  warning: 'bg-amber-400/10 border border-amber-400/30',
  destructive: 'bg-destructive/10 border border-destructive/30',
  info: 'bg-accent/10 border border-accent/30',
};

export function StatCard({ label, value, hint, icon, tone = 'default', className, ...props }: StatCardProps) {
  return (
    <View
      className={cn(
        'flex-1 min-w-[150px] rounded-2xl border border-border bg-card p-4',
        className,
      )}
      style={{
        shadowColor: '#00FFA3',
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 0 },
        elevation: 2,
      }}
      {...props}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="muted" size="xs" className="uppercase font-semibold" style={{ letterSpacing: 1.2 }}>
          {label}
        </Text>
        {icon ? (
          <View className={cn('size-9 rounded-xl items-center justify-center', iconBgByTone[tone])}>
            {icon}
          </View>
        ) : null}
      </View>
      <Text className={cn('text-2xl font-extrabold', toneClasses[tone])}>{value}</Text>
      {hint ? (
        <Text variant="muted" size="xs" className="mt-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
