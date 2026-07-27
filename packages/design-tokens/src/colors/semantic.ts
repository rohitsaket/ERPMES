export const semanticColors = {
  planning: {
    light: '#3b82f6',
    dark: '#60a5fa',
    bg: 'hsl(var(--color-planning-bg))',
    text: 'hsl(var(--color-planning-text))',
    border: 'hsl(var(--color-planning-border))',
  },
  active: {
    light: '#0ea5e9',
    dark: '#38bdf8',
    bg: 'hsl(var(--color-active-bg))',
    text: 'hsl(var(--color-active-text))',
    border: 'hsl(var(--color-active-border))',
  },
  success: {
    light: '#22c55e',
    dark: '#4ade80',
    bg: 'hsl(var(--color-success-bg))',
    text: 'hsl(var(--color-success-text))',
    border: 'hsl(var(--color-success-border))',
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24',
    bg: 'hsl(var(--color-warning-bg))',
    text: 'hsl(var(--color-warning-text))',
    border: 'hsl(var(--color-warning-border))',
  },
  danger: {
    light: '#ef4444',
    dark: '#f87171',
    bg: 'hsl(var(--color-danger-bg))',
    text: 'hsl(var(--color-danger-text))',
    border: 'hsl(var(--color-danger-border))',
  },
  blocked: {
    light: '#f97316',
    dark: '#fb923c',
    bg: 'hsl(var(--color-blocked-bg))',
    text: 'hsl(var(--color-blocked-text))',
    border: 'hsl(var(--color-blocked-border))',
  },
  certified: {
    light: '#a855f7',
    dark: '#c084fc',
    bg: 'hsl(var(--color-certified-bg))',
    text: 'hsl(var(--color-certified-text))',
    border: 'hsl(var(--color-certified-border))',
  },
};

export type SemanticColors = typeof semanticColors;