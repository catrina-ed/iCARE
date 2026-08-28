// iCare theme — Hearth
// Warm, grounded, reassuring. Sage-led accent on a cocoa base.
//
// Values come from the prototype's theme.jsx. Hairlines are translucent text
// rather than opaque grey, which is what keeps card edges from reading as
// boxes drawn on top of the page.

export const COLORS = {
  // Backgrounds
  bg: '#1B1815',           // deepest — the page
  bgInset: '#161310',      // wells, insets
  surface: '#25211C',      // cards
  surfaceRaised: '#2D2823', // sheets, elevated cards
  surfaceHi: '#332D26',    // icon tiles, pressed states
  bgInverted: '#F0E6D6',

  // Text
  text: '#F0E6D6',
  textMute: '#ADA192',
  textDim: '#766C5E',      // labels, kickers
  textInverted: '#0E1A0B',

  // Hairlines — translucent, never opaque grey
  hairline: 'rgba(240,230,214,0.08)',
  hairlineStrong: 'rgba(240,230,214,0.14)',

  // Sage — positive, "on track"
  primary: '#94AE82',
  primaryInk: '#0E1A0B',

  // Honey — upcoming, soft warning
  amber: '#D9A86A',
  amberInk: '#221703',

  // Terracotta — alert, overdue
  coral: '#CB7B5C',
  coralInk: '#1F0C03',

  // Plum — confidential, private
  plum: '#B89BC9',
  plumInk: '#180E22',

  // Semantic aliases
  ok: '#94AE82',
  warn: '#D9A86A',
  danger: '#CB7B5C',
  success: '#94AE82',
  info: '#B89BC9',
  disabled: '#766C5E',

  // Avatar swatches
  swatchA: '#94AE82',
  swatchB: '#D9A86A',
  swatchC: '#CB7B5C',
  swatchD: '#B89BC9',
  swatchE: '#7BA098',

  // Retained aliases so existing callers keep working.
  bgAlt: '#25211C',
  bgElevated: '#2D2823',
  textMuted: '#ADA192',
  border: 'rgba(240,230,214,0.08)',
  borderAlt: 'rgba(240,230,214,0.14)',
  confidential: '#B89BC9',
};

export const TYPE = {
  body: "'Inter Tight', -apple-system, system-ui, sans-serif",
  display: "'Instrument Sans', 'Inter Tight', -apple-system, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const RADIUS = { sm: 4, md: 8, lg: 12, xl: 16, xxl: 20, sheet: 24, full: 999 };

export const THEME = { colors: COLORS, type: TYPE, spacing: SPACING, radius: RADIUS };
