import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import * as mobileAuthService from '@/services/mobile-auth-service';
import { useAppTheme } from '@/state/theme-context';

export default function OrderHistoryScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    mobileAuthService.getOrderHistory().then((list) => {
      setOrders(list);
      setLoading(false);
    });
  }, []);

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
        data={orders}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            You haven't placed any orders yet.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => router.push({ pathname: '/account/order/[invoice]', params: { invoice: item.name } })}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.invoice, { color: colors.text }]}>{item.name}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {item.posting_date} · {item.status}
              </Text>
            </View>
            <Text style={[styles.total, { color: colors.text }]}>Rs {Number(item.grand_total ?? 0).toFixed(0)}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12 },
  invoice: { fontSize: 14, fontWeight: '700' },
  total: { fontSize: 14, fontWeight: '700' },
});
