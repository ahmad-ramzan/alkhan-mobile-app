import { Platform } from 'react-native';

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const Gap = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Subtle elevation for cards/surfaces — tuned to read on both light and dark backgrounds. */
export const CardShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  android: { elevation: 4 },
  default: { boxShadow: '0 5px 16px rgba(0,0,0,0.15)' },
}) as object;

/** Stronger elevation for floating/sticky elements (footers, FABs). */
export const FloatingShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  android: { elevation: 8 },
  default: { boxShadow: '0 -2px 12px rgba(0,0,0,0.15)' },
}) as object;
