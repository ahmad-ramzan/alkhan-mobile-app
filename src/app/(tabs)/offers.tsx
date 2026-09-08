import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as offersService from '@/services/offers-service';
import { useAppTheme } from '@/state/theme-context';

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function OffersScreen() {
  const { colors } = useAppTheme();
  const [offers, setOffers] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offersService.listActiveOffers().then((list) => {
      setOffers(list);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={[styles.title, { color: colors.text }]}>Offers</Text>
      <FlatList
        data={offers}
        keyExtractor={(item, index) => item.code ?? String(index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No active offers right now.
          </Text>
        }
        renderItem={({ item }) => {
          const discountLabel =
            item.discount_type === 'Fixed Amount' ? `Rs. ${item.discount_value} OFF` : `${item.discount_value}% OFF`;
          const minOrder = Number(item.minimum_order_amount ?? 0);
          return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={styles.codeRow}>
                <Ionicons name="pricetag" size={16} color={colors.primary} />
                <Text style={[styles.code, { color: colors.primary }]}>{item.code}</Text>
              </View>
              <Text style={[styles.discount, { color: colors.text }]}>{discountLabel}</Text>
              {minOrder > 0 && (
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>
                  On orders above Rs. {minOrder.toFixed(0)}
                </Text>
              )}
              {(item.valid_from || item.valid_upto) && (
                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8 }}>
                  Valid {formatDate(item.valid_from)} – {formatDate(item.valid_upto)}
                </Text>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', textAlign: 'center', paddingVertical: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: { padding: 18, borderRadius: 16 },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  code: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  discount: { fontSize: 22, fontWeight: '800', marginTop: 10 },
});
