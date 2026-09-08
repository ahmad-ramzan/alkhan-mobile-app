import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/ui/primary-button';
import { CardShadow, Radius } from '@/constants/layout';
import * as mobileAuthService from '@/services/mobile-auth-service';
import { useAppTheme } from '@/state/theme-context';

export default function ProfileSettingsScreen() {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<Record<string, any>[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');

  const load = async () => {
    const [profile, addressList] = await Promise.all([
      mobileAuthService.getProfile(),
      mobileAuthService.listAddresses(),
    ]);
    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setPhone(profile.phone ?? '');
    setAddresses(addressList);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await mobileAuthService.updateProfile({ name, email });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async () => {
    if (!newLine1.trim() || !newCity.trim()) return;
    try {
      await mobileAuthService.addAddress({ addressLine1: newLine1.trim(), city: newCity.trim() });
      setDialogVisible(false);
      setNewLine1('');
      setNewCity('');
      const list = await mobileAuthService.listAddresses();
      setAddresses(list);
    } catch (e) {
      Alert.alert('Could not add address', e instanceof Error ? e.message : String(e));
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel title="NAME" />
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        />

        <SectionLabel title="EMAIL" />
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        />

        <SectionLabel title="PHONE" />
        <View style={[styles.input, styles.readonlyInput, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textSecondary }}>{phone || '—'}</Text>
        </View>

        <PrimaryButton label="Save Changes" onPress={save} loading={saving} />

        <View style={styles.addressesHeader}>
          <SectionLabel title="SAVED ADDRESSES" />
          <Pressable onPress={() => setDialogVisible(true)}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>
        {addresses.length === 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No saved addresses yet.</Text>
        ) : (
          addresses.map((addr) => (
            <View key={addr.name} style={[styles.addressCard, { backgroundColor: colors.surface }, CardShadow]}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>
                {addr.address_line1}, {addr.city}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={dialogVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Add Address</Text>
            <TextInput
              value={newLine1}
              onChangeText={setNewLine1}
              placeholder="Address"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <TextInput
              value={newCity}
              onChangeText={setNewCity}
              placeholder="City"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setDialogVisible(false)}>
                <Text style={{ color: colors.textSecondary, marginRight: 20 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={addAddress}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, fontWeight: '700', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, marginBottom: 6 },
  readonlyInput: { justifyContent: 'center' },
  addressesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: Radius.md, marginBottom: 10 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)', padding: 24 },
  dialog: { width: '100%', borderRadius: Radius.lg, padding: 22 },
  dialogTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});
