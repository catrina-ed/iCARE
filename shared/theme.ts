// iCare theme — Hearth direction
// Warm, grounded, reassuring. Sage-led accent. Cocoa base.

export const COLORS = {
  // Backgrounds
  bg: '#29261b',        // Deep cocoa
  bgAlt: '#3d3a30',     // Slightly lighter
  bgElevated: '#4a4640',
  bgInverted: '#f6f4ef', // Warm cream

  // Text
  text: '#f6f4ef',      // Warm white
  textMuted: '#a89b8d', // Muted tan
  textInverted: '#29261b',

  // Primary accent (sage/teal)
  primary: '#6b9f8d',   // Sage green
  primaryLight: '#87b5a1',
  primaryDark: '#5a8c7b',

  // Secondary/danger (coral)
  danger: '#e8614f',    // Warm coral
  dangerLight: '#f08670',
  dangerDark: '#d45141',

  // Alert (amber)
  warn: '#d4a855',      // Warm amber
  warnLight: '#e0b869',
  warnDark: '#c99636',

  // Info (plum)
  info: '#8b6b9e',      // Muted plum
  infoLight: '#a885b3',
  infoDark: '#76558a',

  // States
  success: '#6b9f8d',   // Sage
  disabled: '#67625a',
  border: '#4a4640',
  borderAlt: '#3d3a30',

  // Semantic
  confidential: '#6b5073', // Plum wash for private entries
};

export const TYPOGRAPHY = {
  fontFamily: {
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    mono: '"Menlo", "Monaco", "Courier New", monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.1)',
};

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
};

// Utility to get alert color by severity
export function getAlertColor(severity: 'info' | 'warn' | 'danger') {
  switch (severity) {
    case 'danger': return COLORS.danger;
    case 'warn': return COLORS.warn;
    case 'info': return COLORS.info;
  }
}

// Utility to get role-based color
export function getRoleColor(role: string) {
  const colors: Record<string, string> = {
    admin: COLORS.danger,
    'co-caretaker': COLORS.primary,
    professional: COLORS.warn,
    recipient: COLORS.info,
    network: COLORS.textMuted,
  };
  return colors[role] || COLORS.primary;
}
