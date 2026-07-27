export const fontFamilies = {
  sans: 'IBM Plex Sans, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',
  condensed: 'IBM Plex Sans Condensed, system-ui, sans-serif',
} as const;

export type FontFamilies = typeof fontFamilies;