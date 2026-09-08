import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Radius } from '@/constants/layout';
import { useAppTheme } from '@/state/theme-context';

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  outline,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  outline?: boolean;
}) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        outline
          ? { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' }
          : { backgroundColor: colors.primary },
        !outline && !isDisabled && styles.shadow,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : '#2A2007'} />
      ) : (
        <Text style={[styles.label, { color: outline ? colors.primary : '#2A2007' }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#E6BE50',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.32,
      shadowRadius: 12,
    },
    android: { elevation: 6 },
    default: {},
  }),
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
