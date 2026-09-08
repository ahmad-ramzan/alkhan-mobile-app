import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

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
      style={[
        styles.button,
        outline
          ? { borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' }
          : { backgroundColor: colors.primary },
        isDisabled && styles.disabled,
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
