import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from 'shared/theme';
import type { DoseStatus } from '../../shared/types';

interface DoseStatusIndicatorProps {
  status: DoseStatus;
  size?: 'sm' | 'md';
}

export function DoseStatusIndicator({ status, size = 'md' }: DoseStatusIndicatorProps) {
  const statusConfig: Record<DoseStatus, { label: string; color: string }> = {
    given: { label: 'Given', color: THEME.colors.success },
    upcoming: { label: 'Upcoming', color: THEME.colors.textMuted },
    due: { label: 'Due', color: THEME.colors.warn },
    missed: { label: 'Missed', color: THEME.colors.danger },
    skipped: { label: 'Skipped', color: THEME.colors.textMuted },
  };

  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.status,
        { backgroundColor: config.color + '20', borderColor: config.color },
        size === 'sm' && styles.sm,
      ]}
    >
      <Text style={[styles.text, { color: config.color }, size === 'sm' && styles.textSm]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    borderWidth: 1,
    borderRadius: THEME.radius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  sm: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
  },
  text: {
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: '500',
  },
  textSm: {
    fontSize: THEME.typography.fontSize.xs,
  },
});
