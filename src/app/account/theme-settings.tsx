import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Radius } from '@/constants/layout';
import { useAppTheme, type ThemeMode } from '@/state/theme-context';

const OPTIONS: { mode: ThemeMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: 'light', label: 'Light', description: 'Always use the light theme', icon: 'sunny-outline' },
  { mode: 'dark', label: 'Dark', description: 'Always use the dark theme', icon: 'moon-outline' },
  { mode: 'system', label: 'System', description: 'Match your device setting', icon: 'phone-portrait-outline' },
];

export default function ThemeSettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
      <Card style={styles.card}>
        {OPTIONS.map((option, index) => {
          const selected = option.mode === mode;
          return (
            <Pressable
              key={option.mode}
              style={[styles.row, index < OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
              onPress={() => setMode(option.mode)}>
              <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}1A` }]}>
                <Ionicons name={option.icon} size={17} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{option.label}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{option.description}</Text>
              </View>
              {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  iconBadge: { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
});
