export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

export const kpiFontSizes = {
  xs: '0.875rem',
  sm: '1rem',
  base: '1.25rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem',
  '3xl': '3rem',
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.75',
} as const;

export type FontSizes = typeof fontSizes;
export type KpiFontSizes = typeof kpiFontSizes;
export type FontWeights = typeof fontWeights;
export type LineHeights = typeof lineHeights;