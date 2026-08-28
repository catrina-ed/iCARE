import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from 'shared/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  raised?: boolean;
  padded?: boolean;
}

export function Card({ children, style, raised = false, padded = true }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        raised && styles.raised,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.bgElevated,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  padded: {
    padding: THEME.spacing.lg,
  },
});
