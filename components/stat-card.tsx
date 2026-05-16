import React from 'react';
import { View, type ViewProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface StatCardProps extends ViewProps {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-foreground',
  success: 'text-primary',
  warning: 'text-amber-500',
  destructive: 'text-destructive',
};

export function StatCard({ label, value, hint, icon, tone = 'default', className, ...props }: StatCardProps) {
  return (
    <View
      className={cn(
        'flex-1 min-w-[140px] rounded-2xl border border-border bg-card p-4',
        className,
      )}
      {...props}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="muted" size="xs" className="uppercase tracking-wider">
          {label}
        </Text>
        {icon}
      </View>
      <Text className={cn('text-2xl font-bold', toneClasses[tone])}>{value}</Text>
      {hint ? (
        <Text variant="muted" size="xs" className="mt-1">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
