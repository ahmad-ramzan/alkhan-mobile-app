import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { PrimaryButton } from '@/components/ui/primary-button';
import { FloatingShadow, Radius } from '@/constants/layout';
import { Fonts } from '@/constants/theme';
import * as mobileAuthService from '@/services/mobile-auth-service';
import * as reservationService from '@/services/reservation-service';
import { useAppTheme } from '@/state/theme-context';

const PARTY_SIZES = ['2', '3', '4', '6', '8+'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];

function formatTimeLabel(time: string) {
  const [h, m] = time.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function ReservationScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date;
    });
  }, []);

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(dateOptions[0]);
  const [selectedTime, setSelectedTime] = useState('20:00');
  const [partySize, setPartySize] = useState('4');
  const [occasion, setOccasion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reservationService.getBranches().then((list) => {
      setBranches(list);
      setSelectedBranch(list[0] ?? null);
      setLoading(false);
    });
  }, []);

  const dateLabel = `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]}`;
  const timeLabel = formatTimeLabel(selectedTime);
  const partySizeValue = partySize === '8+' ? 8 : Number(partySize);

  const confirmReservation = async () => {
    if (!selectedBranch) return;

    const loggedIn = await mobileAuthService.isLoggedIn();
    if (!loggedIn) {
      router.push('/auth/otp-login');
      return;
    }

    setSubmitting(true);
    try {
      await reservationService.createReservation({
        branch: selectedBranch,
        reservationDate: selectedDate,
        reservationTime: `${selectedTime}:00`,
        partySize: partySizeValue,
        occasion: occasion.trim(),
      });
      Alert.alert('Reserved', `Table reserved for ${dateLabel}, ${timeLabel}`);
      setOccasion('');
    } catch (e) {
      Alert.alert('Could not reserve', e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[styles.title, { color: colors.text }]}>Reserve a table</Text>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel title="BRANCH" />
        <Card style={styles.card}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
            {selectedBranch ?? 'No branch available'}
          </Text>
        </Card>

        <SectionLabel title="DATE" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {dateOptions.map((date) => (
            <Chip
              key={date.toISOString()}
              label={`${WEEKDAYS[date.getDay()]} ${date.getDate()}`}
              selected={date.toDateString() === selectedDate.toDateString()}
              onPress={() => setSelectedDate(date)}
            />
          ))}
        </ScrollView>

        <SectionLabel title="TIME" />
        <View style={styles.wrapRow}>
          {TIME_SLOTS.map((time) => (
            <Chip key={time} label={formatTimeLabel(time)} selected={time === selectedTime} onPress={() => setSelectedTime(time)} />
          ))}
        </View>

        <SectionLabel title="PARTY SIZE" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {PARTY_SIZES.map((size) => (
            <Chip key={size} label={size} selected={size === partySize} onPress={() => setPartySize(size)} />
          ))}
        </ScrollView>

        <SectionLabel title="OCCASION · OPTIONAL" />
        <TextInput
          value={occasion}
          onChangeText={setOccasion}
          placeholder="Birthday, anniversary, business..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.textInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 20 },
          FloatingShadow,
        ]}>
        <PrimaryButton
          label={`Confirm · ${dateLabel}, ${timeLabel}`}
          onPress={confirmReservation}
          loading={submitting}
          disabled={!selectedBranch}
        />
      </View>
    </SafeAreaView>
  );
}

function SectionLabel({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', fontFamily: Fonts.displayBold, textAlign: 'center', paddingVertical: 18 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  sectionLabel: { fontSize: 11.5, letterSpacing: 1.2, fontWeight: '700', marginBottom: 12 },
  card: { marginBottom: 24 },
  chipRow: { gap: 10, paddingBottom: 24 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  textInput: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14 },
  footer: { padding: 20, borderTopWidth: StyleSheet.hairlineWidth },
});
