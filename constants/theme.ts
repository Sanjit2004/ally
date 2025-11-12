/**
 * Warm, trustworthy, and emotionally intelligent color palette
 * Theme: "soft purple dusk with amber glow"
 */

import { Platform } from 'react-native';

// Primary palette
export const PrimaryColors = {
  primary: '#6C63FF',      // soft lavender-indigo
  secondary: '#A594F9',    // gentle purple
  accent: '#F9A826',       // warm amber
  background: '#F8F9FC',    // very light neutral
  surface: '#FFFFFF',       // clean white
  textPrimary: '#1E1E2E',   // deep slate
  textSecondary: '#6B7280', // soft gray
  success: '#4ADE80',       // natural green
  error: '#F87171',         // muted coral
};

// Dark mode variants (tinted, not pure black/white)
const tintColorLight = PrimaryColors.primary;
const tintColorDark = PrimaryColors.secondary;

export const Colors = {
  light: {
    text: PrimaryColors.textPrimary,
    background: PrimaryColors.background,
    tint: PrimaryColors.primary,
    secondary: PrimaryColors.secondary,
    accent: PrimaryColors.accent,
    surface: PrimaryColors.surface,
    icon: PrimaryColors.textSecondary,
    tabIconDefault: PrimaryColors.textSecondary,
    tabIconSelected: PrimaryColors.primary,
    success: PrimaryColors.success,
    error: PrimaryColors.error,
  },
  dark: {
    text: '#E5E7EB',           // light gray (tinted)
    background: '#1A1B23',     // dark slate (tinted, not pure black)
    tint: PrimaryColors.secondary,
    secondary: PrimaryColors.primary,
    accent: PrimaryColors.accent,
    surface: '#252631',        // dark surface (tinted)
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: PrimaryColors.secondary,
    success: PrimaryColors.success,
    error: PrimaryColors.error,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
