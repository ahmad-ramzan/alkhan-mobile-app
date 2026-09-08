import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, type ThemeMode } from '@/state/theme-context';

const OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'Light', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
  { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function ThemeSettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {OPTIONS.map((option) => {
        const selected = option.mode === mode;
        return (
          <Pressable
            key={option.mode}
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => setMode(option.mode)}>
            <Ionicons name={option.icon} size={20} color={colors.textSecondary} />
            <Text style={{ flex: 1, color: colors.text, fontSize: 14, marginLeft: 14 }}>{option.label}</Text>
            {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
