import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from 'shared/theme';

interface BadgeProps {
  label: string;
  color?: 'primary' | 'danger' | 'warn' | 'info' | 'success';
  size?: 'sm' | 'md';
}

export function Badge({ label, color = 'primary', size = 'sm' }: BadgeProps) {
  const colorMap = {
    primary: THEME.colors.primary,
    danger: THEME.colors.danger,
    warn: THEME.colors.warn,
    info: THEME.colors.info,
    success: THEME.colors.success,
  };

  const bgColor = colorMap[color];

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'md' && styles.md]}>
      <Text style={[styles.text, size === 'md' && styles.textMd]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.radius.full,
  },
  md: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  text: {
    fontSize: THEME.typography.fontSize.xs,
    fontWeight: '600',
    color: THEME.colors.bgInverted,
  },
  textMd: {
    fontSize: THEME.typography.fontSize.sm,
  },
});
