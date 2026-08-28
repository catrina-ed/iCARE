import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, getAlertColor } from 'shared/theme';

interface AlertProps {
  type: 'info' | 'warn' | 'danger';
  title: string;
  subtitle?: string;
}

export function Alert({ type, title, subtitle }: AlertProps) {
  const color = getAlertColor(type);

  return (
    <View style={[styles.alert, { borderLeftColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    backgroundColor: THEME.colors.bgAlt,
    borderLeftWidth: 4,
    padding: THEME.spacing.lg,
    borderRadius: THEME.radius.md,
    marginBottom: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textMuted,
    lineHeight: THEME.typography.lineHeight.normal * THEME.typography.fontSize.sm,
  },
});
