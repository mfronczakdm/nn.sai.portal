/**
 * Standard CSS custom properties every theme should define.
 *
 * Components and Tailwind `@theme` utilities rely on these names.
 * Themes may define additional tokens (scales, semantic extras) freely —
 * put extras in the same theme CSS file or `*-tokens.css` companion.
 *
 * Values live in CSS (`src/assets/styles/themes/`), not here.
 * This list is the human/agent checklist when creating or reviewing a theme.
 */

/** Required for portal / shadcn-style UI */
export const STANDARD_COLOR_TOKENS = [
  '--color-background',
  '--color-foreground',
  '--color-card',
  '--color-card-foreground',
  '--color-popover',
  '--color-popover-foreground',
  '--color-primary',
  '--color-primary-foreground',
  '--color-primary-hover',
  '--color-secondary',
  '--color-secondary-foreground',
  '--color-secondary-hover',
  '--color-muted',
  '--color-muted-foreground',
  '--color-accent',
  '--color-accent-foreground',
  '--color-destructive',
  '--color-destructive-hover',
  '--color-destructive-foreground',
  '--color-border',
  '--color-input',
  '--color-ring',
  '--color-tertiary',
  '--color-tertiary-foreground',
  '--color-tertiary-hover',
  '--color-dark',
  '--color-dark-foreground',
  '--color-dark-hover',
  '--color-light',
  '--color-light-hover',
  '--color-light-foreground',
  '--color-overlay',
] as const;

/** Optional but commonly set */
export const STANDARD_GRADIENT_TOKENS = [
  '--background-image-gradient',
  '--background-image-gradient-secondary',
] as const;

/**
 * Typography is set on `html[data-theme]` (see themes/fonts.css).
 * Font files themselves are loaded in `src/app/layout.tsx` via next/font.
 */
export const STANDARD_FONT_TOKENS = [
  '--font-body',
  '--font-heading',
  '--font-accent',
  '--font-weight-heading',
] as const;

export const STANDARD_THEME_TOKENS = [
  ...STANDARD_COLOR_TOKENS,
  ...STANDARD_GRADIENT_TOKENS,
  ...STANDARD_FONT_TOKENS,
] as const;

export type StandardThemeToken = (typeof STANDARD_THEME_TOKENS)[number];
