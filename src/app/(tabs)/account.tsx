import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/state/auth-context';
import { useAppTheme } from '@/state/theme-context';

export default function AccountScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { isLoggedIn, customerName, phone, logout } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
          {isLoggedIn ? (
            <View>
              <Text style={[styles.name, { color: colors.text }]}>{customerName ?? 'Customer'}</Text>
              {!!phone && <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{phone}</Text>}
            </View>
          ) : (
            <View>
              <Text style={[styles.name, { color: colors.text }]}>Guest</Text>
              <Pressable onPress={() => router.push('/auth/otp-login')}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 }}>Sign In</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          {isLoggedIn && (
            <>
              <SettingRow icon="receipt-outline" label="My Orders" onPress={() => router.push('/account/order-history')} />
              <SettingRow icon="heart-outline" label="Favorites" onPress={() => router.push('/account/favorites')} />
              <SettingRow
                icon="calendar-outline"
                label="Reservations"
                onPress={() => router.push('/account/my-reservations')}
              />
              <SettingRow icon="star-outline" label="My Reviews" onPress={() => router.push('/account/my-reviews')} />
              <SettingRow
                icon="person-outline"
                label="Profile Settings"
                onPress={() => router.push('/account/profile-settings')}
              />
            </>
          )}
          <SettingRow icon="pricetag-outline" label="Offers" onPress={() => router.push('/offers')} />
          <SettingRow
            icon="color-palette-outline"
            label="Appearance"
            onPress={() => router.push('/account/theme-settings')}
          />
          {isLoggedIn && <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleSignOut} destructive />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors } = useAppTheme();
  const color = destructive ? '#E06B6B' : colors.text;
  return (
    <Pressable style={[styles.row, { borderBottomColor: colors.border }]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={destructive ? '#E06B6B' : colors.textSecondary} />
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      {!destructive && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '700' },
  section: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
});
