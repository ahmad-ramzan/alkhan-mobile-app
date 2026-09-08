import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
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
      <Text style={[styles.title, { color: colors.text }]}>Account</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <View style={[styles.avatarRing, { borderColor: colors.primary }]}>
            <View style={[styles.avatar, { backgroundColor: colors.background }]}>
              <Ionicons name="person" size={26} color={colors.primary} />
            </View>
          </View>
          {isLoggedIn ? (
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{customerName ?? 'Customer'}</Text>
              {!!phone && <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{phone}</Text>}
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>Guest</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12.5, marginTop: 2 }}>
                Sign in to order faster
              </Text>
            </View>
          )}
          {!isLoggedIn && (
            <Pressable
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/auth/otp-login')}>
              <Text style={styles.signInButtonText}>Sign In</Text>
            </Pressable>
          )}
        </Card>

        {isLoggedIn && (
          <View style={styles.sectionGroup}>
            <SectionLabel title="ACTIVITY" />
            <Card style={styles.section}>
              <SettingRow icon="receipt-outline" label="My Orders" onPress={() => router.push('/account/order-history')} />
              <SettingRow icon="heart-outline" label="Favorites" onPress={() => router.push('/account/favorites')} />
              <SettingRow
                icon="calendar-outline"
                label="Reservations"
                onPress={() => router.push('/account/my-reservations')}
              />
              <SettingRow icon="star-outline" label="My Reviews" onPress={() => router.push('/account/my-reviews')} last />
            </Card>
          </View>
        )}

        <View style={styles.sectionGroup}>
          <SectionLabel title="SETTINGS" />
          <Card style={styles.section}>
            {isLoggedIn && (
              <SettingRow
                icon="person-outline"
                label="Profile Settings"
                onPress={() => router.push('/account/profile-settings')}
              />
            )}
            <SettingRow icon="pricetag-outline" label="Offers" onPress={() => router.push('/offers')} />
            <SettingRow
              icon="color-palette-outline"
              label="Appearance"
              onPress={() => router.push('/account/theme-settings')}
              last
            />
          </Card>
        </View>

        {isLoggedIn && (
          <View style={styles.sectionGroup}>
            <Card style={styles.section}>
              <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleSignOut} destructive last />
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title}</Text>;
}

function SettingRow({
  icon,
  label,
  onPress,
  destructive,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  const tint = destructive ? '#E06B6B' : colors.primary;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        pressed && { opacity: 0.6 },
      ]}
      onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={17} color={tint} />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? tint : colors.text }]}>{label}</Text>
      {!destructive && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', fontFamily: Fonts.sansSemiBold, textAlign: 'center', paddingVertical: 16 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '700', fontFamily: Fonts.displayBold },
  signInButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.sm },
  signInButtonText: { color: '#2A2007', fontSize: 12.5, fontWeight: '700' },
  sectionGroup: { marginTop: 24 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.2, fontWeight: '700', marginBottom: 10, marginLeft: 4 },
  section: { padding: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  rowIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
});
