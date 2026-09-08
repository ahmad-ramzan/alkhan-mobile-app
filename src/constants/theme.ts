import '@/global.css';

import { Platform } from 'react-native';

/**
 * AlKhan brand palette — ported from the source Flutter app's `app_theme.dart`.
 * `primary` and `textSecondary` are identical in both modes there.
 */
const primary = '#E6BE50'; // bright gold — was #C9A24A
const textSecondary = '#8E877C';

export const Colors = {
  light: {
    text: '#0E0E0E',
    textSecondary,
    background: '#F5F5F5',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E0E1E6',
    surface: '#FFFFFF',
    border: 'rgba(14, 14, 14, 0.1)',
    imagePlaceholder: '#E0E0E0',
    primary,
  },
  dark: {
    text: '#F5F1EA',
    textSecondary,
    background: '#0E0E0E',
    backgroundElement: '#1A1A18',
    backgroundSelected: '#2E3135',
    surface: '#1A1A18',
    border: 'rgba(245, 241, 234, 0.1)',
    imagePlaceholder: '#232320',
    primary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  default: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    display: 'PlayfairDisplay_600SemiBold',
    displayBold: 'PlayfairDisplay_700Bold',
  },
  web: {
    sans: 'Inter, system-ui, sans-serif',
    sansMedium: 'Inter, system-ui, sans-serif',
    sansSemiBold: 'Inter, system-ui, sans-serif',
    display: '"Playfair Display", Georgia, serif',
    displayBold: '"Playfair Display", Georgia, serif',
  },
})!;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
