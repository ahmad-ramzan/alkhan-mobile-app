import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CardShadow, Radius } from '@/constants/layout';
import { useAppTheme } from '@/state/theme-context';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface }, CardShadow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: 16,
  },
});
