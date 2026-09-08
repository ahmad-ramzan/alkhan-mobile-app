import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import * as reservationService from '@/services/reservation-service';
import { useAppTheme } from '@/state/theme-context';

const STATUS_COLORS: Record<string, string> = {
  Confirmed: '#4CAF7D',
  Pending: '#E0A93B',
  Cancelled: '#E06B6B',
  Completed: '#8E877C',
};

export default function MyReservationsScreen() {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Record<string, any>[]>([]);

  const load = () => {
    reservationService.listMyReservations().then((list) => {
      setReservations(list);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const cancel = (reservation: string) => {
    Alert.alert('Cancel Reservation', 'Are you sure you want to cancel this reservation?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await reservationService.cancelReservation(reservation);
            load();
          } catch (e) {
            Alert.alert('Could not cancel', e instanceof Error ? e.message : String(e));
          }
        },
      },
    ]);
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
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="No reservations yet" message="Book a table from the Reserve tab." />
        }
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status] ?? colors.textSecondary;
          const canCancel = item.status === 'Pending' || item.status === 'Confirmed';
          return (
            <Card>
              <View style={styles.rowBetween}>
                <Text style={[styles.branch, { color: colors.text }]}>{item.branch}</Text>
                <View style={[styles.badge, { backgroundColor: `${statusColor}26` }]}>
                  <Text style={{ color: statusColor, fontSize: 11, fontWeight: '700' }}>{item.status}</Text>
                </View>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8 }}>
                {item.reservation_date} · {item.reservation_time} · Party of {item.party_size}
              </Text>
              {!!item.occasion && (
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{item.occasion}</Text>
              )}
              {canCancel && (
                <Pressable style={styles.cancelButton} onPress={() => cancel(item.name)}>
                  <Text style={{ color: '#E06B6B', fontSize: 12, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
              )}
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  branch: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  cancelButton: { alignSelf: 'flex-start', marginTop: 12 },
});
