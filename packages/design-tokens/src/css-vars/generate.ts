import { brandColors } from '../colors/brand';
import { semanticColors } from '../colors/semantic';
import { neutralColors } from '../colors/neutral';
import { surfaceColors } from '../colors/surface';
import { darkModeColors } from '../colors/dark-mode';
import { spacingScale } from '../spacing/scale';
import { fontFamilies } from '../typography/fonts';
import { fontSizes, kpiFontSizes, fontWeights, lineHeights } from '../typography/scale';
import { shadowElevation } from '../shadows/elevation';
import { borderRadius } from '../border-radius/scale';
import { zIndex } from '../z-index/scale';

export function generateCssVariables(): string {
  const lines: string[] = [':root {'];

  // Brand colors
  lines.push('  /* Brand Colors */');
  Object.entries(brandColors).forEach(([key, value]) => {
    lines.push(`  --color-brand-${key}: ${value};`);
  });

  // Semantic colors
  lines.push('\n  /* Semantic Colors */');
  Object.entries(semanticColors).forEach(([category, colors]) => {
    Object.entries(colors).forEach(([variant, value]) => {
      lines.push(`  --color-${category}-${variant}: ${value};`);
    });
  });

  // Neutral colors
  lines.push('\n  /* Neutral Colors */');
  Object.entries(neutralColors).forEach(([key, value]) => {
    lines.push(`  --color-neutral-${key}: ${value};`);
  });

  // Surface colors
  lines.push('\n  /* Surface Colors */');
  Object.entries(surfaceColors).forEach(([key, value]) => {
    lines.push(`  --color-surface-${key}: ${value};`);
  });

  // Dark mode colors
  lines.push('\n  /* Dark Mode Colors */');
  Object.entries(darkModeColors).forEach(([key, value]) => {
    lines.push(`  --color-dark-${key}: ${value};`);
  });

  // Spacing
  lines.push('\n  /* Spacing */');
  Object.entries(spacingScale).forEach(([key, value]) => {
    lines.push(`  --spacing-${key}: ${value};`);
  });

  // Typography
  lines.push('\n  /* Typography */');
  lines.push('  /* Font Families */');
  Object.entries(fontFamilies).forEach(([key, value]) => {
    lines.push(`  --font-family-${key}: ${value};`);
  });

  lines.push('  /* Font Sizes */');
  Object.entries(fontSizes).forEach(([key, value]) => {
    lines.push(`  --font-size-${key}: ${value};`);
  });

  lines.push('  /* KPI Font Sizes */');
  Object.entries(kpiFontSizes).forEach(([key, value]) => {
    lines.push(`  --font-size-kpi-${key}: ${value};`);
  });

  lines.push('  /* Font Weights */');
  Object.entries(fontWeights).forEach(([key, value]) => {
    lines.push(`  --font-weight-${key}: ${value};`);
  });

  lines.push('  /* Line Heights */');
  Object.entries(lineHeights).forEach(([key, value]) => {
    lines.push(`  --line-height-${key}: ${value};`);
  });

  // Shadows
  lines.push('\n  /* Shadows */');
  Object.entries(shadowElevation).forEach(([key, value]) => {
    lines.push(`  --shadow-${key}: ${value};`);
  });

  // Border Radius
  lines.push('\n  /* Border Radius */');
  Object.entries(borderRadius).forEach(([key, value]) => {
    lines.push(`  --radius-${key}: ${value};`);
  });

  // Z-Index
  lines.push('\n  /* Z-Index */');
  Object.entries(zIndex).forEach(([key, value]) => {
    lines.push(`  --z-${key}: ${value};`);
  });

  lines.push('}');

  // Dark mode
  lines.push('\n.dark {');
  lines.push('  /* Dark mode overrides */');
  lines.push('  --background: 222.2 84% 4.9%;');
  lines.push('  --foreground: 210 40% 98%;');
  lines.push('  --card: 222.2 84% 4.9%;');
  lines.push('  --card-foreground: 210 40% 98%;');
  lines.push('  --popover: 222.2 84% 4.9%;');
  lines.push('  --popover-foreground: 210 40% 98%;');
  lines.push('  --primary: 217.2 91.2% 59.8%;');
  lines.push('  --primary-foreground: 222.2 47.4% 11.2%;');
  lines.push('  --secondary: 217.2 32.6% 17.5%;');
  lines.push('  --secondary-foreground: 210 40% 98%;');
  lines.push('  --muted: 217.2 32.6% 17.5%;');
  lines.push('  --muted-foreground: 215 20.2% 65.1%;');
  lines.push('  --accent: 217.2 32.6% 17.5%;');
  lines.push('  --accent-foreground: 210 40% 98%;');
  lines.push('  --destructive: 0 62.8% 30.6%;');
  lines.push('  --destructive-foreground: 210 40% 98%;');
  lines.push('  --border: 217.2 32.6% 17.5%;');
  lines.push('  --input: 217.2 32.6% 17.5%;');
  lines.push('  --ring: 224.3 76.3% 48%;');
  lines.push('}');

  return lines.join('\n');
}